import { Outlet } from 'react-router-dom'
import { Header } from '../components/Header'
import { Sidebar } from './Sidebar'

export function MainLayout() {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-panel">
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
