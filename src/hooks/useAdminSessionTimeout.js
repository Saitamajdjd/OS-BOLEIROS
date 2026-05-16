import { useEffect, useRef, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const TIMEOUT_MS = 30 * 60 * 1000
const LAST_ACTIVITY_KEY = 'admin_last_activity'

export function useAdminSessionTimeout() {
  const navigate = useNavigate()
  const timeoutRef = useRef(null)
  const [isReady, setIsReady] = useState(false)

  const logout = useCallback(() => {
    localStorage.removeItem(LAST_ACTIVITY_KEY)
    supabase.auth.signOut()
    navigate('/admin')
    toast.error('Sessão expirada. Faça login novamente.')
  }, [navigate])

  const checkTimeout = useCallback(() => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY)
    if (!lastActivity) return true

    const elapsed = Date.now() - parseInt(lastActivity, 10)
    if (elapsed >= TIMEOUT_MS) {
      logout()
      return false
    }
    return true
  }, [logout])

  useEffect(() => {
    const verificarAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        if (!checkTimeout()) return
        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
      }
      setIsReady(true)
    }
    verificarAuth()
  }, [checkTimeout])

  useEffect(() => {
    if (!isReady) return

    const updateActivity = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
    }

    const handleActivity = () => {
      updateActivity()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        logout()
      }, TIMEOUT_MS)
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }))
    updateActivity()

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity))
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isReady, logout])

  return { logout }
}