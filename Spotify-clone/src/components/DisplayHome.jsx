import React, { useContext } from 'react'
import Navbar from './Navbar'
import { albumsData } from '../assets/assets'
import { songsData } from '../assets/assets'
import AlbumItem from './AlbumItem'
import SongItem from './SongItem'
import AddSong from './AddSong'
import { useParams } from 'react-router-dom'
import { PlayerContext } from '../context/PlayerContext'

const DisplayHome = () => {

  const { id } = useParams();
  const albumData = albumsData[id];
  const { playWithId } = useContext(PlayerContext);

  return (
    <>
      <Navbar />
      <AddSong />
      <div className='mb-4'>
        <h1 className='my-5 font-bold text-2xl'>Featur Cgarts</h1>
        <div className='flex overflow-auto'>
          {albumsData.map((item, index) => (<AlbumItem key={index} name={item.name} desc={item.desc} id={item.id} image={item.image} />))}
        </div>
      </div>
      <div className='mb-4'>
        <h1 className='my-5 font-bold text-2xl'>Today`s biggest hits</h1>
        <div className='flex overflow-auto'>
          {songsData.map((item, index) => (<SongItem key={index} name={item.name} desc={item.desc} id={item.id} image={item.image} />))}
        </div>
      </div>
    </>
  )
}

export default DisplayHome