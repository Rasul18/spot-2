import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { PlayerContext } from '../context/player-context'

const AlbumItem = ({image, name, desc, id}) => {

    const navigate = useNavigate()
    const { theme } = useContext(PlayerContext)
    const isDark = theme === 'dark'

  return (
    <div onClick={()=>navigate(`/album/${id}`)} className={`min-w-[180px] rounded-2xl border p-3 cursor-pointer shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <img className='rounded-xl' src={image} alt="" />
        <p className={`mt-2 mb-1 font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{name}</p>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
    </div>
  )
}

export default AlbumItem  
