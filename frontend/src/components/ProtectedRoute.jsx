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

  // If the user is an admin, they should not see the normal user interface.
  // Redirect them directly to the admin panel.
  if (me.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return children
}
