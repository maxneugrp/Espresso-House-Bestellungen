const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

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
        Number(item.price || 0) *
          Number(item.quantity || 0)
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
        value: `#${order.order_number}`,
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
      text:
        "Espresso House · GermanRP · Bestellungen",
    },

    timestamp: new Date().toISOString(),
  };
}

export async function sendOrderToDiscord(order) {
  if (!WEBHOOK_URL) {
    throw new Error(
      "DISCORD_WEBHOOK_URL fehlt."
    );
  }

  const response = await fetch(WEBHOOK_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      username: "Espresso House",

      thread_name: `Bestellung - ${order.forum_number}`,

      embeds: [
        buildOrderEmbed(order),
      ],
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
      "Discord konnte die Bestellung nicht erstellen."
    );
  }

  return true;
}