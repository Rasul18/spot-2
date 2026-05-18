export const readStoredJson = (key) => {
    if (typeof window === 'undefined') {
        return null;
    }

    const raw = window.localStorage.getItem(key);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch {
        window.localStorage.removeItem(key);
        return null;
    }
};

export const readStoredValue = (key) => {
    if (typeof window === 'undefined') {
        return '';
    }

    return window.localStorage.getItem(key) || '';
};

export const writeStoredValue = (key, value) => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(key, value);
};

export const removeStoredValue = (key) => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.removeItem(key);
};
