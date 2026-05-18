import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { PlayerContext } from '../context/player-context'

const podcasts = [
  {
    id: 'pod-1',
    title: 'Tech Talk Daily',
    desc: 'Daily tech news and short interviews.',
    image: assets.img3
  },
  {
    id: 'pod-2',
    title: 'Design Notes',
    desc: 'Conversations about product and visual design.',
    image: assets.img7
  },
  {
    id: 'pod-3',
    title: 'Startup Stories',
    desc: 'Founders share real lessons and mistakes.',
    image: assets.img9
  },
  {
    id: 'pod-4',
    title: 'Music Minds',
    desc: 'Artists talk about creativity and process.',
    image: assets.img12
  }
]

const Podcasts = () => {
  const { theme } = useContext(PlayerContext)
  const isDark = theme === 'dark'

  return (
    <div className='mt-6'>
      <h1 className='text-3xl font-bold mb-2'>Podcasts</h1>
      <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Browse curated podcast picks.</p>
      <div className='flex flex-wrap gap-3'>
        {podcasts.map((pod) => (
          <div key={pod.id} className={`w-[200px] rounded-2xl border p-3 transition ${isDark ? 'border-slate-800 bg-slate-900 hover:bg-slate-800' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
            <img className='rounded mb-3' src={pod.image} alt={pod.title} />
            <p className='font-semibold'>{pod.title}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{pod.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Podcasts
