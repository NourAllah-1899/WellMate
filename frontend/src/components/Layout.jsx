import Header from './Header.jsx'
import ChatPopup from './ChatPopup.jsx'

export default function Layout({ children }) {
  return (
    <div className="wm-layout">
      <Header />
      <main className="wm-main">
        {children}
      </main>
      <ChatPopup />
    </div>
  )
}
