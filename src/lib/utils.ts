import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BusinessHours } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isBusinessOpen = (businessHours: BusinessHours): boolean => {
  if (!businessHours) return false;

  const now = new Date();
  const dayOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][now.getDay()] as keyof BusinessHours;

  const hours = businessHours[dayOfWeek];

  if (!hours || !hours.open || !hours.close) {
    return false; // Closed on this day or data is missing
  }

  const [openHour, openMinute] = hours.open.split(":").map(Number);
  const [closeHour, closeMinute] = hours.close.split(":").map(Number);

  const openTime = new Date();
  openTime.setHours(openHour, openMinute, 0, 0);

  const closeTime = new Date();
  closeTime.setHours(closeHour, closeMinute, 0, 0);

  // Handle cases where closing time is on the next day (e.g., open 22:00, close 02:00)
  if (closeTime <= openTime) {
    closeTime.setDate(closeTime.getDate() + 1);
  }

  return now >= openTime && now <= closeTime;
};
