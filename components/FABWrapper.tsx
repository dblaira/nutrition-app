'use client'

import { useRouter, usePathname } from 'next/navigation'
import { CaptureFAB } from './CaptureFAB'

export function FABWrapper() {
  const router = useRouter()
  const pathname = usePathname()

  if (pathname === '/login') return null

  return <CaptureFAB onEntryCreated={() => router.refresh()} />
}
