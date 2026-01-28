import React from 'react'

const DisplayPlaceholder = ({ title, subtitle }) => {
  return (
    <div className='mt-6 p-6 bg-[#181818] rounded'>
      <h1 className='text-3xl font-bold mb-2'>{title}</h1>
      <p className='text-[#b3b3b3]'>{subtitle}</p>
    </div>
  )
}

export default DisplayPlaceholder
