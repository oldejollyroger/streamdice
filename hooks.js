// hooks.js - v1.1.0 (Fixed)

function useLocalStorageState(key, defaultValue) {
  const { useState, useEffect } = React;
  
  const [state, setState] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        try {
          return JSON.parse(storedValue);
        } catch (parseError) {
          console.error(`Error parsing localStorage key "${key}":`, parseError);
          return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
        }
      }
    } catch (accessError) {
      // localStorage not available (incognito mode, Safari private, etc.)
      console.warn(`localStorage not available for key "${key}":`, accessError.message);
    }
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error(`Error setting localStorage key "${key}":`, e);
    }
  }, [key, state]);

  return [state, setState];
}

function useDebounce(value, delay) {
  const { useState, useEffect } = React;
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}