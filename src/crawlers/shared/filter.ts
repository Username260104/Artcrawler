export function isCurrentOrUpcoming(startDate: string, endDate: string, today = new Date()): boolean {
  return endDate >= toDateKey(today) || startDate >= toDateKey(today);
}

function toDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

