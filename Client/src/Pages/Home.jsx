import React from 'react'
import MainBanner from '../Components/MainBanner'
import Categories from '../Components/Categories'
import BestSeller from '../Components/BestSeller'
import BottomBanner from '../Components/BottomBanner'
import NewsLetter from '../Components/NewsLetter'
// import Testimony from '../Components/Testimonials'
import Testimonial from '../Components/Testimonials'
import InfoBanner from '../Components/InfoBanner'

const Home = () => {
  return (
    <>
      {/* Full width hero */}
      <MainBanner />

      {/* Rest of page */}
      <div className="px-6 md:px-16 lg:px-24">

        <Categories />
        <BestSeller />
        {/* <NewsLetter /> */}
        <Testimonial/>
        {/* <BottomBanner /> */}
        <InfoBanner/>
        

      </div>
    </>
  )
}

export default Home