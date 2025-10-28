import React from 'react'
import neopopIcon1 from '@/assets/neopop-icon-1.svg'
import neopopIcon2 from '@/assets/neopop-icon-2.svg'
import neopopIcon3 from '@/assets/neopop-icon-3.svg'
import Image from 'next/image'

const Loader = () => {
  return (
    <div className='w-fit h-fit flex flex-row justify-center items-center gap-5'>
        <Image src={neopopIcon1} alt='loader' className='w-20 h-20 animate-spin neopop-float' />
        <Image src={neopopIcon2} alt='loader' className='w-20 h-20 animate-spin neopop-pulse' />
        <Image src={neopopIcon3} alt='loader' className='w-20 h-20 animate-spin neopop-float' />
    </div>
  )
}

export default Loader