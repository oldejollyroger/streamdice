import { useState, useEffect } from 'react';

export function useLocalStorageState(key, defaultValue) {
    const [state, setState] = useState(() => {
        const storedValue = window.localStorage.getItem(key);
        if (storedValue) {
            try {
                return JSON.parse(storedValue);
            } catch (e) {
                return defaultValue;
            }
        }
        return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    });

    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
}

export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
}