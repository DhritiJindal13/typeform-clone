function toDate(value: string): Date {
  const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
  return new Date(hasTimezone ? value : value + "Z");
}

export function timeAgo(value: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - toDate(value).getTime()) / 1000));
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  return toDate(value).toLocaleDateString();
}
