import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ConfirmDialog } from './Dialogs'

export default function WorkbookPage({ session }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null) // 详情
  const [managing, setManaging] = useState(false)
  const [checkedIds, setCheckedIds] = useState(new Set())
  const [subjectFilter, setSubjectFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  useEffect(() => {
    if (!session) return
    fetchItems()
  }, [session])

  const fetchItems = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('workbooks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('recorded_at', { ascending: sortOrder === 'asc' })

    if (error) console.error('获取错题失败:', error)
    else setItems(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (session) fetchItems()
  }, [sortOrder])

  const handleDelete = (id) => {
    supabase.from('workbooks').delete().eq('id', id).then(({ error }) => {
      if (!error) {
        setSelected(null)
        fetchItems()
      }
    })
  }

  const handleBatchDelete = () => {
    setShowConfirmDelete(true)
  }

  const confirmBatchDelete = () => {
    setShowConfirmDelete(false)
    const ids = Array.from(checkedIds)
    supabase.from('workbooks').delete().in('id', ids).then(({ error }) => {
      if (!error) {
        setCheckedIds(new Set())
        setManaging(false)
        fetchItems()
      }
    })
  }

  const toggleCheck = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // 获取所有科目用于筛选
  const allSubjects = [...new Set(items.map((i) => i.subject))].sort()
  const filtered = subjectFilter ? items.filter((i) => i.subject === subjectFilter) : items

  const subjectColors = {
    '数学': 'bg-warm-coral/10 text-warm-coralHover border-warm-coral/20',
    '英语': 'bg-warm-camel/15 text-warm-camelDark border-warm-camel/30',
    '物理': 'bg-warm-peach/15 text-warm-peachDark border-warm-peach/30',
    '化学': 'bg-warm-sand/20 text-warm-sandDark border-warm-sand/40',
    '历史': 'bg-warm-camel/15 text-warm-camelDark border-warm-camel/30',
  }

  // 详情模式
  if (selected) {
    const item = selected
    return (
      <div className="animate-[fadeInUp_0.4s_ease-out_forwards] max-w-3xl mx-auto">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          返回错题本
        </button>
        <div className="bg-white/70 backdrop-blur-lg rounded-[1.5rem] p-6 shadow-glass border border-white/90">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${subjectColors[item.subject] || 'bg-stone-100 text-stone-500'}`}>{item.subject}</span>
            <span className="text-[10px] text-stone-300 font-medium bg-stone-50 px-1.5 py-0.5 rounded">{item.source === 'generate' ? '题生题' : '解题'}</span>
            <span className="text-xs text-stone-400 font-medium">{item.recorded_at}</span>
          </div>

          <p className="text-stone-700 font-semibold text-[15px] mb-4">{item.content}</p>

          {item.options?.length > 0 && (
            <div className="space-y-1.5 mb-4">
              {item.options.map((opt, i) => (
                <div key={i} className="text-sm text-stone-500 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-400">{String.fromCharCode(65 + i)}</span>
                  {opt.replace(/^[A-Z][.、\)]\s*/, '')}
                </div>
              ))}
            </div>
          )}

          {item.answer && (
            <div className="mb-2 px-4 py-3 bg-green-50/80 rounded-xl border border-green-100/60">
              <span className="text-xs font-bold text-green-600">答案：</span>
              <span className="text-sm text-green-700">{item.answer}</span>
            </div>
          )}
          {item.explanation && (
            <div className="px-4 py-3 bg-stone-50 rounded-xl border border-stone-100">
              <span className="text-xs font-bold text-stone-500">解析：</span>
              <span className="text-sm text-stone-600">{item.explanation}</span>
            </div>
          )}

          {item.tags?.length > 0 && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {item.tags.map((tag, i) => (
                <span key={i} className="text-[10px] font-medium text-stone-400 bg-white/80 border border-stone-200 px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
            </div>
          )}

          <button onClick={() => { handleDelete(item.id) }} className="mt-4 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-50 rounded-xl transition-all">
            删除此题
          </button>
        </div>
      </div>
    )
  }

  return (<>
    <div className="animate-[fadeInUp_0.4s_ease-out_forwards]">
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-2xl font-bold text-stone-700 flex items-center gap-3">
          <div className="p-2 bg-warm-coral/10 backdrop-blur-sm rounded-xl border border-warm-coral/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="text-warm-coralHover" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
          我的错题本
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-stone-400 bg-white/70 px-4 py-2 rounded-full border border-white/80 backdrop-blur-md shadow-sm">
            {filtered.length} 题
          </span>
          <button
            onClick={() => { setManaging(!managing); setCheckedIds(new Set()) }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${managing ? 'bg-warm-coral/10 text-warm-coralHover border border-warm-coral/20' : 'bg-white/70 text-stone-400 border border-white/80 hover:text-warm-coralHover'}`}
          >
            {managing ? '完成' : '管理'}
          </button>
        </div>
      </div>

      {/* 筛选 + 排序栏 */}
      <div className="flex items-center gap-3 mb-4 px-2">
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-white/80 border border-stone-200 text-xs font-medium text-stone-500 outline-none focus:border-warm-coral/30"
        >
          <option value="">全部科目</option>
          {allSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/80 border border-stone-200 text-xs font-medium text-stone-500 hover:border-warm-coral/30 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
          {sortOrder === 'desc' ? '最新' : '最早'}
        </button>
        {managing && (
          <button onClick={() => { handleBatchDelete() }} disabled={checkedIds.size === 0} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-400 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-100 transition-all">
            删除 ({checkedIds.size})
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400 font-medium">加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-400 font-medium">{subjectFilter ? `没有 "${subjectFilter}" 的错题` : '还没有错题，在智能搜题中点击「收藏」按钮即可加入错题本'}</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-3xl mx-auto">
          {filtered.map((item) => (
            <div key={item.id} className={`bg-white/70 backdrop-blur-lg rounded-[1.5rem] p-5 shadow-glass border transition-all ${managing ? 'border-stone-200' : 'border-white/90 hover:bg-white/90 hover:shadow-glass-lg cursor-pointer'}`}>
              <div className="flex items-start justify-between gap-3">
                {managing && (
                  <div className="pt-1">
                    <input type="checkbox" checked={checkedIds.has(item.id)} onChange={() => toggleCheck(item.id)}
                      className="w-4 h-4 accent-warm-coralHover rounded cursor-pointer" />
                  </div>
                )}
                <div className="flex-1 min-w-0" onClick={() => !managing && setSelected(item)}>
                  <div className="flex gap-2 mb-1.5 items-center flex-wrap">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${subjectColors[item.subject] || 'bg-stone-100 text-stone-500'}`}>{item.subject}</span>
                    <span className="text-[10px] text-stone-300 font-medium bg-stone-50 px-1.5 py-0.5 rounded">{item.source === 'generate' ? '题生题' : '解题'}</span>
                    <span className="text-xs text-stone-400 font-medium">{item.recorded_at}</span>
                  </div>
                  <p className="text-stone-600 font-medium line-clamp-2">{item.content}</p>
                  {item.tags?.length > 0 && (
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      {item.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[10px] text-stone-300 bg-white/80 border border-stone-100 px-1.5 py-0.5 rounded-full">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                {!managing && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300 shrink-0 mt-1"><path d="m9 18 6-6-6-6"/></svg>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

      {/* 确认删除弹窗 */}
      <ConfirmDialog
        open={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={confirmBatchDelete}
        title="确认删除"
        message={`确定删除选中的 ${checkedIds.size} 条记录？此操作不可撤销。`}
        confirmText="删除"
        variant="danger"
      />
    </>
  )
}

