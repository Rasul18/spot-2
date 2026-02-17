import React, { useContext, useMemo, useState } from 'react'
import Navbar from './Navbar'
import { albumsData } from '../assets/assets'
import AlbumItem from './AlbumItem'
import SongItem from './SongItem'
import AddSong from './AddSong'
import { PlayerContext } from '../context/PlayerContext'
import GENRES from './genres.js'

const DisplayHome = () => {
  const [selectedGenre, setSelectedGenre] = useState('All')
  const { songsData } = useContext(PlayerContext)

  const filteredSongs = useMemo(() => {
    if (selectedGenre === 'All') return songsData
    return songsData.filter((song) => song.genre === selectedGenre)
  }, [songsData, selectedGenre])

  const groupedByGenre = useMemo(() => {
    const source = selectedGenre === 'All' ? songsData : filteredSongs;
    return source.reduce((acc, song) => {
      const key = song.genre || 'Pop';
      if (!acc[key]) acc[key] = [];
      acc[key].push(song);
      return acc;
    }, {});
  }, [songsData, filteredSongs, selectedGenre]);

  const hasSongs = Object.keys(groupedByGenre).length > 0;

  return (
    <>
      <Navbar />
      <AddSong />

      <div className='mb-4'>
        <h1 className='my-5 font-bold text-2xl'>Feature Charts</h1>
        <div className='flex overflow-auto'>
          {albumsData.map((item, index) => (
            <AlbumItem key={index} name={item.name} desc={item.desc} id={item.id} image={item.image} />
          ))}
        </div>
      </div>

      <div className='mb-4'>
        <h1 className='my-5 font-bold text-2xl'>Подборки по жанрам</h1>
        <div className='flex gap-2 overflow-auto'>
          {['All', ...GENRES].map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-1 rounded-full text-sm whitespace-nowrap ${selectedGenre === genre ? 'bg-white text-black' : 'bg-[#ffffff26] text-white'
                }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className='mb-4'>
        {!hasSongs && <p className='text-slate-300'>По этому жанру песен пока нет.</p>}

        {Object.entries(groupedByGenre).map(([genre, songs]) => (
          <div key={genre} className='mb-6'>
            <h2 className='my-3 font-bold text-xl'>{genre}</h2>
            <div className='flex overflow-auto'>
              {songs.map((item) => (
                <SongItem
                  key={item.id}
                  name={item.name}
                  desc={item.desc}
                  id={item.id}
                  image={item.image}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

    </>
  )
}

export default DisplayHome
