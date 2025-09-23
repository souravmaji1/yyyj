import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isKioskInterface(): boolean {
  return process.env.NEXT_PUBLIC_USER_INTERFACE === 'kiosk';
}

export function isKioskAdminOrUser() {
  if (typeof window === 'undefined') return false;
  try {
    const userStr = localStorage.getItem('userAuthDetails');
    if (!userStr) return false;
    const user = JSON.parse(userStr);
    // Support multiple roles as comma-separated string
    const roles = typeof user.role === 'string' ? user.role.split(',').map((r: string) => r.trim()) : [];
    return roles.includes('admin') || roles.includes('kiosk_user');
  } catch {
    return false;
  }
}

// Reads the kiosk MAC address from the URL query parameter (for kiosk mode)
export function getKioskMacFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('machine_id');
  return raw ? decodeURIComponent(raw) : null;
}

// Stores the MAC address from the URL into localStorage (if present)
export function storeKioskMacToLocalStorage(mac: string) {
  localStorage.setItem('machine_id', mac);
}

// Retrieves the MAC address from localStorage
export function getKioskMacFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('machine_id');
}