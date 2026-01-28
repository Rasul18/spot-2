import { createContext, useEffect, useRef, useState } from "react";
import API_URL from "../config/api";

export const PlayerContext = createContext()

const PlayerContextProvider = (props) => {

    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();

    const [songsData, setSongsData] = useState([]);
    const [track, setTrack] = useState(null);
    const [playStatus, setPlayStatus] = useState(false);
    const [time, setTime] = useState({
        currentTime: { second: 0, minute: 0 },
        totalTime: { second: 0, minute: 0 }
    });

    const fetchSongs = async () => {
        try {
            const response = await fetch(`${API_URL}/api/songs`);
            const songs = await response.json();
            const formattedSongs = songs.map((song, index) => ({
                id: index,
                name: song.name,
                image: `${API_URL}${song.image}`,
                file: `${API_URL}${song.file}`,
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

    const play = () => {
        audioRef.current.play();
        setPlayStatus(true);
    }

    const pause = () => {
        audioRef.current.pause();
        setPlayStatus(false); // ИСПРАВЛЕНО: было flase
    }

    const playWithId = async (id) => {
        if (songsData[id]) {
            await setTrack(songsData[id]);
            if (audioRef.current) {
                audioRef.current.play();
                setPlayStatus(true);
            }
        }
    }

    const previous = async () => {
        if (track && track.id > 0) {
            await setTrack(songsData[track.id - 1]);
            await audioRef.current.play();
            setPlayStatus(true);
        }
    }

    const next = async () => {
        if (track && track.id < songsData.length - 1) {
            await setTrack(songsData[track.id + 1]);
            await audioRef.current.play();
            setPlayStatus(true);
        }
    }

    const seekSong = (e) => {
        audioRef.current.currentTime = ((e.nativeEvent.offsetX / seekBg.current.clientWidth) * audioRef.current.duration);
    }

    useEffect(() => {
        setTimeout(() => {
            audioRef.current.ontimeupdate = () => {
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
            }
        }, 1000);
    }, [audioRef]);

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
        songsData,
        fetchSongs
    }

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    )
}

export default PlayerContextProvider;
