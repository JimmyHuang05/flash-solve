import { useState } from 'react'
import BaseModal from './BaseModal'
import { SettingsIcon } from './Icons'

const APP_VERSION = '1.0.0'

const sidebarItems = [
  {
    key: 'profile',
    label: '个人信息',
    icon: (
      <SettingsIcon size={18} />
    ),
  },
  {
    key: 'redeem',
    label: '兑换码',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
    ),
  },
  {
    key: 'version',
    label: '版本号',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" x2="9.17" y1="4.93" y2="9.17"/><line x1="14.83" x2="19.07" y1="14.83" y2="19.07"/><line x1="14.83" x2="19.07" y1="9.17" y2="4.93"/><line x1="4.93" x2="9.17" y1="19.07" y2="14.83"/></svg>
    ),
  },
]

/** 根据出生日期计算年龄 */
function calcAge(birthDate) {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function ProfilePanel({ session }) {
  if (!session) return null

  const createdAt = session.user.created_at
    ? new Date(session.user.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '未知'

  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [education, setEducation] = useState('')
  const [saved, setSaved] = useState(false)

  const age = calcAge(birthDate)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-stone-700">个人信息</h3>
        <button
          onClick={handleSave}
          className="px-4 py-1.5 bg-gradient-to-r from-warm-coral to-warm-coralHover text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          {saved ? '已保存' : '保存'}
        </button>
      </div>

      <div className="space-y-3">
        {/* 姓名 */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/60 rounded-xl border border-stone-100/80">
          <span className="text-sm text-stone-400 font-medium w-20 shrink-0">姓名</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入姓名"
            className="flex-1 text-right bg-transparent outline-none text-sm font-semibold text-stone-600 placeholder-stone-300"
          />
        </div>

        {/* 性别 */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/60 rounded-xl border border-stone-100/80">
          <span className="text-sm text-stone-400 font-medium w-20 shrink-0">性别</span>
          <div className="flex gap-2">
            {['男', '女'].map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  gender === g
                    ? 'text-white bg-gradient-to-r from-warm-coral to-warm-coralHover shadow-sm'
                    : 'text-stone-400 bg-white/80 border border-stone-200 hover:border-warm-coral/30'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 出生年月 → 自动计算年龄 */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/60 rounded-xl border border-stone-100/80">
          <span className="text-sm text-stone-400 font-medium w-20 shrink-0">出生年月</span>
          <div className="flex items-center gap-3">
            {age !== null && (
              <span className="text-xs text-stone-400 font-medium bg-stone-50 px-2 py-0.5 rounded-full">{age} 岁</span>
            )}
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="bg-transparent outline-none text-sm font-semibold text-stone-600 [color-scheme:light]"
            />
          </div>
        </div>

        {/* 学历 */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/60 rounded-xl border border-stone-100/80">
          <span className="text-sm text-stone-400 font-medium w-20 shrink-0">学历</span>
          <select
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            className="bg-transparent outline-none text-sm font-semibold text-stone-600 text-right"
          >
            <option value="">请选择</option>
            <option value="小学">小学</option>
            <option value="初中">初中</option>
            <option value="高中">高中</option>
            <option value="本科">本科</option>
            <option value="硕士">硕士</option>
            <option value="博士">博士</option>
          </select>
        </div>

        <div className="border-t border-stone-100/80 pt-3 mt-4 space-y-3">
          {/* 绑定邮箱（只读） */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/60 rounded-xl border border-stone-100/80">
            <span className="text-sm text-stone-400 font-medium">绑定邮箱</span>
            <span className="text-sm font-semibold text-stone-600">{session.user.email}</span>
          </div>

          {/* ID（只读） */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/60 rounded-xl border border-stone-100/80">
            <span className="text-sm text-stone-400 font-medium">用户 ID</span>
            <span className="text-sm font-mono font-semibold text-stone-600">{session.user.id.slice(0, 8)}...</span>
          </div>

          {/* 注册时间（只读） */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/60 rounded-xl border border-stone-100/80">
            <span className="text-sm text-stone-400 font-medium">注册时间</span>
            <span className="text-sm font-semibold text-stone-600">{createdAt}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function RedeemPanel() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState(null)

  const handleRedeem = () => {
    if (!code.trim()) { setStatus('error'); setMsg('请输入兑换码'); return }
    setStatus('error'); setMsg('兑换功能暂未开放')
  }
  const [msg, setMsg] = useState('')

  return (
    <div>
      <h3 className="text-base font-bold text-stone-700 mb-4">兑换码</h3>
      <p className="text-sm text-stone-400 mb-5">输入兑换码获取额外积分</p>
      <div className="flex items-center gap-3">
        <input type="text" value={code} onChange={(e) => { setCode(e.target.value); setStatus(null) }} placeholder="请输入兑换码" className="flex-1 px-4 py-3 rounded-xl bg-white border border-stone-200 focus:border-warm-coral/50 focus:ring-2 focus:ring-warm-coral/20 outline-none text-stone-700 placeholder-stone-300 font-medium transition-all" />
        <button onClick={handleRedeem} className="px-5 py-3 bg-gradient-to-r from-warm-coral to-warm-coralHover text-white font-bold rounded-xl shadow-md shadow-warm-coral/20 hover:shadow-lg transition-all active:scale-95 whitespace-nowrap">兑换</button>
      </div>
      {status === 'error' && <div className="mt-3 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500 font-medium">{msg}</div>}
      {status === 'success' && <div className="mt-3 px-4 py-2.5 bg-green-50 border border-green-100 rounded-xl text-sm text-green-600 font-medium">{msg}</div>}
    </div>
  )
}

function VersionPanel() {
  return (
    <div>
      <h3 className="text-base font-bold text-stone-700 mb-4">版本号</h3>
      <div className="px-4 py-4 bg-white/60 rounded-xl border border-stone-100/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-stone-400 font-medium">应用版本</span>
          <span className="text-sm font-bold text-stone-700">v{APP_VERSION}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-400 font-medium">构建环境</span>
          <span className="text-sm font-semibold text-stone-500">{import.meta.env.PROD ? 'Production' : 'Development'}</span>
        </div>
      </div>
      <p className="mt-4 text-xs text-stone-300 leading-relaxed">
        AnswerAI — 拍照秒出解析<br />
        如有问题请联系在线客服
      </p>
    </div>
  )
}

export default function SettingsModal({ session, onClose }) {
  const [activeTab, setActiveTab] = useState('profile')

  const renderPanel = () => {
    switch (activeTab) {
      case 'profile': return <ProfilePanel session={session} />
      case 'redeem': return <RedeemPanel />
      case 'version': return <VersionPanel />
      default: return null
    }
  }

  return (
    <BaseModal size="lg" onClose={onClose} className="overflow-hidden flex p-0">
        <div className="w-44 shrink-0 bg-white/50 border-r border-white/80 p-3 pt-12">
          <div className="flex flex-col gap-1">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === item.key
                    ? 'text-warm-coralHover bg-white/90 shadow-sm border border-white/80'
                    : 'text-stone-400 hover:text-warm-coralHover hover:bg-white/60 border border-transparent'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 pt-12 min-h-[500px] max-h-[520px] overflow-y-auto no-scrollbar">
          {renderPanel()}
        </div>
      </BaseModal>
  )
}
