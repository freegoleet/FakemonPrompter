// MathUtils.tsx
// Utility functions for mathematical operations

export interface vector2 {
    x: number;
    y: number;
}

/**
 * 
 * @param min
 * @param max
 * @param coef
 * @returns
 */
export function normalizeVector2(vector: vector2): vector2 {
    const mag = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (mag > 0) {
        vector.x /= mag;
        vector.y /= mag;
    }

    return vector;
}

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


export function lerp(a: number, b: number, t: number): number;
export function lerp(a: vector2, b: vector2, t: number): vector2;
export function lerp(a: number | vector2, b: number | vector2, t: number): number | vector2 {
    if (typeof a === "number" && typeof b === "number") {
        return a + (b - a) * t;
    } else if (typeof a === "object" && typeof b === "object") {
        return {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t
        };
    }
    throw new Error("Invalid arguments for lerp");
}

export function inverseLerp(a: number, b: number, v: number): number {
    if (a === b) return 0;
    return (v - a) / (b - a);
}

export const randomSign = (): number => Math.random() > 0.5 ? 1 : -1;

