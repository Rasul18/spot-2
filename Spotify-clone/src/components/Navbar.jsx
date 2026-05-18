import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { PlayerContext } from '../context/player-context'

const Navbar = () => {

  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(PlayerContext);
  const isDark = theme === 'dark';

  return (
    <>
      <div className='w-full flex justify-between items-center font-semibold'>
        <div className='flex items-center gap-2'>
          <img onClick={() => navigate(-1)} className={`w-8 rounded-2xl border p-2 cursor-pointer shadow-sm ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`} src={assets.arrow_left} alt="" />
          <img onClick={() => navigate(1)} className={`w-8 rounded-2xl border p-2 cursor-pointer shadow-sm ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`} src={assets.arrow_right} alt="" />
        </div>
        <div className='flex items-center gap-4'>
          <button type='button' onClick={toggleTheme} className={`rounded-2xl px-3 py-1 text-[15px] ${isDark ? 'bg-slate-800 text-slate-100' : 'bg-slate-200 text-slate-700'}`}>
            {isDark ? 'Light' : 'Dark'}
          </button>
          <p className={`hidden cursor-pointer rounded-2xl px-4 py-1 text-[15px] md:block ${isDark ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-white'}`}>Explorer Premium</p>
          <p className={`cursor-pointer rounded-2xl border px-3 py-1 text-[15px] ${isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}>Install App</p>
          <p className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isDark ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-100 text-emerald-700'}`}>R</p>
        </div>
      </div>
      <div className='flex items-center gap-2 mt-4'>
      </div>
    </>
  )
}

export default Navbar
