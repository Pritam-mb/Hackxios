import { Outlet } from 'react-router-dom'
// import Navbar from './Navbar'
// import Sidebar from './Sidebar'
import Header from './header'

export default function Layout() {
  return (
    <div className="min-h-screen bg-dark">
      <Header />
      <div className="flex">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
