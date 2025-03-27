/**
 * Clamps a value between a minimum and maximum value
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, amount: number): number {
    return (1 - amount) * start + amount * end;
}

/**
 * Converts degrees to radians
 */
export function degToRad(degrees: number): number {
    return degrees * Math.PI / 180;
}

/**
 * Converts radians to degrees
 */
export function radToDeg(radians: number): number {
    return radians * 180 / Math.PI;
}

/**
 * Gets a random integer between min and max (inclusive)
 */
export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Formats a large number with commas
 */
export function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}