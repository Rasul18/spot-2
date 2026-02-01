import React, { useContext, useEffect, useMemo, useState } from 'react'
import { PlayerContext } from '../context/PlayerContext'
import SongItem from './SongItem'

const STORAGE_KEY = 'playlists'

const loadPlaylists = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const savePlaylists = (playlists) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists))
}

const Playlists = () => {
  const { songsData } = useContext(PlayerContext)
  const [playlists, setPlaylists] = useState([])
  const [name, setName] = useState('')
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    const stored = loadPlaylists()
    setPlaylists(stored)
    if (stored.length > 0) setActiveId(stored[0].id)
  }, [])

  useEffect(() => {
    savePlaylists(playlists)
  }, [playlists])

  const activePlaylist = useMemo(
    () => playlists.find((p) => p.id === activeId) || null,
    [playlists, activeId]
  )

  const createPlaylist = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const newPlaylist = {
      id: Date.now().toString(),
      name: trimmed,
      songIds: []
    }
    const next = [newPlaylist, ...playlists]
    setPlaylists(next)
    setActiveId(newPlaylist.id)
    setName('')
  }

  const removePlaylist = (id) => {
    const next = playlists.filter((p) => p.id !== id)
    setPlaylists(next)
    setActiveId(next[0]?.id ?? null)
  }

  const addSong = (songId) => {
    if (!activePlaylist) return
    if (activePlaylist.songIds.includes(songId)) return
    const next = playlists.map((p) =>
      p.id === activePlaylist.id
        ? { ...p, songIds: [...p.songIds, songId] }
        : p
    )
    setPlaylists(next)
  }

  const removeSong = (songId) => {
    if (!activePlaylist) return
    const next = playlists.map((p) =>
      p.id === activePlaylist.id
        ? { ...p, songIds: p.songIds.filter((id) => id !== songId) }
        : p
    )
    setPlaylists(next)
  }

  const playlistSongs = activePlaylist
    ? songsData.filter((s) => activePlaylist.songIds.includes(s.id))
    : []

  const availableSongs = activePlaylist
    ? songsData.filter((s) => !activePlaylist.songIds.includes(s.id))
    : songsData

  return (
    <div className='mt-6'>
      <h1 className='text-3xl font-bold mb-4'>Playlists</h1>

      <div className='flex flex-col md:flex-row gap-4'>
        <div className='md:w-[260px]'>
          <div className='bg-[#181818] p-4 rounded'>
            <p className='font-semibold mb-2'>Create playlist</p>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Playlist name'
              className='w-full p-2 rounded bg-[#1f1f1f] text-white'
            />
            <button
              onClick={createPlaylist}
              className='w-full mt-3 px-4 py-2 bg-white text-black rounded-full'
            >
              Create
            </button>
          </div>

          <div className='bg-[#181818] p-4 rounded mt-4'>
            <p className='font-semibold mb-2'>Your playlists</p>
            {playlists.length === 0 ? (
              <p className='text-[#b3b3b3]'>No playlists yet.</p>
            ) : (
              <div className='flex flex-col gap-2'>
                {playlists.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                      activeId === p.id ? 'bg-[#2a2a2a]' : 'bg-[#1f1f1f]'
                    }`}
                  >
                    <span onClick={() => setActiveId(p.id)}>{p.name}</span>
                    <button
                      onClick={() => removePlaylist(p.id)}
                      className='text-xs text-[#b3b3b3] hover:text-white'
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='flex-1'>
          {!activePlaylist ? (
            <p className='text-[#b3b3b3]'>Select or create a playlist.</p>
          ) : (
            <>
              <h2 className='text-2xl font-bold mb-3'>{activePlaylist.name}</h2>
              <p className='text-[#b3b3b3] mb-4'>
                {playlistSongs.length} song{playlistSongs.length === 1 ? '' : 's'}
              </p>

              <div className='mb-6'>
                <p className='font-semibold mb-2'>In playlist</p>
                {playlistSongs.length === 0 ? (
                  <p className='text-[#b3b3b3]'>No songs yet.</p>
                ) : (
                  <div className='flex flex-wrap gap-3'>
                    {playlistSongs.map((item) => (
                      <div key={item.id} className='relative group'>
                        <SongItem
                          name={item.name}
                          desc={item.desc}
                          id={item.id}
                          image={item.image}
                        />
                        <button
                          onClick={() => removeSong(item.id)}
                          className='absolute top-2 right-2 hidden group-hover:block bg-black/70 text-white text-xs px-2 py-1 rounded'
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className='font-semibold mb-2'>Add songs</p>
                {availableSongs.length === 0 ? (
                  <p className='text-[#b3b3b3]'>All songs are already added.</p>
                ) : (
                  <div className='flex flex-wrap gap-3'>
                    {availableSongs.map((item) => (
                      <div key={item.id} className='relative group'>
                        <SongItem
                          name={item.name}
                          desc={item.desc}
                          id={item.id}
                          image={item.image}
                        />
                        <button
                          onClick={() => addSong(item.id)}
                          className='absolute top-2 right-2 hidden group-hover:block bg-black/70 text-white text-xs px-2 py-1 rounded'
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Playlists
