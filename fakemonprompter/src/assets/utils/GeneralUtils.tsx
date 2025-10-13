export function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function saveToStorage<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function loadFromStorage<T>(key: string, fallback: T): T {
    const item = localStorage.getItem(key);
    if (item) {
        try {
            return JSON.parse(item) as T;
        } catch {
            return fallback;
        }
    }
    return fallback;
}