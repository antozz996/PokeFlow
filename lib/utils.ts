// lib/utils.ts

import { clsx, type ClassValue } from "clsx";

/**
 * Merge class names con clsx
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Formatta un timestamp ISO in formato ora:minuti
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calcola il tempo trascorso in minuti da un timestamp
 */
export function minutesAgo(isoString: string): number {
  const now = new Date();
  const then = new Date(isoString);
  return Math.floor((now.getTime() - then.getTime()) / 60000);
}
