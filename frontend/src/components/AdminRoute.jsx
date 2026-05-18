import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminRoute({ children }) {
  const { me, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!me) {
    return <Navigate to="/login" replace />
  }

  if (me.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}
