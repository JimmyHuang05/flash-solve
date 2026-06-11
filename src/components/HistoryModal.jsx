import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BaseModal from './BaseModal'
import { ArrowLeftIcon } from './Icons'

function getHistoryLimit(tier) {
  switch (tier) {
    case 'lite': return 5
    case 'pro':
    case 'ultra': return 10
    default: return 3
  }
}

function fmtTime(iso) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function fmtDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
}

function DetailView({ record, type, onBack }) {
  if (type === 'solve') {
    const ai = typeof record.ai_response === 'string' ? JSON.parse(record.ai_response) : record.ai_response
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600">
          <ArrowLeftIcon size={14} />
          返回列表
        </button>
        <div className="px-4 py-3 bg-white/60 rounded-xl border border-stone-100/80">
          <p className="text-[10px] text-stone-400 font-medium mb-1">题目</p>
          <p className="text-sm text-stone-600">{record.user_input || ai?.title || '(图片题目)'}</p>
        </div>
        {ai?.steps?.map((step, i) => (
          <div key={i} className="flex gap-3 px-4 py-3 bg-white/60 rounded-xl border border-stone-100/80">
            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-warm-coral to-warm-peach flex items-center justify-center text-white text-[10px] font-bold shrink-0">{i + 1}</span>
            <p className="text-sm text-stone-600">{step}</p>
          </div>
        ))}
        {ai?.answer && (
          <div className="px-4 py-3 bg-green-50/80 rounded-xl border border-green-100/60">
            <span className="text-xs font-bold text-green-600">答案：</span>
            <span className="text-sm text-green-700">{ai.answer}</span>
          </div>
        )}
        {ai?.explanation && (
          <div className="px-4 py-3 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-xs font-bold text-stone-500">解析：</span>
            <span className="text-sm text-stone-600">{ai.explanation}</span>
          </div>
        )}
        <p className="text-xs text-stone-300 text-center">{fmtDate(record.created_at)}</p>
      </div>
    )
  }

  // generate detail
  const questions = typeof record.questions === 'string' ? JSON.parse(record.questions) : record.questions
  const qs = Array.isArray(questions) ? questions : (questions?.questions || [])

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600">
        <ArrowLeftIcon size={14} />
        返回列表
      </button>
      {record.user_input && (
        <div className="px-4 py-3 bg-white/60 rounded-xl border border-stone-100/80">
          <p className="text-[10px] text-stone-400 font-medium mb-1">主题</p>
          <p className="text-sm text-stone-600">{record.user_input}</p>
        </div>
      )}
      {qs.map((q, idx) => (
        <div key={idx} className="px-4 py-3 bg-white/60 rounded-xl border border-stone-100/80">
          <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded mr-2">第 {idx + 1} 题</span>
          <span className="text-[10px] text-stone-300">{q.type === 'choice' ? '选择题' : q.type === 'fill' ? '填空题' : '解答题'}</span>
          <p className="text-sm text-stone-600 mt-2">{q.title}</p>
          {q.options?.length > 0 && (
            <div className="mt-2 space-y-1">
              {q.options.map((o, i) => (
                <p key={i} className="text-xs text-stone-500">{String.fromCharCode(65 + i)}. {o.replace(/^[A-Z][.、\)]\s*/, '')}</p>
              ))}
            </div>
          )}
          <div className="mt-2 text-xs text-green-600">答案：{q.answer}</div>
          {q.explanation && <div className="mt-1 text-xs text-stone-500">解析：{q.explanation}</div>}
        </div>
      ))}
      <p className="text-xs text-stone-300 text-center">{fmtDate(record.created_at)}</p>
    </div>
  )
}

