import type { Patient } from "@/lib/domain/types";
import { arthurPendleton } from "@/lib/demo/arthur";

const patientsByPhone = new Map<string, Patient>([[arthurPendleton.preferredPhoneNumber, arthurPendleton]]);

export function normalisePhoneNumber(input: string): string {
  return input.replace(/^whatsapp:/, "").trim();
}

export function maskPhoneNumber(input: string): string {
  const value = normalisePhoneNumber(input);
  return value.length <= 4 ? "••••" : `${value.slice(0, 3)}••••${value.slice(-2)}`;
}

export function findPatientByPhone(input: string): Patient | undefined {
  return patientsByPhone.get(normalisePhoneNumber(input));
}
