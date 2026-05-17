/**
 * @file Layout.jsx
 * @description Wrapper de layout con transición suave entre páginas.
 */

import { useLocation, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Topbar } from './Topbar'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.25 } },
}

export function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          className="flex-1"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
