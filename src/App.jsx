import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Comprar from './pages/Comprar'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'
import { useState, useEffect } from 'react'

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      setLoading(false)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="text-gray-600">Verificando acesso...</div></div>
  }

  return isAuthenticated ? children : <Navigate to="/admin" replace />
}

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1A1A1A',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: { primary: '#1B5E20', secondary: '#fff' },
            style: { borderLeft: '4px solid #1B5E20' },
          },
          error: {
            iconTheme: { primary: '#DC2626', secondary: '#fff' },
            style: { borderLeft: '4px solid #DC2626' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/comprar" element={<Comprar />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/painel" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

export default App