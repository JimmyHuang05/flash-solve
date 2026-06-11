import { SettingsIcon, ClockIcon, LogoutIcon, MedalIcon, TimerIcon, LogoIcon } from './Icons'

export default function Navbar({ activeTab, onTabChange, session, credits, tier, onShowAuth, onShowSettings, onShowHistory, onLogout }) {
  const tabs = [
    { key: 'upload', label: '智能搜题' },
    { key: 'workbook', label: '错题本' },
    { key: 'square', label: '发现广场' },
  ]

  const navIds = ['nav-upload', 'nav-workbook', 'nav-square']

  return (
    <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/80 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* 左侧：Logo */}
          <div className="flex items-center gap-3 w-1/4">
            <div className="w-10 h-10 bg-gradient-to-br from-warm-coral to-warm-peach rounded-2xl flex items-center justify-center text-white font-bold shadow-sm border border-white/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-stone-700 hidden md:block">AnswerAI</span>
          </div>

          {/* 中间：导航按钮 */}
          <div className="flex items-center justify-center space-x-1 sm:space-x-2 bg-white/50 p-1 rounded-2xl border border-white/70 backdrop-blur-md">
            {tabs.map((tab, idx) => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  id={navIds[idx]}
                  onClick={() => onTabChange(tab.key)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-warm-coralHover bg-white/90 shadow-sm border border-white/80 backdrop-blur-md'
                      : 'text-stone-400 hover:text-warm-coralHover hover:bg-white/60 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* 右侧：登录/用户菜单 */}
          <div className="flex items-center justify-end w-1/4">
            {!session ? (
              <button
                onClick={onShowAuth}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-warm-coral to-warm-coralHover text-white text-sm font-bold shadow-md shadow-warm-coral/20 hover:shadow-lg transition-all active:scale-95"
              >
                登录 / 注册
              </button>
            ) : (
              <div className="relative group">
                <div className="relative cursor-pointer p-1">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:ring-2 group-hover:ring-warm-coral/40 transition-all duration-300 bg-[#fefbf6]">
                    <img
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(session.user.email)}&backgroundColor=fefbf6`}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* 悬浮菜单 */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-glass-lg border border-white/80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50 overflow-visible flex flex-col p-2 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:bg-transparent">
                  <div className="flex items-center gap-3 px-3 py-3">
                    <img
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(session.user.email)}&backgroundColor=fefbf6`}
                      className="w-11 h-11 rounded-full border border-stone-200/50 bg-stone-50 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-700 truncate">{session.user.email}</p>
                      <p className="text-xs font-medium text-stone-400 truncate mt-0.5">ID: {session.user.id.slice(0, 8)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onTabChange('vip')}
                    className="mx-2 mb-2 p-3 bg-gradient-to-br from-warm-camel to-warm-camelDark rounded-2xl flex items-center justify-between group/vip shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 border border-warm-camelDark/30"
                  >
                    <div className="flex items-center gap-2 text-white">
                      <div className="p-1.5 bg-white/20 rounded-lg shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] text-white/80 font-semibold leading-none mb-1 uppercase tracking-wider">当前等级</p>
                        <p className="text-sm font-bold text-white leading-none">{tier === 'free' ? 'Free 基础会员' : tier.charAt(0).toUpperCase() + tier.slice(1) + ' 会员'}</p>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-warm-camelDark bg-white/90 px-2.5 py-1.5 rounded-lg group-hover/vip:shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all">
                      升级
                    </div>
                  </button>

                  {/* 积分显示 */}
                  <div className="mx-2 mb-2 px-3 py-2.5 bg-white/70 rounded-2xl border border-stone-100/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-warm-coralHover"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      <span className="text-sm font-semibold text-stone-500">我的积分</span>
                    </div>
                    <span className="text-sm font-bold text-stone-700">{credits}</span>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent my-1"></div>

                  <div className="flex flex-col gap-1 p-1 mt-1">
                    <button
                      onClick={onShowHistory}
                      className="w-full text-left px-3 py-2.5 text-sm font-medium text-stone-500 hover:text-warm-coralHover hover:bg-warm-coral/10 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      历史记录
                    </button>
                    <button
                      onClick={onShowSettings}
                      className="w-full text-left px-3 py-2.5 text-sm font-medium text-stone-500 hover:text-warm-coralHover hover:bg-warm-coral/10 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                      账号设置
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2.5 text-sm font-medium text-warm-peachDark hover:bg-warm-peach/15 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                      退出登录
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
