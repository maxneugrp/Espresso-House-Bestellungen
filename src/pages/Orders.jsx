import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  Package,
  Euro,
  Inbox,
  Clock,
  User,
  StickyNote,
} from "lucide-react";
import { fmt } from "@/lib/format";

const ORDERS_STORAGE_KEY = "espresso-house-orders";

function getOrders() {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const orders = JSON.parse(stored);

    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);

    try {
      const data = getOrders();

      data.sort(
        (a, b) =>
          new Date(b.created_date || 0) -
          new Date(a.created_date || 0)
      );

      setOrders(data);
    } catch (e) {
      console.error(e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const handleStorage = () => {
      load();
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const totalOrders = orders.length;

  const totalItems = orders.reduce(
    (sum, order) => sum + (Number(order.item_count) || 0),
    0
  );

  const totalRevenue = orders.reduce(
    (sum, order) => sum + (Number(order.total) || 0),
    0
  );

  const stats = [
    {
      label: "Bestellungen",
      value: String(totalOrders),
      icon: ShoppingBag,
    },
    {
      label: "Artikel gesamt",
      value: String(totalItems),
      icon: Package,
    },
    {
      label: "Umsatz",
      value: fmt(totalRevenue),
      icon: Euro,
    },
  ];

  return (
    <div>
      <h2 className="font-display text-3xl sm:text-4xl font-semibold text-cafe-charcoal">
        Bestellungen
      </h2>

      <p className="text-sm text-cafe-muted mt-1">
        Alle geloggten Bestellungen im Überblick.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-cafe-line shadow-sm p-5 flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-cafe-cream flex items-center justify-center">
                <Icon className="w-5 h-5 text-cafe-coffee" />
              </div>

              <div>
                <div className="text-[11px] tracking-widest text-cafe-muted uppercase font-medium">
                  {stat.label}
                </div>

                <div className="font-display text-2xl font-semibold text-cafe-charcoal mt-0.5">
                  {stat.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-cafe-line shadow-sm">
        <div className="px-5 py-4 border-b border-cafe-line">
          <h3 className="font-display text-lg font-semibold text-cafe-charcoal">
            Bestell-Log
          </h3>
        </div>

        {loading ? (
          <div className="p-8">
            <div className="h-16 rounded-xl bg-cafe-cream/60 animate-pulse" />
          </div>
        ) : orders.length === 0 ? (
          <div className="px-5 py-16 flex flex-col items-center text-center">
            <Inbox className="w-10 h-10 text-cafe-tan mb-3" />

            <p className="text-cafe-muted">
              Noch keine Bestellungen geloggt.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-cafe-line">
            {orders.map((order, index) => (
              <li
                key={order.id || `${order.created_date}-${index}`}
                className="px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-cafe-muted">
                      <Clock className="w-3.5 h-3.5" />

                      {order.created_date
                        ? new Date(
                            order.created_date
                          ).toLocaleString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </div>

                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {(order.items || []).map((item, itemIndex) => (
                        <span
                          key={`${item.name}-${itemIndex}`}
                          className="inline-flex items-center text-xs bg-cafe-cream text-cafe-charcoal rounded-full px-2.5 py-1"
                        >
                          {item.quantity}× {item.name}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-cafe-muted">
                      {order.staff_name ? (
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {order.staff_name}
                        </span>
                      ) : null}

                      {order.note ? (
                        <span className="inline-flex items-center gap-1">
                          <StickyNote className="w-3 h-3" />
                          {order.note}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-display text-lg font-semibold text-cafe-charcoal">
                      {fmt(order.total)}
                    </div>

                    <div className="text-xs text-cafe-muted">
                      {order.item_count || 0} Artikel
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}