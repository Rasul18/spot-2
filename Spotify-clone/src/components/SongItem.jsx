import React, { useContext } from 'react'
import { PlayerContext } from '../context/player-context';

const SongItem = ({ name, image, desc, id, source }) => {

  const { playWithId } = useContext(PlayerContext);

  return (
    <div onClick={() => playWithId(id)} className='min-w-[180px] shrink-0 p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]'>
      <img className='w-full h-[180px] object-cover rounded' src={image} alt="" />
      <div className='mt-2 mb-1 flex items-center justify-between gap-2'>
        <p className='font-bold'>{name}</p>
        {source === 'jamendo' && (
          <span className='rounded-full bg-[#1db954] px-2 py-0.5 text-[10px] font-semibold text-black'>
            JAMENDO
          </span>
        )}
      </div>
      <p className='text-slate-200 text-sm'>{desc}</p>
    </div>
  )
}

export default SongItem
