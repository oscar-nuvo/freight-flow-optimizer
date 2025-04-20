
/**
 * Shared utilities for contact forms (internal/external).
 */

import { Mail, Phone, MessageSquare } from "lucide-react";

export const countryCodeOptions = [
  { code: "+1", country: "USA", label: "+1 (USA)" },
  { code: "+1", country: "Canada", label: "+1 (Canada)" },
  { code: "+52", country: "Mexico", label: "+52 (Mexico)" },
];

export const notificationChannels = [
  { id: "email", label: "Email", icon: Mail },
  { id: "phone", label: "Phone", icon: Phone },
  { id: "sms", label: "SMS", icon: MessageSquare },
];

export function getCountryFromCode(code: string, country: string | undefined) {
  if (code === "+1" && country === "Canada") return "Canada";
  if (code === "+1" && country === "USA") return "USA";
  if (code === "+52") return "Mexico";
  return "USA";
}

export function validatePhoneWithCountryCode(phone: string, countryCode: string) {
  if (!phone) return true;
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  switch (countryCode) {
    case "+1":
      return /^\+?1?\d{10}$/.test(cleanPhone);
    case "+52":
      return /^\+?52?\d{10}$/.test(cleanPhone);
    default:
      return false;
  }
}

/**
 * Common validation for notification channels.
 */
export function isAtLeastOneNotificationChannel(selected: string[]): boolean {
  return Array.isArray(selected) && selected.length > 0;
}
