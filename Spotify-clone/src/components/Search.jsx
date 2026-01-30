import React, { useContext, useMemo, useState } from 'react'
import { PlayerContext } from '../context/PlayerContext'
import SongItem from './SongItem'

const Search = () => {
  const { songsData } = useContext(PlayerContext)
  const [query, setQuery] = useState('')

  const filteredSongs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return songsData
    return songsData.filter((song) =>
      [song.name, song.desc, song.album]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    )
  }, [query, songsData])

  return (
    <div className='mt-6'>
      <h1 className='text-3xl font-bold mb-4'>Search</h1>
      <input
        type='text'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Search songs, albums, or descriptions...'
        className='w-full md:w-[420px] p-2 rounded bg-[#1f1f1f] text-white'
      />
      <p className='text-[#b3b3b3] mt-2'>
        {filteredSongs.length} result{filteredSongs.length === 1 ? '' : 's'}
      </p>
      <div className='mt-4 flex flex-wrap gap-3'>
        {filteredSongs.map((item, index) => (
          <SongItem
            key={item.id ?? index}
            name={item.name}
            desc={item.desc}
            id={item.id}
            image={item.image}
          />
        ))}
      </div>
    </div>
  )
}

export default Search
