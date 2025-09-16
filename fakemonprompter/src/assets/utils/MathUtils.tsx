// MathUtils.tsx
// Utility functions for mathematical operations

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 */
export function randomRange(min: number, max: number, coef?: number): number {
    if (coef === undefined) {
        coef = Math.random();
    }
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(coef * (max - min + 1)) + min;
}

/**
 * Clamps a number between a minimum and maximum value.
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Calculates the average of an array of numbers.
 */
export function average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

export function inverseLerp(a: number, b: number, v: number): number {
    if (a === b) return 0;
    return (v - a) / (b - a);
}

export const randomSign = (): number => Math.random() > 0.5 ? 1 : -1;
