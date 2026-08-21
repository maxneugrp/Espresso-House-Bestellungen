function fmtEUR(n) {
  return (
    (Number(n) || 0)
      .toFixed(2)
      .replace(".", ",") + " €"
  );
}

function buildOrderEmbed(order) {
  const items = order.items || [];

  const lines = items.map(
    (item) =>
      `${item.quantity}× **${item.name}** — ${fmtEUR(
        Number(item.price || 0) * Number(item.quantity || 0)
      )}`
  );

  return {
    color: 0xbba38e,

    fields: [
      {
        name: "Zuständiger Mitarbeiter",
        value: order.staff_name || "—",
        inline: false,
      },
      {
        name: "Bestellnummer",
        value: `#${order.order_number || "—"}`,
        inline: false,
      },
      {
        name: "Artikel",
        value: lines.join("\n") || "—",
        inline: false,
      },
      {
        name: "Summe",
        value: `**${fmtEUR(order.total)}**`,
        inline: false,
      },
    ],

    footer: {
      text: "Espresso House · GermanRP · Bestellungen",
    },

    timestamp: new Date().toISOString(),
  };
}

async function sendOrderToDiscord(order, env) {
  const webhookUrl = env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("DISCORD_WEBHOOK_URL fehlt.");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      username: "Espresso House",

      thread_name: `Bestellung - ${order.forum_number || order.order_number}`,

      embeds: [buildOrderEmbed(order)],
    }),
  });

  if (!response.ok) {
    const error = await response.text();

    console.error(
      "Discord Fehler:",
      response.status,
      error
    );

    throw new Error(
      `Discord konnte die Bestellung nicht erstellen. HTTP ${response.status}`
    );
  }

  return true;
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      // CORS
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      if (
        request.method === "POST" &&
        url.pathname === "/api/orders"
      ) {
        const order = await request.json();

        await sendOrderToDiscord(order, env);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Bestellung erfolgreich gesendet.",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: "Route nicht gefunden",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error) {
      console.error("API Fehler:", error);

      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || "Unbekannter Fehler",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};