import React, { useContext, useEffect, useState } from 'react'
import { assets, } from '../assets/assets'
import { PlayerContext } from '../context/player-context';

const Player = () => {

    const { track, seekBar, seekBg, playStatus, play, pause, time, previous, next, seekSong, shuffle, loop, toggleShuffle, toggleLoop, volume, setVolume, isTrackLiked, toggleLikeTrack, theme } = useContext(PlayerContext);
    const [pendingVolume, setPendingVolume] = useState(volume);
    const isDark = theme === 'dark';
    const iconClass = isDark
        ? 'cursor-pointer opacity-90 transition hover:opacity-100'
        : 'cursor-pointer opacity-90 transition hover:opacity-100 [filter:brightness(0)_saturate(100%)]';
    const mutedIconClass = isDark
        ? 'opacity-60'
        : 'opacity-70 [filter:brightness(0)_saturate(100%)]';

    useEffect(() => {
        setPendingVolume(volume);
    }, [volume]);

    const applyVolume = () => {
        setVolume(pendingVolume);
    };

    return (
        <div className={`fixed inset-x-0 bottom-0 z-40 border-t px-3 py-3 backdrop-blur ${isDark ? 'border-slate-800 bg-slate-950/95 text-slate-100' : 'border-slate-200 bg-white/95 text-slate-900'}`}>
            <div className='mx-auto flex max-w-screen-2xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
                <div className='flex items-center gap-3 lg:min-w-[260px]'>
                    {track && <img className={`h-12 w-12 rounded-xl object-cover ring-1 ${isDark ? 'ring-slate-700' : 'ring-slate-200'}`} src={track.image} alt="" />}
                    <div className='min-w-0'>
                        <p className='truncate font-semibold'>{track ? track.name : 'Loading...'}</p>
                        <p className={`truncate text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{track ? track.desc.slice(0, 36) : ''}</p>
                    </div>
                </div>
                <div className='flex flex-col items-center gap-2 lg:flex-1'>
                    <div className='flex items-center gap-5'>
                        <img onClick={toggleShuffle} className={`w-4 ${iconClass} ${shuffle ? 'opacity-100' : 'opacity-50'}`} src={assets.shuffle_icon} alt="" />
                        <img onClick={previous} className={`w-4 ${iconClass}`} src={assets.prev_icon} alt="" />
                        {playStatus
                            ? <img onClick={pause} className={`w-5 ${iconClass}`} src={assets.pause_icon} alt="" />
                            : <img onClick={play} className={`w-5 ${iconClass}`} src={assets.play_icon} alt="" />
                        }
                        <img onClick={next} className={`w-4 ${iconClass}`} src={assets.next_icon} alt="" />
                        <img onClick={toggleLoop} className={`w-4 ${iconClass} ${loop ? 'opacity-100' : 'opacity-50'}`} src={assets.loop_icon} alt="" />
                    </div>
                    <div className='flex w-full items-center gap-3'>
                        <p className={`min-w-[34px] text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{time.currentTime.minute}:{time.currentTime.second}</p>
                        <div ref={seekBg} onClick={seekSong} className={`h-1.5 flex-1 rounded-full cursor-pointer ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                            <hr ref={seekBar} className='h-1.5 border-none w-8 bg-emerald-500 rounded-full' />
                        </div>
                        <p className={`min-w-[34px] text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{time.totalTime.minute}:{time.totalTime.second}</p>
                    </div>
                </div>
                {track && (
                    <button
                        type='button'
                        onClick={toggleLikeTrack}
                        className={`self-start rounded-full border px-3 py-1 text-xs lg:self-center ${isTrackLiked ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-600'}`}
                    >
                        {isTrackLiked ? 'Лайк поставлен' : 'Лайк'}
                    </button>
                )}
                <div className='flex items-center gap-2 lg:min-w-[160px] lg:justify-end'>
                    <img className={`w-4 ${mutedIconClass}`} src={assets.volume_icon} alt="" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={pendingVolume}
                        onChange={(e) => setPendingVolume(Number(e.target.value))}
                        onMouseUp={applyVolume}
                        onTouchEnd={applyVolume}
                        onBlur={applyVolume}
                        className={`w-full accent-emerald-500 lg:w-24 ${isDark ? '' : '[filter:contrast(1.1)]'}`}
                    />
                </div>
            </div>
        </div>
    )
}

export default Player
