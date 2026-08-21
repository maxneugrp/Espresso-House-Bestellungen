import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Coffee,
  Plus,
  Minus,
  ClipboardList,
  Send,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { getMenuItems } from "@/lib/menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const ORDERS_STORAGE_KEY = "espresso-house-orders";
const API_URL =
  "https://espresso-house-api.maxneugrp.workers.dev/api/orders";

const fmt = (n) =>
  (Number(n) || 0).toFixed(2).replace(".", ",") + " €";

const CATEGORY_ORDER = [
  "Kaffee",
  "Kalte Kaffeespezialitäten",
  "Tee & Heissgetränke",
  "Gebäck & Süßes",
  "Frische Säfte",
  "Spezial",
];

const categoryLabel = (cat) =>
  cat.toUpperCase().replace(/\s/g, " ");

function generateId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function generateOrderNumber() {
  return Math.floor(
    Math.random() * 9001
  ) + 1000;
}

function saveOrder(order) {
  try {
    const stored = localStorage.getItem(
      ORDERS_STORAGE_KEY
    );

    const orders = stored ? JSON.parse(stored) : [];

    const updatedOrders = Array.isArray(orders)
      ? [...orders, order]
      : [order];

    localStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify(updatedOrders)
    );
  } catch (error) {
    console.error(
      "Fehler beim Speichern der Bestellung:",
      error
    );
  }
}

