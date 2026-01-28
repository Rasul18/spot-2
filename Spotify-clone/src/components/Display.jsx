import React, { useEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import DisplayHome from './DisplayHome'
import DisplayAlbum from './DisplayAlbum'
import DisplayPlaceholder from './DisplayPlaceholder'
import { albumsData } from '../assets/assets'

const Display = () => {

  const displayRef = useRef();
  const location = useLocation();
  const isAlbum = location.pathname.toLowerCase().includes('/album');
  const albumId = isAlbum ? Number(location.pathname.split('/').pop()) : null;
  const bgColor = albumId !== null && albumsData[albumId] ? albumsData[albumId].bgColor : '#121212';

  useEffect(() => {
    if (isAlbum) {
      displayRef.current.style.background = `linear-gradient(${bgColor}, #121212)`
    }
    else {
      displayRef.current.style.background = `#121212`
    }
  })

  return (
    <div ref={displayRef} className='w-[100%] m-2 px-6 pt-4 rounded bg-[#121212] text-white overflow-auto lg:w-[75%] lg:ml-0'>
      <Routes>
        <Route path='/' element={<DisplayHome />} />
        <Route path='/album/:id' element={<DisplayAlbum />} />
        <Route path='/search' element={<DisplayPlaceholder title='Search' subtitle='Search will appear here.' />} />
        <Route path='/library' element={<DisplayPlaceholder title='Your Library' subtitle='Your saved playlists and podcasts will appear here.' />} />
        <Route path='/playlist/new' element={<DisplayPlaceholder title='Create Playlist' subtitle='Playlist creation will be added here.' />} />
        <Route path='/podcasts' element={<DisplayPlaceholder title='Podcasts' subtitle='Browse podcasts here.' />} />
      </Routes>
    </div>
  )
}

export default Display
