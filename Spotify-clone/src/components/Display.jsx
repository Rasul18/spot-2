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

const Display = () => {

  const location = useLocation();
  const isAlbum = location.pathname.toLowerCase().includes('/album');
  const albumId = isAlbum ? Number(location.pathname.split('/').pop()) : null;
  const bgColor = albumId !== null && albumsData[albumId] ? albumsData[albumId].bgColor : '#121212';
  const background = isAlbum
    ? `linear-gradient(${bgColor}, #121212)`
    : '#121212'

  return (
    <div
      className='w-[100%] m-2 px-6 pt-4 rounded bg-[#121212] text-white overflow-auto lg:w-[75%] lg:ml-0'
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
