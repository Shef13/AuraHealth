export function redactPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return "[phone-redacted]";
  return `[phone-redacted-ends-${digits.slice(-2)}]`;
}

export function redactTranscript(transcript: string): string {
  return transcript.length <= 12 ? "[transcript-redacted]" : `[transcript-redacted-${transcript.length}-chars]`;
}

export function safeLogFields(fields: Record<string, string | number | boolean | undefined>): Record<string, string | number | boolean> {
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined).map(([key, value]) => [key, key.toLowerCase().includes("phone") ? redactPhoneNumber(String(value)) : value as string | number | boolean]));
}
