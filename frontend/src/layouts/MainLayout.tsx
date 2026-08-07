import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Header } from '../components/Header'
import { MobileHeader } from './MobileHeader'
import { MobileMenu } from './MobileMenu'
import { Sidebar } from './Sidebar'

export function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const location = useLocation()

  return (
    <div className="main-layout">
      <div className="desktop-sidebar-shell">
        <Sidebar />
      </div>

      <div className="mobile-layout-shell">
        <MobileHeader onOpenMenu={() => setIsMobileMenuOpen(true)} />
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>

      <div className="main-panel">
        <div className="desktop-header-shell">
          <Header />
        </div>
        <main className="main-content">
          <div className="page-transition" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
