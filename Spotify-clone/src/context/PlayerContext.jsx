import { createContext, useEffect, useRef, useState } from "react";
import API_URL from "../config/api";

export const PlayerContext = createContext()

const PlayerContextProvider = (props) => {

    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();

    const [songsData, setSongsData] = useState([]);
    const [volume, setVolume] = useState(0.7);
    const [track, setTrack] = useState(null);
    const [playStatus, setPlayStatus] = useState(false);
    const [shuffle, setShuffle] = useState(false);
    const [loop, setLoop] = useState(false);
    const [time, setTime] = useState({
        currentTime: { second: 0, minute: 0 },
        totalTime: { second: 0, minute: 0 }
    });

    const fetchSongs = async () => {
        try {
            const response = await fetch(`${API_URL}/api/songs`);
            const songs = await response.json();
            const toAbsolute = (value) => {
                if (!value) return value;
                return value.startsWith('http') ? value : `${API_URL}${value}`;
            };

            const formattedSongs = songs.map((song, index) => ({
                id: index,
                name: song.name,
                image: toAbsolute(song.image),
                file: toAbsolute(song.file),
                desc: song.desc,
                duration: song.duration
            }));
            setSongsData(formattedSongs);
            if (formattedSongs.length > 0 && !track) {
                setTrack(formattedSongs[0]);
            }
        } catch (error) {
            console.error('Error fetching songs:', error);
        }
    };

    useEffect(() => {
        fetchSongs();
    }, []);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

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
        if (songsData[id]) {
            setTrack(songsData[id]);
            setPlayStatus(true);
        }
    }

    const previous = async () => {
        if (!track || songsData.length === 0) return;
        let prevIndex = track.id - 1;
        if (shuffle && songsData.length > 1) {
            let rand = track.id;
            while (rand === track.id) {
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
        let nextIndex = track.id + 1;
        if (shuffle && songsData.length > 1) {
            let rand = track.id;
            while (rand === track.id) {
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

    const seekSong = (e) => {
        audioRef.current.currentTime = ((e.nativeEvent.offsetX / seekBg.current.clientWidth) * audioRef.current.duration);
    }

    useEffect(() => {
        if (!audioRef.current || !track) return;
        const audio = audioRef.current;
        audio.src = track.file;
        audio.volume = volume;
        if (playStatus) {
            audio.play().catch(() => { });
        }
    }, [track, playStatus, volume]);

    useEffect(() => {
        if (!audioRef.current) return;
        const audio = audioRef.current;
        const timer = setTimeout(() => {
            audio.ontimeupdate = () => {
                // Двигаем ползунок: (текущее время / общая длина) * 100
                // Используем Math.floor, чтобы получать целое число для процентов
                seekBar.current.style.width = (Math.floor(audioRef.current.currentTime / audioRef.current.duration * 100)) + "%";

                // Обновляем состояние времени
                setTime({
                    currentTime: {
                        second: Math.floor(audioRef.current.currentTime % 60),
                        minute: Math.floor(audioRef.current.currentTime / 60)
                    },
                    totalTime: {
                        second: Math.floor(audioRef.current.duration % 60),
                        minute: Math.floor(audioRef.current.duration / 60)
                    }
                });
            };
        }, 1000);

        audio.onended = () => {
            if (loop) {
                audio.currentTime = 0;
                audio.play().catch(() => { });
                setPlayStatus(true);
            } else {
                next();
            }
        };

        return () => {
            clearTimeout(timer);
            audio.ontimeupdate = null;
            audio.onended = null;
        };
    }, [audioRef, loop, shuffle, songsData, track]);

    const toggleShuffle = () => setShuffle(prev => !prev);
    const toggleLoop = () => setLoop(prev => !prev);

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
