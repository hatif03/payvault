import React from 'react'
import pattern1 from '@/assets/footer_1.svg'
import neopopBackground from '@/assets/neopop-background.svg'
import Image from 'next/image'
import { cn } from '@/app/lib/cssLibs'

const FooterPattern = ({design, className}: {design: Number, className?: string}) => {
  
    if(design === 1){
        return (
            <div className={cn('absolute w-fit h-fit ', className)}>
                <Image src={neopopBackground} alt='neopop background' className='' />
            </div>
        )
    }
}

export default FooterPattern