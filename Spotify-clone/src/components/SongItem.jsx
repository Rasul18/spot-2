import React, { useContext } from 'react'
import { PlayerContext } from '../context/player-context';

const SongItem = ({ name, image, desc, id, source }) => {

  const { playWithId, theme } = useContext(PlayerContext);
  const isDark = theme === 'dark';

  return (
    <div onClick={() => playWithId(id)} className={`min-w-[180px] shrink-0 rounded-2xl border p-3 cursor-pointer shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
      <img className='h-[180px] w-full rounded-xl object-cover' src={image} alt="" />
      <div className='mt-2 mb-1 flex items-center justify-between gap-2'>
        <p className={isDark ? 'font-bold text-slate-100' : 'font-bold text-slate-900'}>{name}</p>
        {source === 'jamendo' && (
          <span className='rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700'>
            JAMENDO
          </span>
        )}
      </div>
      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
    </div>
  )
}

export default SongItem
