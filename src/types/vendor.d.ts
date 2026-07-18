declare namespace React {
  type ReactNode = unknown;
}

declare namespace JSX {
  interface IntrinsicElements { [elementName: string]: any; }
}

declare const process: { env: Record<string, string | undefined> };
declare const __dirname: string;
declare class EventSource { constructor(url: string); onopen: (() => void) | null; onerror: (() => void) | null; addEventListener(type: string, listener: (message: MessageEvent) => void): void; close(): void; }
declare interface MessageEvent { data: string; }

declare module "*.css";
declare const Buffer: { from(input: string): { length: number } };
declare module "node:crypto" { export function createHmac(algorithm: string, key?: string): { update(input: string | Uint8Array): { digest(encoding: "base64" | "hex"): string } }; export const createHash: typeof createHmac; export function timingSafeEqual(left: { length: number }, right: { length: number }): boolean; }
declare module "node:path" { const path: { resolve(...parts: string[]): string }; export default path; }
declare module "node:fs" { export function readFileSync(path: string, encoding: string): string; }
declare module "node:child_process" { export function execSync(command: string, options?: { encoding?: string }): string; }

declare module "react" {
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export function useMemo<T>(factory: () => T, deps: unknown[]): T;
  export function useState<T>(initialState: T): [T, (value: T | ((current: T) => T)) => void];
  export function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, (action: A) => void];
}

declare module "next" { export type Metadata = { title?: string; description?: string }; }
declare module "next/link" { const Link: (props: Record<string, unknown>) => unknown; export default Link; }
declare module "lucide-react" { export const Activity: (props: Record<string, unknown>) => unknown; export const AlertTriangle: (props: Record<string, unknown>) => unknown; export const CheckCircle2: (props: Record<string, unknown>) => unknown; export const RotateCcw: (props: Record<string, unknown>) => unknown; }
declare module "recharts" { export const Area: (props: Record<string, unknown>) => unknown; export const AreaChart: (props: Record<string, unknown>) => unknown; export const CartesianGrid: (props: Record<string, unknown>) => unknown; export const ResponsiveContainer: (props: Record<string, unknown>) => unknown; export const Tooltip: (props: Record<string, unknown>) => unknown; export const XAxis: (props: Record<string, unknown>) => unknown; export const YAxis: (props: Record<string, unknown>) => unknown; }
declare module "tailwindcss" { export type Config = Record<string, unknown>; }
declare module "vitest" { export function describe(name: string, fn: () => void): void; export function it(name: string, fn: () => void): void; export function expect(value: unknown): { toBe(expected: unknown): void; toEqual(expected: unknown): void; toHaveLength(expected: number): void; toContain(expected: string): void; toThrow(expected?: RegExp): void; rejects: { toThrow(expected?: RegExp): Promise<void> } }; }
declare module "vitest/config" { export function defineConfig(config: Record<string, unknown>): Record<string, unknown>; }
declare module "zod" {
  export const z: {
    enum<T extends readonly [string, ...string[]]>(values: T): { default(value: T[number]): unknown; nullable(): unknown };
    number(): { nullable(): unknown; min(value: number): { max(value: number): unknown } };
    string(): unknown;
    boolean(): unknown;
    literal<T>(value: T): unknown;
    array(schema: unknown): unknown;
    object<T extends Record<string, unknown>>(shape: T): { superRefine(fn: (env: Record<string, string>, ctx: { addIssue(issue: Record<string, unknown>): void }) => void): { parse(input: unknown): Record<string, string> }; parse(input: unknown): any };
    ZodIssueCode: { custom: string };
  };
}