export default function HistoryModal({ session, onClose }) {
  const [solveRecords, setSolveRecords] = useState([])
  const [genRecords, setGenRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('solve')
  const [tier, setTier] = useState('free')
  const [selected, setSelected] = useState(null) // { record, type }

  const limit = getHistoryLimit(tier)

  useEffect(() => {
    if (!session) return
    fetchData()
  }, [session])

  const fetchData = async () => {
    setLoading(true)
    const { data: sub } = await supabase.from('user_subscriptions').select('tier').eq('user_id', session.user.id).single()
    if (sub) setTier(sub.tier)

    const [solveRes, genRes] = await Promise.all([
      supabase.from('solve_records').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(limit),
      supabase.from('generate_records').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(limit),
    ])
    setSolveRecords(solveRes.data || [])
    setGenRecords(genRes.data || [])
    setLoading(false)
  }

  const currentRecords = activeTab === 'solve' ? solveRecords : genRecords

  // 详情模式
  if (selected) {
    return (
      <BaseModal size="md" onClose={onClose} className="p-6">
        <DetailView record={selected.record} type={selected.type} onBack={() => setSelected(null)} />
      </BaseModal>
    )
  }

  return (
    <BaseModal size="md" onClose={onClose}>
        <div className="p-6 pt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-stone-700">历史记录</h2>
            <span className="text-xs text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full">
              {tier === 'free' ? '免费版' : tier.charAt(0).toUpperCase() + tier.slice(1)} · 近{limit}条
            </span>
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={() => setActiveTab('solve')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'solve' ? 'text-white bg-gradient-to-r from-warm-coral to-warm-coralHover shadow-sm' : 'text-stone-400 bg-white/80 border border-stone-200 hover:border-warm-coral/30'}`}>解题记录</button>
            <button onClick={() => setActiveTab('generate')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'generate' ? 'text-white bg-gradient-to-r from-warm-coral to-warm-coralHover shadow-sm' : 'text-stone-400 bg-white/80 border border-stone-200 hover:border-warm-coral/30'}`}>题生题记录</button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-sm text-stone-400">加载中...</div>
          ) : currentRecords.length === 0 ? (
            <div className="text-center py-10"><p className="text-sm text-stone-400 font-medium">暂无记录</p><p className="text-xs text-stone-300 mt-1">去智能搜题页面使用功能吧</p></div>
          ) : (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto no-scrollbar pr-1">
              {currentRecords.map((r) => {
                if (activeTab === 'solve') {
                  const ai = typeof r.ai_response === 'string' ? JSON.parse(r.ai_response) : r.ai_response
                  return (
                    <div key={r.id} onClick={() => setSelected({ record: r, type: 'solve' })} className="px-4 py-3 bg-white/60 rounded-xl border border-stone-100/80 hover:bg-white/90 transition-all cursor-pointer">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{ai?.subject || '综合'}</span>
                        <span className="text-[10px] text-stone-300">{ai?.type === 'choice' ? '选择题' : ai?.type === 'fill' ? '填空题' : '解答题'}</span>
                        <span className="text-[10px] text-stone-300">{fmtTime(r.created_at)}</span>
                      </div>
                      <p className="text-sm text-stone-600 line-clamp-2">{r.user_input || ai?.title || '(图片题目)'}</p>
                      {ai?.answer && <div className="mt-1.5 text-xs text-green-600 font-medium">答案：{ai.answer}</div>}
                    </div>
                  )
                }
                const questions = typeof r.questions === 'string' ? JSON.parse(r.questions) : r.questions
                const qs = Array.isArray(questions) ? questions : (questions?.questions || [])
                return (
                  <div key={r.id} onClick={() => setSelected({ record: r, type: 'generate' })} className="px-4 py-3 bg-white/60 rounded-xl border border-stone-100/80 hover:bg-white/90 transition-all cursor-pointer">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">题生题</span>
                      <span className="text-[10px] text-stone-300">{r.question_count} 道题</span>
                      <span className="text-[10px] text-stone-300">{fmtTime(r.created_at)}</span>
                    </div>
                    <p className="text-sm text-stone-600 line-clamp-1">{r.user_input || qs[0]?.subject || '综合'}</p>
                    {qs.length > 0 && (
                      <div className="mt-1.5 flex gap-1.5 flex-wrap">
                        {qs.slice(0, 3).map((q, i) => (
                          <span key={i} className="text-[10px] text-stone-400 bg-white border border-stone-200 px-1.5 py-0.5 rounded-full">{q.type === 'choice' ? '选择' : q.type === 'fill' ? '填空' : '解答'}</span>
                        ))}
                        {qs.length > 3 && <span className="text-[10px] text-stone-300">+{qs.length - 3}</span>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {tier === 'free' && (
            <div className="mt-4 px-4 py-3 bg-gradient-to-r from-warm-camel/10 to-warm-coral/5 rounded-2xl border border-warm-camel/20 flex items-center justify-between">
              <div><p className="text-xs font-bold text-stone-500">免费版仅显示近 3 条</p><p className="text-[10px] text-stone-400 mt-0.5">升级会员查看更多历史记录</p></div>
              <button onClick={() => { window.switchTab?.('vip'); onClose() }} className="px-3 py-1.5 bg-gradient-to-r from-warm-camel to-warm-camelDark text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95">升级</button>
            </div>
          )}
          {tier === 'lite' && <p className="mt-3 text-xs text-center text-stone-300">Lite 会员可查看近 5 条 · 升级 Pro 解锁 10 条</p>}
        </div>
      </BaseModal>
  )
}
