import express from "express";
import cors from "cors";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sendOrderToDiscord } from "./discord.js";

const app = express();

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const counterFile = path.join(
  __dirname,
  "order-counter.json"
);

function getNextForumNumber() {
  let data = {
    nextForumNumber: 1,
  };

  try {
    if (fs.existsSync(counterFile)) {
      data = JSON.parse(
        fs.readFileSync(counterFile, "utf8")
      );
    }
  } catch (error) {
    console.error(
      "Fehler beim Lesen der Forum-Nummer:",
      error
    );
  }

  const forumNumber =
    Number(data.nextForumNumber) || 1;

  data.nextForumNumber = forumNumber + 1;

  fs.writeFileSync(
    counterFile,
    JSON.stringify(data, null, 2)
  );

  return forumNumber;
}

app.post("/api/orders", async (req, res) => {
  try {
    const {
      id,
      staff_name,
      note,
      items,
      total,
      item_count,
    } = req.body;

    if (!staff_name) {
      return res.status(400).json({
        error: "Mitarbeiter fehlt.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Keine Artikel vorhanden.",
      });
    }

    // Zufällige Bestellnummer: z.B. 7281
    const orderNumber =
      Math.floor(1000 + Math.random() * 9000);

    // Fortlaufende Forum-Nummer: 1, 2, 3, ...
    // Wird dauerhaft in order-counter.json gespeichert.
    const forumNumber = getNextForumNumber();

    const order = {
      id,

      order_number: orderNumber,
      forum_number: forumNumber,

      staff_name: staff_name.trim(),
      note: note?.trim() || "",

      items,
      total,
      item_count,

      created_date: new Date().toISOString(),
    };

    await sendOrderToDiscord(order);

    res.json({
      success: true,
      order_number: orderNumber,
      forum_number: forumNumber,
    });
  } catch (error) {
    console.error(
      "Fehler beim Erstellen der Bestellung:",
      error
    );

    res.status(500).json({
      error:
        error.message ||
        "Bestellung konnte nicht erstellt werden.",
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(
    `Backend läuft auf Port ${PORT}`
  );
});