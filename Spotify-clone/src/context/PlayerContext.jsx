import { useEffect, useEffectEvent, useRef, useState } from "react";
import API_URL from "../config/api";
import { PlayerContext } from "./player-context";
import { readStoredValue, removeStoredValue, writeStoredValue } from "../utils/storage";

const PLAYER_TRACK_KEY = 'player-track-id';
const PLAYER_LOOP_KEY = 'player-loop-enabled';
const PLAYER_SHUFFLE_KEY = 'player-shuffle-enabled';
const THEME_KEY = 'app-theme';
let songsCache = null;
let songsRequestPromise = null;
const JAMENDO_PAGE_SIZE = 12;

const PlayerContextProvider = (props) => {

    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();

    const [songsData, setSongsData] = useState([]);
    const [volume, setVolume] = useState(0.7);
    const [track, setTrack] = useState(null);
    const [playStatus, setPlayStatus] = useState(false);
    const [shuffle, setShuffle] = useState(readStoredValue(PLAYER_SHUFFLE_KEY) === 'true');
    const [loop, setLoop] = useState(readStoredValue(PLAYER_LOOP_KEY) === 'true');
    const [theme, setTheme] = useState(readStoredValue(THEME_KEY) === 'dark' ? 'dark' : 'light');
    const [recommendations, setRecommendations] = useState([]);
    const [genreStats, setGenreStats] = useState([]);
    const [likedSongIds, setLikedSongIds] = useState([]);
    const [jamendoHasMore, setJamendoHasMore] = useState(true);
    const [jamendoLoading, setJamendoLoading] = useState(false);
    const [jamendoError, setJamendoError] = useState("");
    const [time, setTime] = useState({
        currentTime: { second: 0, minute: 0 },
        totalTime: { second: 0, minute: 0 }
    });
    const lastTrackedPlayId = useRef(null);
    const didInitialLoad = useRef(false);

    const normalizeMediaUrl = (value) => {
        if (!value) return value;

        const baseOrigin =
            typeof window !== "undefined" ? window.location.origin : API_URL || "http://localhost";

        try {
            const url = new URL(value, API_URL || baseOrigin);

            if (typeof window !== "undefined" && window.location.protocol === "https:" && url.protocol === "http:") {
                url.protocol = "https:";
            }

            return url.toString();
        } catch {
            return value;
        }
    };

    const mapSong = (song, index, fallbackPrefix = "song") => ({
        genre: song.genre || "Pop",
        id: song._id || `${fallbackPrefix}-${index}`,
        externalId: song.externalId || song._id || `${fallbackPrefix}-${index}`,
        queueIndex: index,
        source: song.source || "local",
        name: song.name,
        image: normalizeMediaUrl(song.image),
        file: normalizeMediaUrl(song.file),
        desc: song.desc,
        duration: song.duration,
        album: song.album
    });

    const fetchSongs = async (force = false) => {
        if (songsCache && !force) {
            setSongsData(songsCache);
            return songsCache;
        }

        if (songsRequestPromise && !force) {
            const cachedSongs = await songsRequestPromise;
            setSongsData(cachedSongs);
            return cachedSongs;
        }

        songsRequestPromise = (async () => {
            const response = await fetch(`${API_URL}/api/songs`);
            const songs = await response.json();
            if (!Array.isArray(songs)) {
                return [];
            }

            return songs.map((song, index) => mapSong(song, index));
        })();

        try {
            const formattedSongs = await songsRequestPromise;
            setJamendoError("");
            songsCache = formattedSongs;
            setSongsData(formattedSongs);
            const jamendoCount = formattedSongs.filter((song) => song.source === "jamendo").length;
            setJamendoHasMore(jamendoCount >= JAMENDO_PAGE_SIZE);

            if (formattedSongs.length === 0) {
                setTrack(null);
                return formattedSongs;
            }

            const storedTrackId = readStoredValue(PLAYER_TRACK_KEY);

            if (!track) {
                const storedTrack = formattedSongs.find((song) => song.id === storedTrackId);
                setTrack(storedTrack || formattedSongs[0]);
                return formattedSongs;
            }

            const actualTrack = formattedSongs.find(
                (song) => song.id === track.id || song.file === track.file
            );
            setTrack(actualTrack || formattedSongs.find((song) => song.id === storedTrackId) || formattedSongs[0]);
            return formattedSongs;
        } catch (error) {
            console.error('Error fetching songs:', error);
            songsRequestPromise = null;
            return [];
        } finally {
            songsRequestPromise = null;
        }
    };

    const loadMoreJamendo = async () => {
        if (jamendoLoading) {
            return;
        }

        const currentJamendoCount = songsData.filter((song) => song.source === "jamendo").length;
        setJamendoLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/songs?source=jamendo&offset=${currentJamendoCount}&limit=${JAMENDO_PAGE_SIZE}`
            );
            if (!response.ok) {
                throw new Error("Jamendo tracks could not be loaded");
            }
            const data = await response.json();
            const jamendoSongs = Array.isArray(data?.songs)
                ? data.songs.map((song, index) =>
                    mapSong(song, currentJamendoCount + index, "jamendo")
                )
                : [];

            setJamendoError("");
            setJamendoHasMore(Boolean(data?.hasMore) && jamendoSongs.length > 0);

            if (jamendoSongs.length === 0) {
                return;
            }

            setSongsData((prev) => {
                const existingIds = new Set(prev.map((song) => song.id));
                const merged = [
                    ...prev,
                    ...jamendoSongs.filter((song) => !existingIds.has(song.id))
                ];
                songsCache = merged;
                return merged;
            });
        } catch (error) {
            console.error("Error loading more Jamendo songs:", error);
            setJamendoError("Не удалось загрузить следующую страницу Jamendo. Перезапусти backend и попробуй снова.");
        } finally {
            setJamendoLoading(false);
        }
    };

    const getAuthHeaders = () => {
        const token = readStoredValue('token');

        return token
            ? {
                Authorization: `Bearer ${token}`
            }
            : {};
    };

    const sendInteraction = async (path, body) => {
        const headers = getAuthHeaders();
        if (!headers.Authorization) {
            return null;
        }

        const response = await fetch(`${API_URL}/api/${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Interaction request failed: ${path}`);
        }

        return response.json();
    };

    const fetchRecommendations = async () => {
        const headers = getAuthHeaders();
        if (!headers.Authorization) {
            setRecommendations([]);
            setGenreStats([]);
            setLikedSongIds([]);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/recommendations`, {
                headers
            });

            if (!response.ok) {
                throw new Error('Recommendations request failed');
            }

            const data = await response.json();
            const formattedRecommendations = Array.isArray(data.songs)
                ? data.songs.map((song, index) => ({
                    ...mapSong(song, index, "recommended")
                }))
                : [];

            setRecommendations(formattedRecommendations);
            setGenreStats(Array.isArray(data.stats) ? data.stats : []);
            setLikedSongIds(Array.isArray(data.likedSongIds) ? data.likedSongIds : []);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    useEffect(() => {
        if (track?.id) {
            writeStoredValue(PLAYER_TRACK_KEY, track.id);
        } else {
            removeStoredValue(PLAYER_TRACK_KEY);
        }
    }, [track]);

    useEffect(() => {
        writeStoredValue(PLAYER_LOOP_KEY, String(loop));
    }, [loop]);

    useEffect(() => {
        writeStoredValue(PLAYER_SHUFFLE_KEY, String(shuffle));
    }, [shuffle]);

    useEffect(() => {
        writeStoredValue(THEME_KEY, theme);
        if (typeof document !== "undefined") {
            document.documentElement.dataset.theme = theme;
            document.body.style.background = theme === 'dark' ? '#020617' : '#f1f5f9';
            document.body.style.color = theme === 'dark' ? '#e2e8f0' : '#0f172a';
        }
    }, [theme]);

    const play = () => {
        if (!audioRef.current) return;
        audioRef.current.play().catch(() => { });
        setPlayStatus(true);
    }

    const pause = () => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        setPlayStatus(false); // ИСПРАВЛЕНО: было flase
    }

    const playWithId = (id) => {
        const selectedTrack = songsData.find(
            (song) => song.id === id || song.queueIndex === id
        );

        if (selectedTrack) {
            setTrack(selectedTrack);
            setPlayStatus(true);
        }
    }

    const previous = async () => {
        if (!track || songsData.length === 0) return;
        const currentIndex = songsData.findIndex((song) => song.id === track.id);
        if (currentIndex === -1) return;

        let prevIndex = currentIndex - 1;
        if (shuffle && songsData.length > 1) {
            let rand = currentIndex;
            while (rand === currentIndex) {
                rand = Math.floor(Math.random() * songsData.length);
            }
            prevIndex = rand;
        }
        if (prevIndex < 0) {
            if (loop) prevIndex = songsData.length - 1;
            else return;
        }
        setTrack(songsData[prevIndex]);
        setPlayStatus(true);
    }

    const next = async () => {
        if (!track || songsData.length === 0) return;
        const currentIndex = songsData.findIndex((song) => song.id === track.id);
        if (currentIndex === -1) return;

        let nextIndex = currentIndex + 1;
        if (shuffle && songsData.length > 1) {
            let rand = currentIndex;
            while (rand === currentIndex) {
                rand = Math.floor(Math.random() * songsData.length);
            }
            nextIndex = rand;
        }
        if (nextIndex >= songsData.length) {
            if (loop) nextIndex = 0;
            else return;
        }
        setTrack(songsData[nextIndex]);
        setPlayStatus(true);
    }

    const refreshRecommendations = useEffectEvent(() => {
        fetchRecommendations();
    });

    const registerInteraction = useEffectEvent(async (path, body) => {
        return sendInteraction(path, body);
    });

    const playNextTrack = useEffectEvent(() => {
        next();
    });

    useEffect(() => {
        if (didInitialLoad.current) {
            return;
        }

        didInitialLoad.current = true;
        fetchSongs();
        fetchRecommendations();
    }, []);

    useEffect(() => {
        const handleAuthChanged = () => {
            refreshRecommendations();
        };

        window.addEventListener('auth-changed', handleAuthChanged);
        return () => {
            window.removeEventListener('auth-changed', handleAuthChanged);
        };
    }, [refreshRecommendations]);

    const seekSong = (e) => {
        audioRef.current.currentTime = ((e.nativeEvent.offsetX / seekBg.current.clientWidth) * audioRef.current.duration);
    }

    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds) || seconds < 0) return { minute: 0, second: "00" };
        const minute = Math.floor(seconds / 60);
        const second = String(Math.floor(seconds % 60)).padStart(2, "0");
        return { minute, second };
    };

    useEffect(() => {
        if (!audioRef.current || !track) return;
        const audio = audioRef.current;
        audio.src = track.file;
        audio.load();
        if (playStatus) {
            audio.play().catch((error) => {
                console.error('Audio playback failed:', track.file, error);
                setPlayStatus(false);
            });
        }
    }, [track, playStatus]);

    useEffect(() => {
        if (!track || !playStatus) {
            return;
        }

        if (lastTrackedPlayId.current === track.id) {
            return;
        }

        lastTrackedPlayId.current = track.id;

        registerInteraction('interactions/play', {
            songId: track.id,
            source: track.source,
            genre: track.genre
        })
            .then(() => refreshRecommendations())
            .catch((error) => {
                console.error('Failed to register play:', error);
            });
    }, [track, playStatus, registerInteraction, refreshRecommendations]);

    useEffect(() => {
        if (!audioRef.current) return;
        const audio = audioRef.current;
        const timer = setTimeout(() => {
            audio.ontimeupdate = () => {
                const duration = audioRef.current.duration;
                const currentTime = audioRef.current.currentTime;
                const progress = Number.isFinite(duration) && duration > 0
                    ? (currentTime / duration) * 100
                    : 0;

                seekBar.current.style.width = `${Math.floor(progress)}%`;

                // Обновляем состояние времени
                const current = formatTime(audioRef.current.currentTime);
                const total = formatTime(audioRef.current.duration);

                setTime({
                    currentTime: current,
                    totalTime: total
                });
            };
        }, 1000);

        audio.onended = () => {
            registerInteraction('interactions/full-listen', {
                songId: track?.id,
                source: track?.source,
                genre: track?.genre
            })
                .then(() => refreshRecommendations())
                .catch((error) => {
                    console.error('Failed to register full listen:', error);
                });

            if (loop) {
                audio.currentTime = 0;
                audio.play().catch(() => { });
                setPlayStatus(true);
            } else {
                playNextTrack();
            }
        };

        audio.onerror = () => {
            const mediaError = audio.error;
            console.error('Audio element error:', {
                trackName: track?.name,
                file: track?.file,
                code: mediaError?.code,
                message: mediaError?.message
            });
            setPlayStatus(false);
        };

        return () => {
            clearTimeout(timer);
            audio.ontimeupdate = null;
            audio.onended = null;
            audio.onerror = null;
        };
    }, [loop, track, registerInteraction, refreshRecommendations, playNextTrack]);

    const toggleShuffle = () => setShuffle(prev => !prev);
    const toggleLoop = () => setLoop(prev => !prev);
    const toggleTheme = () => setTheme((prev) => prev === 'dark' ? 'light' : 'dark');
    const isTrackLiked = track ? likedSongIds.includes(track.id) : false;

    const toggleLikeTrack = async () => {
        if (!track) return;

        const nextLiked = !likedSongIds.includes(track.id);

        try {
            await sendInteraction('interactions/like', {
                songId: track.id,
                source: track.source,
                genre: track.genre,
                liked: nextLiked
            });

            setLikedSongIds((prev) =>
                nextLiked
                    ? [...new Set([...prev, track.id])]
                    : prev.filter((id) => id !== track.id)
            );
            refreshRecommendations();
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const contextValue = {
        audioRef,
        seekBg,
        seekBar,
        track, setTrack,
        playStatus, setPlayStatus,
        time, setTime,
        play,
        pause,
        playWithId,
        previous,
        next,
        seekSong,
        shuffle,
        loop,
        toggleShuffle,
        toggleLoop,
        songsData,
        fetchSongs,
        loadMoreJamendo,
        jamendoHasMore,
        jamendoLoading,
        jamendoError,
        recommendations,
        genreStats,
        fetchRecommendations,
        likedSongIds,
        isTrackLiked,
        toggleLikeTrack,
        theme,
        toggleTheme,
        volume,
        setVolume
    }
    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    )
}

export default PlayerContextProvider;
