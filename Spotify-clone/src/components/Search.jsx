import React, { useContext, useMemo, useState } from 'react'
import { PlayerContext } from '../context/player-context'
import SongItem from './SongItem'

const Search = () => {
  const { songsData, theme } = useContext(PlayerContext)
  const [query, setQuery] = useState('')
  const isDark = theme === 'dark'

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
        className={`w-full rounded-2xl border p-3 shadow-sm md:w-[420px] ${isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}
      />
      <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
