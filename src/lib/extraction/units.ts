import type { WeightUnit } from "./types";

export function poundsToKg(value: number): number {
  return roundToOneDecimal(value * 0.45359237);
}

export function displayWeight(value: number, unit: WeightUnit): string {
  if (unit === "kg") return `${value.toFixed(1)} kg`;
  return `${value.toFixed(1)} lb (${poundsToKg(value).toFixed(1)} kg)`;
}

export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}
