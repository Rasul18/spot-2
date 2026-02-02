import React from 'react'
import { assets } from '../assets/assets'

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
  return (
    <div className='mt-6'>
      <h1 className='text-3xl font-bold mb-2'>Podcasts</h1>
      <p className='text-[#b3b3b3] mb-4'>Browse curated podcast picks.</p>
      <div className='flex flex-wrap gap-3'>
        {podcasts.map((pod) => (
          <div key={pod.id} className='w-[200px] p-3 rounded bg-[#181818] hover:bg-[#222]'>
            <img className='rounded mb-3' src={pod.image} alt={pod.title} />
            <p className='font-semibold'>{pod.title}</p>
            <p className='text-[#b3b3b3] text-sm'>{pod.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Podcasts
