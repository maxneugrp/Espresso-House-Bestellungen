import React, { useEffect, useState } from "react";
import { Coffee, Pencil, Trash2, Plus, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "@/lib/menu";

const displayFmt = (n) =>
  (Number(n) || 0).toFixed(2).replace(".", ",") + " €";

const CATEGORIES = [
  "Kaffee",
  "Kalte Kaffeespezialitäten",
  "Tee & Heissgetränke",
  "Gebäck & Süßes",
  "Frische Säfte",
  "Spezial",
];

const categoryLabel = (cat) => cat.toUpperCase();

const emptyForm = {
  name: "",
  category: "Kaffee",
  price: "",
};

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
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
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price) {
      toast({
        title: "Unvollständig",
        description: "Name und Preis sind erforderlich.",
      });
      return;
    }

    const price = parseFloat(String(form.price).replace(",", "."));

    if (isNaN(price) || price < 0) {
      toast({
        title: "Ungültiger Preis",
        description: "Bitte gib einen gültigen Preis ein.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        updateMenuItem(editingId, {
          name: form.name.trim(),
          category: form.category,
          price,
        });

        toast({
          title: "Aktualisiert",
          description: `${form.name} wurde gespeichert.`,
        });
      } else {
        createMenuItem({
          name: form.name.trim(),
          category: form.category,
          price,
        });

        toast({
          title: "Hinzugefügt",
          description: `${form.name} wurde zur Speisekarte hinzugefügt.`,
        });
      }

      resetForm();
      await load();
    } catch (e) {
      toast({
        title: "Fehler",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);

    setForm({
      name: item.name || "",
      category: item.category || "Kaffee",
      price: String(item.price ?? "").replace(".", ","),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (item) => {
    setDeletingId(item.id);

    try {
      deleteMenuItem(item.id);

      toast({
        title: "Gelöscht",
        description: `${item.name} wurde entfernt.`,
      });

      if (editingId === item.id) {
        resetForm();
      }

      await load();
    } catch (e) {
      toast({
        title: "Fehler",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const grouped = CATEGORIES.map((cat) => ({
    cat,
    list: items.filter((item) => item.category === cat),
  })).filter((group) => group.list.length);

  return (
    <div>
      <h2 className="font-display text-3xl sm:text-4xl font-semibold text-cafe-charcoal">
        Speisekarte
      </h2>

      <p className="text-sm text-cafe-muted mt-1">
        Artikel verwalten, bearbeiten oder entfernen.
      </p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-cafe-line shadow-sm p-5 lg:sticky lg:top-28">
          <h3 className="font-display text-lg font-semibold text-cafe-charcoal mb-4">
            {editingId
              ? "Artikel bearbeiten"
              : "Artikel hinzufügen"}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-cafe-muted mb-1 block">
                Name
              </label>

              <Input
                placeholder="Name (z. B. Flat White)"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                className="bg-cafe-cream/50 border-cafe-line"
              />
            </div>

            <div>
              <label className="text-xs text-cafe-muted mb-1 block">
                Kategorie
              </label>

              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    category: value,
                  })
                }
              >
                <SelectTrigger className="bg-cafe-cream/50 border-cafe-line">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-cafe-muted mb-1 block">
                Preis in €
              </label>

              <Input
                placeholder="z. B. 4,40"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value,
                  })
                }
                className="bg-cafe-cream/50 border-cafe-line"
                inputMode="decimal"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="mt-5 w-full bg-cafe-coffee hover:bg-cafe-charcoal text-cafe-cream rounded-full h-11 font-medium"
          >
            {editingId ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}

            {saving
              ? "Wird gespeichert…"
              : editingId
                ? "Änderungen speichern"
                : "Hinzufügen"}
          </Button>

          {editingId && (
            <button
              onClick={resetForm}
              className="mt-2 w-full text-xs text-cafe-muted hover:text-cafe-charcoal"
            >
              Bearbeitung abbrechen
            </button>
          )}
        </div>

        {/* Liste */}
        <div className="bg-white rounded-2xl border border-cafe-line shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-14 rounded-xl bg-cafe-cream/60 animate-pulse"
                />
              ))}
            </div>
          ) : grouped.length === 0 ? (
            <div className="px-5 py-16 text-center text-cafe-muted">
              Noch keine Artikel angelegt.
            </div>
          ) : (
            <div className="divide-y divide-cafe-line">
              {grouped.map((group) => (
                <div key={group.cat}>
                  <div className="px-5 py-3 bg-cafe-cream/40">
                    <h4 className="text-xs font-semibold tracking-[0.2em] text-cafe-tan uppercase">
                      {categoryLabel(group.cat)}
                    </h4>
                  </div>

                  <ul className="divide-y divide-cafe-line">
                    {group.list.map((item) => (
                      <li
                        key={item.id}
                        className="px-5 py-3 flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-full bg-cafe-cream flex items-center justify-center shrink-0">
                          <Coffee className="w-4 h-4 text-cafe-coffee" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-cafe-charcoal text-sm truncate">
                            {item.name}
                          </div>

                          <div className="text-[11px] text-cafe-tan uppercase tracking-wide">
                            {item.category}
                          </div>
                        </div>

                        <div className="font-display font-semibold text-cafe-charcoal">
                          {displayFmt(item.price)}
                        </div>

                        <button
                          onClick={() => startEdit(item)}
                          className="w-8 h-8 rounded-lg border border-cafe-line flex items-center justify-center text-cafe-muted hover:text-cafe-charcoal hover:border-cafe-coffee transition-colors"
                          title="Bearbeiten"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.id}
                          className="w-8 h-8 rounded-lg border border-cafe-line flex items-center justify-center text-cafe-muted hover:text-red-500 hover:border-red-300 transition-colors disabled:opacity-50"
                          title="Löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}