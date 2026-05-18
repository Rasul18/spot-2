import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import DisplayHome from './DisplayHome'
import DisplayAlbum from './DisplayAlbum'
import Search from './Search'
import Library from './Library'
import Playlists from './Playlists'
import Podcasts from './Podcasts'
import LoginForm from './LoginForm'
import { albumsData } from '../assets/assets'
import { useContext } from 'react'
import { PlayerContext } from '../context/player-context'

const Display = () => {

  const { theme } = useContext(PlayerContext);
  const isDark = theme === 'dark';
  const location = useLocation();
  const isAlbum = location.pathname.toLowerCase().includes('/album');
  const albumId = isAlbum ? Number(location.pathname.split('/').pop()) : null;
  const bgColor = albumId !== null && albumsData[albumId] ? albumsData[albumId].bgColor : isDark ? '#0f172a' : '#dbeafe';
  const background = isAlbum
    ? `linear-gradient(${bgColor}, ${isDark ? '#020617' : '#f8fafc'} 58%)`
    : isDark ? 'linear-gradient(180deg, #0f172a 0%, #020617 100%)' : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'

  return (
    <div
      className={`mx-0 flex-1 overflow-auto px-4 pb-40 pt-4 sm:px-6 lg:mx-3 lg:my-3 lg:rounded-[32px] lg:pb-36 lg:pt-5 lg:shadow-sm ${isDark ? 'text-slate-100 lg:border lg:border-slate-800 lg:bg-slate-950' : 'text-slate-900 lg:border lg:border-slate-200 lg:bg-white'}`}
      style={{ background }}
    >
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={<DisplayHome />} />
        <Route path='/album/:id' element={<DisplayAlbum />} />
        <Route path='/search' element={<Search />} />
        <Route path='/library' element={<Library />} />
        <Route path='/playlist/new' element={<Playlists />} />
        <Route path='/podcasts' element={<Podcasts />} />
        <Route path='/login' element={<LoginForm />} />
      </Routes>
    </div>
  )
}

export default Display