export default function NewOrder() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState([]);
  const [staff, setStaff] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadItems = async () => {
    setLoading(true);

    try {
      const data = getMenuItems();

      data.sort(
        (a, b) =>
          new Date(b.created_date || 0) -
          new Date(a.created_date || 0)
      );

      setItems(data);
    } catch (e) {
      toast({
        title: "Fehler beim Laden",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const addToOrder = (item) => {
    setOrder((prev) => {
      const existing = prev.find(
        (orderItem) => orderItem.id === item.id
      );

      if (existing) {
        return prev.map((orderItem) =>
          orderItem.id === item.id
            ? {
                ...orderItem,
                quantity: orderItem.quantity + 1,
              }
            : orderItem
        );
      }

      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: Number(item.price) || 0,
          quantity: 1,
        },
      ];
    });
  };

  const changeQty = (id, delta) => {
    setOrder((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity + delta,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeLine = (id) => {
    setOrder((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const total = order.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const count = order.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const grouped = useMemo(() => {
    const map = {};

    items.forEach((item) => {
      if (!map[item.category]) {
        map[item.category] = [];
      }

      map[item.category].push(item);
    });

    return map;
  }, [items]);

  const qtyInOrder = (id) =>
    order.find((item) => item.id === id)?.quantity || 0;

  const handleLog = async () => {
    if (order.length === 0) {
      toast({
        title: "Keine Artikel",
        description:
          "Wähle zuerst Artikel aus der Speisekarte.",
      });
      return;
    }

    if (!staff.trim()) {
      toast({
        title: "Mitarbeiter fehlt",
        description:
          "Bitte einen zuständigen Mitarbeiter eintragen.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const orderNumber = generateOrderNumber();

      const payload = {
        id: generateId(),
        order_number: orderNumber,
        created_date: new Date().toISOString(),
        staff_name: staff.trim(),
        note: note.trim(),

        items: order.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),

        total,
        item_count: count,
      };

      const response = await fetch(API_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const result = await response
  .json()
  .catch(() => ({}));

if (!response.ok) {
  throw new Error(
    result.error ||
      "Die Bestellung konnte nicht gesendet werden."
  );
}

      saveOrder({
        ...payload,
        order_number:
          result.order_number || orderNumber,
      });

      const finalOrderNumber =
        result.order_number || orderNumber;

      toast({
        title: "Bestellung geloggt",
        description: `Bestellung #${finalOrderNumber} wurde erfolgreich erstellt.`,
      });

      setOrder([]);
      setStaff("");
      setNote("");
    } catch (e) {
      console.error(
        "Fehler beim Loggen:",
        e
      );

      toast({
        title: "Fehler beim Loggen",
        description:
          e?.message || "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      <div>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-cafe-charcoal">
          Neue Bestellung
        </h2>

        <p className="text-sm text-cafe-muted mt-1">
          Tippe auf Artikel, um sie zur Bestellung
          hinzuzufügen.
        </p>

        {loading ? (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-white/60 animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-cafe-line bg-white p-8 text-center">
            <Coffee className="w-8 h-8 mx-auto text-cafe-tan mb-3" />

            <p className="text-sm text-cafe-muted">
              Noch keine Artikel in der Speisekarte.
            </p>

            <Link
              to="/speisekarte"
              className="inline-flex items-center mt-4 text-sm text-cafe-coffee hover:text-cafe-charcoal"
            >
              Speisekarte verwalten
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {CATEGORY_ORDER.filter(
              (category) => grouped[category]?.length
            ).map((category) => (
              <section key={category}>
                <h3 className="text-xs font-semibold tracking-[0.35em] text-cafe-tan uppercase mb-4">
                  {categoryLabel(category)}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {grouped[category].map((item) => {
                    const quantity = qtyInOrder(item.id);

                    return (
                      <button
                        key={item.id}
                        onClick={() =>
                          addToOrder(item)
                        }
                        className={cn(
                          "group relative text-left bg-white rounded-2xl border p-4 transition-all hover:shadow-md hover:-translate-y-0.5",
                          quantity > 0
                            ? "border-cafe-tan ring-1 ring-cafe-tan/40"
                            : "border-cafe-line"
                        )}
                      >
                        <div className="w-9 h-9 rounded-full bg-cafe-cream flex items-center justify-center mb-3">
                          <Coffee className="w-4 h-4 text-cafe-coffee" />
                        </div>

                        <div className="font-medium text-cafe-charcoal text-sm leading-snug">
                          {item.name}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-display text-cafe-charcoal font-semibold">
                            {fmt(item.price)}
                          </span>

                          {quantity > 0 && (
                            <span className="ml-2 w-6 h-6 rounded-full bg-cafe-coffee text-cafe-cream text-xs font-semibold flex items-center justify-center">
                              {quantity}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-28 self-start">
        <div className="bg-white rounded-2xl border border-cafe-line shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <ClipboardList className="w-5 h-5 text-cafe-coffee" />

            <h3 className="font-display text-lg font-semibold text-cafe-charcoal">
              Bestellzettel
            </h3>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Zuständiger Mitarbeiter"
              value={staff}
              onChange={(e) =>
                setStaff(e.target.value)
              }
              className="bg-cafe-cream/50 border-cafe-line"
            />

            <Textarea
              placeholder="Notiz (optional)"
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
              rows={2}
              className="bg-cafe-cream/50 border-cafe-line resize-none"
            />
          </div>

          <div className="mt-4 min-h-[120px] rounded-xl border border-dashed border-cafe-line bg-cafe-cream/40 p-3">
            {order.length === 0 ? (
              <p className="text-sm text-cafe-muted text-center py-6">
                Noch nichts ausgewählt
              </p>
            ) : (
              <ul className="space-y-2">
                {order.map((line) => (
                  <li
                    key={line.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() =>
                          changeQty(
                            line.id,
                            -1
                          )
                        }
                        className="w-6 h-6 rounded-full border border-cafe-line flex items-center justify-center hover:bg-cafe-coffee hover:text-cafe-cream transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-5 text-center font-medium text-cafe-charcoal">
                        {line.quantity}
                      </span>

                      <button
                        onClick={() =>
                          changeQty(
                            line.id,
                            1
                          )
                        }
                        className="w-6 h-6 rounded-full border border-cafe-line flex items-center justify-center hover:bg-cafe-coffee hover:text-cafe-cream transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="flex-1 text-cafe-charcoal truncate">
                      {line.name}
                    </span>

                    <span className="text-cafe-charcoal font-medium shrink-0">
                      {fmt(
                        line.price *
                          line.quantity
                      )}
                    </span>

                    <button
                      onClick={() =>
                        removeLine(line.id)
                      }
                      className="text-cafe-muted hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-cafe-line pt-4">
            <span className="text-sm text-cafe-muted">
              {count} Artikel
            </span>

            <span className="font-display text-xl font-semibold text-cafe-charcoal">
              {fmt(total)}
            </span>
          </div>

          <Button
            onClick={handleLog}
            disabled={
              submitting ||
              order.length === 0
            }
            className="mt-4 w-full bg-cafe-tan hover:bg-cafe-tan/90 text-cafe-charcoal font-medium rounded-full h-11 disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />

            {submitting
              ? "Wird gesendet…"
              : "Bestellung loggen"}
          </Button>

          <Link
            to="/bestellungen"
            className="mt-3 flex items-center justify-center gap-1 text-xs text-cafe-muted hover:text-cafe-charcoal transition-colors"
          >
            Alle Bestellungen ansehen
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </aside>
    </div>
  );
}