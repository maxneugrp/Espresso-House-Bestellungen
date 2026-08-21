import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Coffee, Plus, ClipboardList, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Neue Bestellung", path: "/", icon: Plus },
  { label: "Bestellungen", path: "/bestellungen", icon: ClipboardList },
  { label: "Speisekarte", path: "/speisekarte", icon: BookOpen },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-cafe-cream dot-grid">
      <header className="sticky top-0 z-40 bg-cafe-cream/85 backdrop-blur-md border-b border-cafe-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-full bg-cafe-coffee flex items-center justify-center shadow-sm">
                <Coffee className="w-5 h-5 text-cafe-cream" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display text-lg font-semibold text-cafe-charcoal leading-tight">
                  Espresso House
                </h1>
                <p className="text-[11px] text-cafe-muted leading-tight">
                  GermanRP · Bestellungen
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1 mx-auto">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                      active
                        ? "bg-cafe-coffee text-cafe-cream shadow-sm"
                        : "text-cafe-charcoal/70 hover:text-cafe-charcoal hover:bg-cafe-coffee/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

          </div>

          {/* Mobile nav */}
          <nav className="md:hidden flex items-center gap-1 mt-3 overflow-x-auto">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                    active
                      ? "bg-cafe-coffee text-cafe-cream"
                      : "text-cafe-charcoal/70 bg-white border border-cafe-line"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}