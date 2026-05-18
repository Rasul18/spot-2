const envApiUrl = import.meta.env.VITE_API_URL?.trim();

const getApiUrl = () => {
    if (typeof window === 'undefined') {
        return envApiUrl ? envApiUrl.replace(/\/$/, '') : '';
    }

    const currentHost = window.location.hostname;
    const currentOrigin = window.location.origin;
    const isCurrentLocal = currentHost === 'localhost' || currentHost === '127.0.0.1';

    if (!envApiUrl) {
        return isCurrentLocal ? '' : currentOrigin;
    }

    if (envApiUrl.startsWith('/')) {
        return envApiUrl.replace(/\/$/, '');
    }

    try {
        const url = new URL(envApiUrl, currentOrigin);
        const isEnvLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

        if (!isCurrentLocal) {
            return currentOrigin;
        }

        if (isEnvLocal && !isCurrentLocal) {
            url.hostname = currentHost;
        }

        return url.toString().replace(/\/$/, '');
    } catch {
        if (!isCurrentLocal) {
            return currentOrigin;
        }

        return '';
    }
};

const API_URL = getApiUrl();

export default API_URL;
