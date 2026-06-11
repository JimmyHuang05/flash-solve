import { useState, useCallback, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { getCredits, getTier } from './lib/credits'
import Navbar from './components/Navbar'
import UploadPage from './components/UploadPage'
import WorkbookPage from './components/WorkbookPage'
import SquarePage from './components/SquarePage'
import VipPage from './components/VipPage'
import AuthModal from './components/AuthModal'
import SettingsModal from './components/SettingsModal'
import HistoryModal from './components/HistoryModal'

export default function App() {
  const [activeTab, setActiveTab] = useState('upload')
  const [session, setSession] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [credits, setCredits] = useState(0)
  const [tier, setTier] = useState('free')

  // 获取 session 和积分
  const refreshCredits = useCallback(async (user) => {
    if (user) {
      const [c, t] = await Promise.all([getCredits(user.id), getTier(user.id)])
      setCredits(c)
      setTier(t)
    } else {
      setCredits(0)
      setTier('free')
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      refreshCredits(session?.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      refreshCredits(session?.user)
    })

    return () => subscription.unsubscribe()
  }, [refreshCredits])

  const switchTab = useCallback((tab) => {
    if ((tab === 'workbook' || tab === 'square') && !session) {
      setShowAuth(true)
      return
    }
    if (tab === 'vip' && !session) {
      setShowAuth(true)
      return
    }
    setActiveTab(tab)
  }, [session])

  useEffect(() => {
    window.switchTab = switchTab
    return () => { delete window.switchTab }
  }, [switchTab])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setActiveTab('upload')
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'upload': return <UploadPage session={session} credits={credits} onCreditsChange={refreshCredits} />
      case 'workbook': return <WorkbookPage session={session} />
      case 'square': return <SquarePage session={session} />
      case 'vip': return <VipPage tier={tier} />
      default: return <UploadPage />
    }
  }

  return (
    <>
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#fdfbf9]">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-warm-coral/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-warm-sand/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-warm-camel/15 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[50px]"></div>
      </div>

      <Navbar
        activeTab={activeTab}
        onTabChange={switchTab}
        session={session}
        credits={credits}
        tier={tier}
        onShowAuth={() => setShowAuth(true)}
        onShowSettings={() => setShowSettings(true)}
        onShowHistory={() => setShowHistory(true)}
        onLogout={handleLogout}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showSettings && session && <SettingsModal session={session} onClose={() => setShowSettings(false)} />}
      {showHistory && session && <HistoryModal session={session} onClose={() => setShowHistory(false)} />}
    </>
  )
}
