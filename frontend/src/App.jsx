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
import Chatbot from './pages/Chatbot.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/health" element={<Layout><Health /></Layout>} />
      <Route path="/goals" element={<Layout><Goals /></Layout>} />
      <Route path="/meals" element={<Layout><Meals /></Layout>} />
      <Route path="/activity" element={<Layout><Activity /></Layout>} />
      <Route path="/physical-activity" element={<Layout><PhysicalActivity /></Layout>} />
      <Route path="/events" element={<Layout><Events /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />
      <Route path="/chatbot" element={<Layout><Chatbot /></Layout>} />
    </Routes>
  )
}

export default App
