import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return formatDate(timestamp);
}

export function getPlatformColor(platform: string): string {
  switch (platform) {
    case "instagram":
      return "bg-pink-500";
    case "tiktok":
      return "bg-black";
    case "youtube":
      return "bg-red-600";
    default:
      return "bg-gray-500";
  }
}

export function getPlatformIcon(platform: string): string {
  switch (platform) {
    case "instagram":
      return "📸";
    case "tiktok":
      return "🎵";
    case "youtube":
      return "▶️";
    default:
      return "📱";
  }
}
