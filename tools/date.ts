export function formatDate(date?: Date): string {
  if (date) {
    return [
      date.getFullYear().toString().padStart(4, "0"),
      (date.getMonth() + 1).toString().padStart(2, "0"),
      date.getDate().toString().padStart(2, "0"),
    ].join("-");
  }

  return "";
}

export function isBefore(a: Date, b: Date): boolean {
  return a.getTime() < b.getTime();
}
