import React from 'react'
import { assets, features } from '../assets/assets'

const BottomBanner = () => {
  return (
    <div className='relative mt-20'>
        <img src={assets.bottom_banner_image} alt="banner" width={1400} height={510} loading="lazy" decoding="async" className='w-full hidden md:block' />
        <img src={assets.bottom_banner_image_sm} alt="banner" width={1350} height={360} loading="lazy" decoding="async" className='w-full md:hidden' />

        
    </div>
    
  )
}

export default BottomBanner