/**
 * @file useAuth.js
 * @description Hook principal de autenticación.
 * Provee: user, profile (con rol), loading, signIn, signUp, signOut.
 * Escucha cambios de sesión en tiempo real con onAuthStateChange.
 * Si el usuario existe en Auth pero no tiene fila en profiles,
 * la crea automáticamente desde los metadatos (self-healing).
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return }

    const { data } = await supabase
      .from('profiles')
      .select('id, nombre, rol, activo')
      .eq('id', userId)
      .single()

    if (data) { setProfile(data); return }

    // Self-healing: el usuario existe en Auth pero no en profiles
    // (pasa si se creó desde el dashboard de Supabase o si el INSERT
    // falló durante el registro). Creamos el perfil desde sus metadatos.
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { setProfile(null); return }

    const meta = authUser.user_metadata ?? {}
    const rolesAutoRegistro = ['padre', 'estudiante']
    const nuevoPerfil = {
      id:       userId,
      nombre:   meta.nombre ?? authUser.email?.split('@')[0] ?? 'Usuario',
      dni:      meta.dni ?? String(Date.now()).slice(-8),
      telefono: meta.telefono ?? null,
      rol:      rolesAutoRegistro.includes(meta.rol) ? meta.rol : 'padre',
    }
    const { data: creado, error } = await supabase
      .from('profiles')
      .insert(nuevoPerfil)
      .select('id, nombre, rol, activo')
      .single()

    if (error) console.warn('No se pudo auto-crear el perfil:', error.message)
    setProfile(creado ?? null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        loadProfile(session?.user?.id).finally(() => setLoading(false))
      })
      .catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        await loadProfile(session?.user?.id)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signUp = async (email, password, profileData) => {
    // Los datos del perfil van también en metadata: si el INSERT directo
    // falla (ej. confirmación de email pendiente → sin sesión → RLS rechaza),
    // loadProfile los recupera y crea el perfil en el primer login.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: profileData },
    })
    if (error) throw error

    if (data.user && data.session) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, ...profileData })
      // Ignorar duplicado (el perfil pudo crearse vía onAuthStateChange)
      if (profileError && profileError.code !== '23505') throw profileError
    }
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return { user, profile, loading, signIn, signUp, signOut }
}
