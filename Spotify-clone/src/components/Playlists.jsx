import React, { useContext, useEffect, useMemo, useState } from 'react'
import { PlayerContext } from '../context/player-context'
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
  const { songsData, theme } = useContext(PlayerContext)
  const [playlists, setPlaylists] = useState([])
  const [name, setName] = useState('')
  const [activeId, setActiveId] = useState(null)
  const isDark = theme === 'dark'

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
          <div className={`rounded-[28px] border p-4 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <p className='font-semibold mb-2'>Create playlist</p>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Playlist name'
              className={`w-full rounded-2xl border p-3 ${isDark ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'}`}
            />
            <button
              onClick={createPlaylist}
              className={`mt-3 w-full rounded-full px-4 py-2 ${isDark ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-white'}`}
            >
              Create
            </button>
          </div>

          <div className={`mt-4 rounded-[28px] border p-4 shadow-sm ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <p className='font-semibold mb-2'>Your playlists</p>
            {playlists.length === 0 ? (
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No playlists yet.</p>
            ) : (
              <div className='flex flex-col gap-2'>
                {playlists.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between rounded-2xl p-2 cursor-pointer ${activeId === p.id ? isDark ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-white' : isDark ? 'bg-slate-950' : 'bg-slate-50'
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveId(p.id)}
                      className='flex-1 text-left'
                    >
                      {p.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => removePlaylist(p.id)}
                      className={`text-xs ${activeId === p.id ? isDark ? 'text-slate-900' : 'text-slate-200' : isDark ? 'text-slate-400 hover:text-slate-100' : 'text-slate-500 hover:text-slate-900'}`}
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
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Select or create a playlist.</p>
          ) : (
            <>
              <h2 className='text-2xl font-bold mb-3'>{activePlaylist.name}</h2>
              <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {playlistSongs.length} song{playlistSongs.length === 1 ? '' : 's'}
              </p>

              <div className='mb-6'>
                <p className='font-semibold mb-2'>In playlist</p>
                {playlistSongs.length === 0 ? (
                  <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No songs yet.</p>
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
                          className='absolute right-2 top-2 hidden rounded-full bg-white/95 px-2 py-1 text-xs text-rose-600 shadow-sm ring-1 ring-slate-200 group-hover:block'
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
                  <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>All songs are already added.</p>
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
                          className='absolute right-2 top-2 hidden rounded-full bg-white/95 px-2 py-1 text-xs text-slate-700 shadow-sm ring-1 ring-slate-200 group-hover:block'
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
