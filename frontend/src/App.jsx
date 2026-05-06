import { Route, Routes } from 'react-router-dom'
import './App.css'

import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import Health from './pages/Health.jsx'
import PhysicalActivity from './pages/PhysicalActivity.jsx'
import Activity from './pages/Activity.jsx'
import Events from './pages/Events.jsx'
import Contact from './pages/Contact.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Goals from './pages/Goals.jsx'
import Meals from './pages/Meals.jsx'
import Layout from './components/Layout.jsx'

import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/health" element={<ProtectedRoute><Layout><Health /></Layout></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><Layout><Goals /></Layout></ProtectedRoute>} />
      <Route path="/meals" element={<ProtectedRoute><Layout><Meals /></Layout></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><Layout><Activity /></Layout></ProtectedRoute>} />
      <Route path="/physical-activity" element={<ProtectedRoute><Layout><PhysicalActivity /></Layout></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Layout><Events /></Layout></ProtectedRoute>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
    </Routes>
  )
}

export default App
