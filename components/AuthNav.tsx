'use client'

import { useSession, signOut } from 'next-auth/react'
import { LogOut, User, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function AuthNav() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
        <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
        )}
        <span className="hidden sm:block text-sm font-medium">
          {session.user?.name || 'User'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <div className="px-4 py-2 text-sm text-gray-700 border-b">
            <p className="font-medium">{session.user?.name}</p>
            <p className="text-gray-500">{session.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
