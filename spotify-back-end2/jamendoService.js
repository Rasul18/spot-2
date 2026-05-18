const JAMENDO_BASE_URL = "https://api.jamendo.com/v3.0/tracks/";
const JAMENDO_DEFAULT_CLIENT_ID = "709fa152";
const DEFAULT_LIMIT = Number(process.env.JAMENDO_LIMIT || 30);
const JAMENDO_CACHE_TTL_MS = Number(process.env.JAMENDO_CACHE_TTL_MS || 1000 * 60 * 10);

const jamendoCache = new Map();

const formatDuration = (value) => {
    const totalSeconds = Number(value);

    if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
        return "0:00";
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
};

const buildJamendoDescription = (track) => {
    const parts = [
        track.artist_name,
        track.album_name,
        track.tags
    ].filter(Boolean);

    return parts.join(" • ") || "Jamendo track";
};

const normalizeGenres = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value.flatMap((item) => normalizeGenres(item));
    }

    return String(value)
        .split(/[,+]/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const mapJamendoTrack = (track, index = 0) => ({
    _id: `jamendo-${track.id ?? index}`,
    externalId: String(track.id ?? index),
    source: "jamendo",
    name: track.name || track.title || "Unknown track",
    desc: buildJamendoDescription(track),
    image: track.image || track.album_image || "",
    file: track.audio,
    duration: formatDuration(track.duration),
    album: track.album_name || "Jamendo",
    artist: track.artist_name || "",
    genre: track.musicinfo?.tags?.genres?.[0] || track.genre || "Jamendo"
});

export async function fetchJamendoSongs(options = {}) {
    const clientId = process.env.JAMENDO_CLIENT_ID || JAMENDO_DEFAULT_CLIENT_ID;
    const offset = Number(options.offset || 0);
    const limit = Number(options.limit || DEFAULT_LIMIT);
    const tags = normalizeGenres(options.genres);
    const cacheKey = JSON.stringify({ clientId, offset, limit, tags });
    const cached = jamendoCache.get(cacheKey);

    if (cached && Date.now() < cached.expiresAt) {
        return cached.payload;
    }

    const url = new URL(JAMENDO_BASE_URL);
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("format", "json");
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("audioformat", "mp31");
    url.searchParams.set("imagesize", "300");
    url.searchParams.set("order", "popularity_total");

    if (tags.length > 0) {
        url.searchParams.set("tags", tags.join("+"));
    }

    const response = await fetch(url, {
        headers: {
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Jamendo responded with ${response.status}`);
    }

    const payload = await response.json();

    if (payload?.headers?.status !== "success") {
        throw new Error(payload?.headers?.error_message || "Jamendo request failed");
    }

    const results = Array.isArray(payload.results) ? payload.results : [];
    const songs = results
        .filter((track) => track.audio)
        .map((track, index) => mapJamendoTrack(track, offset + index));

    const result = {
        songs,
        total: Number(payload?.headers?.results_count || songs.length),
        next: payload?.headers?.next || null,
        hasMore: songs.length === limit
    };

    jamendoCache.set(cacheKey, {
        expiresAt: Date.now() + JAMENDO_CACHE_TTL_MS,
        payload: result
    });

    return result;
}
