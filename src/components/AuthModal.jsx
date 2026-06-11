import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { initCreditsOnSignUp } from '../lib/credits'
import BaseModal from './BaseModal'

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess('')

    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
          await initCreditsOnSignUp(data.user.id)
        }
        setSuccess('注册成功！请查看邮箱中的确认链接以完成注册。')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onClose()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseModal size="md" onClose={onClose} className="p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-warm-coral to-warm-peach rounded-2xl flex items-center justify-center text-white font-bold shadow-sm border border-white/50 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <h2 className="text-xl font-bold text-stone-700">{mode === 'login' ? '欢迎回来' : '创建账号'}</h2>
          <p className="text-sm text-stone-400 mt-1">{mode === 'login' ? '登录后继续使用 AnswerAI' : '注册后即可使用全部功能'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-stone-500 mb-1.5">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:border-warm-coral/50 focus:ring-2 focus:ring-warm-coral/20 outline-none text-stone-700 placeholder-stone-300 font-medium transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-500 mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位密码"
              minLength={6}
              required
              className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:border-warm-coral/50 focus:ring-2 focus:ring-warm-coral/20 outline-none text-stone-700 placeholder-stone-300 font-medium transition-all"
            />
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500 font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-600 font-medium">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-warm-coral to-warm-coralHover hover:from-warm-coralHover hover:to-warm-peachDark text-white font-bold rounded-xl shadow-md shadow-warm-coral/20 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setSuccess('') }}
            className="text-sm text-warm-coralHover hover:text-warm-peachDark font-medium transition-colors"
          >
            {mode === 'login' ? '没有账号？点击注册' : '已有账号？点击登录'}
          </button>
        </div>
      </BaseModal>
  )
}
