const STORAGE_KEY = "espresso-house-menu"

export function getMenuItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return []
    }

    const items = JSON.parse(stored)

    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export function saveMenuItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function createMenuItem(item) {
  const items = getMenuItems()

  const newItem = {
    id: crypto.randomUUID(),
    created_date: new Date().toISOString(),
    ...item,
  }

  saveMenuItems([...items, newItem])

  return newItem
}

export function updateMenuItem(id, changes) {
  const items = getMenuItems()

  const updated = items.map((item) =>
    item.id === id
      ? { ...item, ...changes }
      : item
  )

  saveMenuItems(updated)

  return updated.find((item) => item.id === id)
}

export function deleteMenuItem(id) {
  const items = getMenuItems()

  const updated = items.filter((item) => item.id !== id)

  saveMenuItems(updated)
}