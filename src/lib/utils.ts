import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatPercentage(num: number): string {
  return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(d)
}

export type PlatformType = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'twitter' | 'linkedin'

export function getPlatformIcon(platform: PlatformType | string): string {
  const icons: Record<string, string> = {
    instagram: '📷',
    tiktok: '🎵',
    youtube: '▶️',
    facebook: '👤',
    twitter: '🐦',
    linkedin: '💼',
  }
  return icons[platform.toLowerCase()] || '🌐'
}

export function getPlatformColor(platform: PlatformType | string): string {
  const colors: Record<string, string> = {
    instagram: '#E1306C',
    tiktok: '#00F2EA',
    youtube: '#FF0000',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
  }
  return colors[platform.toLowerCase()] || '#6B7280'
}
