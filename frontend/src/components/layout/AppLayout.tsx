import React, { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { HeaderBar } from './HeaderBar'
import { ToastContainer } from '../common/ToastContainer'
import { useApp } from '@/context/AppContext'
import { XCircle } from '@phosphor-icons/react'

export const AppLayout: React.FC = () => {
  const { currentUser } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-[#FFFFFF] overflow-hidden text-[#334155]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Slideout Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#F8FAFC] shadow-2xl z-10">
            <div className="absolute top-3 right-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900"
              >
                <XCircle weight="fill" className="w-6 h-6" />
                <span className="sr-only">Close sidebar</span>
              </button>
            </div>
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <HeaderBar onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#FFFFFF]">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  )
}
