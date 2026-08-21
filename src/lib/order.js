const ORDER_NUMBER_KEY = "espresso-house-order-number";

export function getNextOrderNumber() {
  try {
    const stored = localStorage.getItem(ORDER_NUMBER_KEY);

    let number = Number.parseInt(stored, 10);

    if (!Number.isFinite(number) || number < 1000) {
      number = 1000;
    }

    const nextNumber = number + 1;

    localStorage.setItem(
      ORDER_NUMBER_KEY,
      String(nextNumber)
    );

    return nextNumber;
  } catch {
    return Date.now();
  }
}