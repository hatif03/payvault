'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

export const AuthButton = () => {
    const {data:session} = useSession()

    if(session)
      return (
        <Link 
          href="/dashboard"
          className="button-primary neopop-gradient-primary text-white px-8 font-bold text-xl py-2 mt-5 hover:neopop-glow transition-all duration-300"
        >
          DASHBOARD
        </Link>
      )

      return (
          <Link 
            href="/auth/signin"
            className="button-primary neopop-gradient-primary text-white px-8 font-bold text-xl py-2 mt-5 hover:neopop-glow transition-all duration-300"
          >
            GET STARTED
          </Link>
      )
}
