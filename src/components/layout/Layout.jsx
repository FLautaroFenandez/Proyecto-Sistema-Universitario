/**
 * @file Layout.jsx
 * @description Wrapper de layout que incluye Topbar, Navbar, contenido y Footer.
 * Usado como elemento padre en App.jsx con <Outlet /> de React Router.
 */

import { Outlet } from 'react-router-dom'
import { Topbar } from './Topbar'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
