import React, { useContext } from 'react'
import { PlayerContext } from '../context/player-context'
import SongItem from './SongItem'

const Library = () => {
  const { songsData, theme } = useContext(PlayerContext)
  const isDark = theme === 'dark'

  return (
    <div className='mt-6'>
      <h1 className='text-3xl font-bold mb-4'>Your Library</h1>
      {songsData.length === 0 ? (
        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No songs yet. Add one above.</p>
      ) : (
        <div className='flex flex-wrap gap-3'>
          {songsData.map((item, index) => (
            <SongItem
              key={item.id ?? index}
              name={item.name}
              desc={item.desc}
              id={item.id}
              image={item.image}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Library
