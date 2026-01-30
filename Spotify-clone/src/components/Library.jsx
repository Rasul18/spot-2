import React, { useContext } from 'react'
import { PlayerContext } from '../context/PlayerContext'
import SongItem from './SongItem'

const Library = () => {
  const { songsData } = useContext(PlayerContext)

  return (
    <div className='mt-6'>
      <h1 className='text-3xl font-bold mb-4'>Your Library</h1>
      {songsData.length === 0 ? (
        <p className='text-[#b3b3b3]'>No songs yet. Add one above.</p>
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
