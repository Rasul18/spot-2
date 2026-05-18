import React, { useContext, useMemo, useRef, useState } from 'react'
import Navbar from './Navbar'
import { albumsData, assets } from '../assets/assets'
import AlbumItem from './AlbumItem'
import SongItem from './SongItem'
import AddSong from './AddSong'
import { PlayerContext } from '../context/player-context'
import GENRES from './genres.js'

const DisplayHome = () => {
  const [selectedGenre, setSelectedGenre] = useState('All')
  const { songsData, recommendations, genreStats, loadMoreJamendo, jamendoHasMore, jamendoLoading, jamendoError, theme } = useContext(PlayerContext)
  const jamendoScrollerRef = useRef(null)
  const isDark = theme === 'dark'
  const jamendoSongs = useMemo(
    () => songsData.filter((song) => song.source === 'jamendo'),
    [songsData]
  )

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

  const scrollJamendo = (direction) => {
    if (!jamendoScrollerRef.current) return

    jamendoScrollerRef.current.scrollBy({
      left: direction * 720,
      behavior: 'smooth'
    })
  }

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
              className={`px-4 py-1 rounded-full text-sm whitespace-nowrap ${selectedGenre === genre ? isDark ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-white' : isDark ? 'bg-slate-900 text-slate-200 ring-1 ring-slate-800' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className='mb-4'>
        <div className='my-5 flex items-center justify-between gap-3'>
          <h1 className='font-bold text-2xl'>Новинки из Jamendo</h1>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => scrollJamendo(-1)}
              className={`rounded-full p-2 transition ${isDark ? 'bg-slate-900 ring-1 ring-slate-800 hover:bg-slate-800' : 'bg-white ring-1 ring-slate-200 hover:bg-slate-50'}`}
              aria-label='Прокрутить Jamendo влево'
            >
              <img className='w-4' src={assets.arrow_left} alt='' />
            </button>
            <button
              type='button'
              onClick={() => scrollJamendo(1)}
              className={`rounded-full p-2 transition ${isDark ? 'bg-slate-900 ring-1 ring-slate-800 hover:bg-slate-800' : 'bg-white ring-1 ring-slate-200 hover:bg-slate-50'}`}
              aria-label='Прокрутить Jamendo вправо'
            >
              <img className='w-4' src={assets.arrow_right} alt='' />
            </button>
          </div>
        </div>
        {jamendoSongs.length === 0 ? (
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Jamendo-треки пока не загрузились.</p>
        ) : (
          <>
            <div
              ref={jamendoScrollerRef}
              className='flex gap-3 overflow-x-auto overflow-y-hidden pb-2 pr-2 scroll-smooth'
            >
              {jamendoSongs.map((item) => (
                <SongItem
                  key={item.id}
                  name={item.name}
                  desc={item.desc}
                  id={item.id}
                  image={item.image}
                  source={item.source}
                />
              ))}
            </div>
            <div className='mt-3 flex flex-wrap items-center gap-3'>
              {jamendoHasMore ? (
                <button
                  type='button'
                  onClick={loadMoreJamendo}
                  disabled={jamendoLoading}
                  className={`rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60 ${isDark ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-white'}`}
                >
                  {jamendoLoading ? 'Загружаю...' : 'Показать еще из Jamendo'}
                </button>
              ) : (
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Все доступные Jamendo-треки уже загружены.</p>
              )}
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Подсказка: можно листать стрелками или горизонтальным скроллом.</p>
            </div>
            {jamendoError && <p className='mt-2 text-sm text-rose-600'>{jamendoError}</p>}
          </>
        )}
      </div>

      <div className='mb-4'>
        <h1 className='my-5 font-bold text-2xl'>Рекомендации для тебя</h1>
        {recommendations.length === 0 ? (
          <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
            Послушай несколько треков и поставь лайки. После этого рекомендации начнут считаться по формуле:
            score = plays * 1 + full_listens * 2 + likes * 3.
          </p>
        ) : (
          <div className='flex overflow-auto'>
            {recommendations.map((item) => (
              <SongItem
                key={item.id}
                name={item.name}
                desc={`${item.genre || 'Pop'}${item.album ? ` • ${item.album}` : ''}`}
                id={item.id}
                image={item.image}
                source={item.source}
              />
            ))}
          </div>
        )}
        {genreStats.length > 0 && (
          <div className={`mt-3 flex flex-wrap gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {genreStats.map((item) => (
              <div key={item.genre} className={`rounded-full px-3 py-1 ${isDark ? 'bg-slate-900 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200'}`}>
                {item.genre}: {item.score}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='mb-4'>
        {!hasSongs && <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>По этому жанру песен пока нет.</p>}

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
                  source={item.source}
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
