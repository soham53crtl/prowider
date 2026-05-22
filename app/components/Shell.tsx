'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <>
      {pathname !== '/login' && <Navbar />}
      {children}
    </>
  )
}
