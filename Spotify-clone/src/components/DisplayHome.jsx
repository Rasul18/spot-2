import React, { useContext } from 'react'
import Navbar from './Navbar'
import { albumsData } from '../assets/assets'
import AlbumItem from './AlbumItem'
import SongItem from './SongItem'
import AddSong from './AddSong'
import { PlayerContext } from '../context/PlayerContext'

const DisplayHome = () => {

  const { songsData } = useContext(PlayerContext);

  return (
    <>
      <Navbar />
      <AddSong />
      <div className='mb-4'>
        <h1 className='my-5 font-bold text-2xl'>Feature Charts</h1>
        <div className='flex overflow-auto'>
          {albumsData.map((item, index) => (<AlbumItem key={index} name={item.name} desc={item.desc} id={item.id} image={item.image} />))}
        </div>
      </div>
      <div className='mb-4'>
        <h1 className='my-5 font-bold text-2xl'>Today's biggest hits</h1>
        <div className='flex overflow-auto'>
          {songsData.map((item, index) => (<SongItem key={item.id} name={item.name} desc={item.desc} id={item.id} image={item.image} />))}
        </div>
      </div>
    </>
  )
}

export default DisplayHome
