import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { me, loading } = useAuth()

  if (loading) {
    return (
      <div className="wm-loader-container">
        <div className="wm-loader"></div>
      </div>
    )
  }

  if (!me) {
    return <Navigate to="/login" replace />
  }

  return children
}
