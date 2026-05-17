/**
 * @file HomePage.jsx
 * @description Página de inicio. Ensambla todas las secciones en el orden correcto:
 * Hero → Noticias → Niveles → Servicios → Opiniones → CTA
 */

import { useEffect } from 'react'
import { HeroSection }          from '@/components/sections/HeroSection'
import { NoticiasSection }      from '@/components/sections/NoticiasSection'
import { EstadisticasSection }  from '@/components/sections/EstadisticasSection'
import { NivelesSection }       from '@/components/sections/NivelesSection'
import { ServiciosSection }     from '@/components/sections/ServiciosSection'
import { OpinionesSection }     from '@/components/sections/OpinionesSection'
import { CTASection }           from '@/components/sections/CTASection'

export default function HomePage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <HeroSection />
      <NoticiasSection />
      <EstadisticasSection />
      <NivelesSection />
      <ServiciosSection />
      <OpinionesSection />
      <CTASection />
    </>
  )
}
