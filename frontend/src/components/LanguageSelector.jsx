import { useLanguage } from '../context/LanguageContext.jsx'

export default function LanguageSelector() {
  const { language, changeLanguage } = useLanguage()

  return (
    <select
      value={language}
      onChange={(e) => changeLanguage(e.target.value)}
      style={{
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        backgroundColor: '#fff',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
      }}
      title="Select Language"
    >
      <option value="en">🇬🇧 English</option>
      <option value="fr">🇫🇷 Français</option>
    </select>
  )
}
