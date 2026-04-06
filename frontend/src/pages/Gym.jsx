import { Link } from 'react-router-dom'

export default function Gym() {
  return (
    <div className="wm-container">
      <div className="wm-card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="wm-header">
          <h1>Gym & Fitness Centers</h1>
        </div>
        <p className="wm-subtitle" style={{ marginTop: 8 }}>
          Find gyms and training spaces near you. Coming soon!
        </p>
        <div style={{ marginTop: 20 }}>
          <p className="wm-muted" style={{ marginBottom: 16 }}>In the meantime, track your physical activities and workouts:</p>
          <Link href="/activity" className="wm-btn" style={{ display: 'inline-block', textDecoration: 'none', cursor: 'pointer' }}>
            Go to Activity Tracker
          </Link>
        </div>
      </div>
    </div>
  )
}
