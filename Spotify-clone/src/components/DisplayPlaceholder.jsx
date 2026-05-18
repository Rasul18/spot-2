import React, { useContext } from 'react'
import { PlayerContext } from '../context/player-context'

const DisplayPlaceholder = ({ title, subtitle }) => {
  const { theme } = useContext(PlayerContext)
  const isDark = theme === 'dark'

  return (
    <div className={`mt-6 rounded-[28px] p-6 ${isDark ? 'bg-slate-900' : 'bg-white shadow-sm'}`}>
      <h1 className='text-3xl font-bold mb-2'>{title}</h1>
      <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{subtitle}</p>
    </div>
  )
}

export default DisplayPlaceholder
