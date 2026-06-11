import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { CoinIcon, RefreshIcon, PlusIcon, ActivityIcon } from './Icons'

export default function SquarePage({ session }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('数学')
  const [content, setContent] = useState('')
  const [difficulty, setDifficulty] = useState('中等')
  const [tags, setTags] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('square_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取广场数据失败:', error)
    } else {
      setPosts(data || [])
    }
    setLoading(false)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    const { error } = await supabase.from('square_posts').insert({
      user_id: session.user.id,
      subject,
      content,
      difficulty,
      tags: tags.split(/[,，、\s]+/).filter(Boolean),
    })

    if (error) {
      alert('发布失败: ' + error.message)
    } else {
      setContent('')
      setTags('')
      setShowForm(false)
      fetchPosts()
    }
  }

  const colorMap = {
    '数学': 'bg-warm-coral/10 text-warm-coralHover border-warm-coral/20',
    '物理': 'bg-warm-camel/15 text-warm-camelDark border-warm-camel/30',
    '英语': 'bg-warm-peach/15 text-warm-peachDark border-warm-peach/30',
    '化学': 'bg-warm-sand/20 text-warm-sandDark border-warm-sand/40',
    '历史': 'bg-warm-camel/15 text-warm-camelDark border-warm-camel/30',
  }

  const diffColors = {
    '简单': 'text-green-400',
    '中等': 'text-yellow-500',
    '困难': 'text-red-400',
  }

  return (
    <div className="animate-[fadeInUp_0.4s_ease-out_forwards]">
      <div>
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-2xl font-bold text-stone-700 flex items-center gap-3">
            <div className="p-2 bg-warm-sand/20 backdrop-blur-sm rounded-xl border border-warm-sand/30">
              <CoinIcon size={24} className="text-warm-sandDark" />
            </div>
            发现广场
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPosts}
              className="text-sm font-medium text-stone-400 hover:text-warm-coralHover transition-colors flex items-center bg-white/70 px-4 py-2 rounded-full border border-white/80 backdrop-blur-md hover:bg-white/90 shadow-sm"
            >
              换一批 <RefreshIcon size={14} className="ml-1" />
            </button>
            {session && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-warm-coral to-warm-coralHover text-white text-sm font-bold shadow-md shadow-warm-coral/20 hover:shadow-lg transition-all active:scale-95 flex items-center gap-1"
              >
                <PlusIcon size={16} />
                发布题目
              </button>
            )}
          </div>
        </div>

        {/* 发布表单 */}
        {showForm && (
          <div className="mb-6 bg-white/70 backdrop-blur-lg rounded-[1.5rem] p-6 shadow-glass border border-white/90">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-500 mb-1.5">科目</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-200 focus:border-warm-coral/50 focus:ring-2 focus:ring-warm-coral/20 outline-none text-stone-700 font-medium"
                  >
                    {Object.keys(colorMap).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-500 mb-1.5">难度</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-200 focus:border-warm-coral/50 focus:ring-2 focus:ring-warm-coral/20 outline-none text-stone-700 font-medium"
                  >
                    <option value="简单">简单</option>
                    <option value="中等">中等</option>
                    <option value="困难">困难</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-500 mb-1.5">标签（逗号分隔）</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="几何, 真题"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-200 focus:border-warm-coral/50 focus:ring-2 focus:ring-warm-coral/20 outline-none text-stone-700 placeholder-stone-300 font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-500 mb-1.5">题目内容</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="3"
                  placeholder="输入题目内容..."
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 focus:border-warm-coral/50 focus:ring-2 focus:ring-warm-coral/20 outline-none text-stone-700 placeholder-stone-300 font-medium resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-stone-500 hover:bg-stone-100 font-medium transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-warm-coral to-warm-coralHover text-white font-bold shadow-md transition-all active:scale-95"
                >
                  发布
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 瀑布流内容 */}
        {loading ? (
          <div className="text-center py-12 text-stone-400 font-medium">加载中...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-400 font-medium">还没有题目，成为第一个发布者吧！</p>
          </div>
        ) : (
          <div className="columns-2 lg:columns-3 gap-4 sm:gap-6">
            {posts.map((post, index) => {
              const randomHeight = Math.floor(Math.random() * (120 - 40 + 1) + 40)
              const subjectBg = colorMap[post.subject] || colorMap['数学']

              return (
                <div
                  key={post.id}
                  className="mb-4 break-inside-avoid bg-white/70 backdrop-blur-lg rounded-[1.5rem] p-5 shadow-glass border border-white/90 hover:shadow-glass-lg hover:-translate-y-0.5 hover:bg-white/90 transition-all cursor-pointer fade-in-up"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${subjectBg}`}>{post.subject}</span>
                    <span className={`text-xs font-medium flex items-center gap-1 ${diffColors[post.difficulty] || 'text-stone-400'}`}>
                      <ActivityIcon size={12} />
                      {post.difficulty}
                    </span>
                  </div>
                  <p className="text-stone-600 text-[15px] leading-relaxed mb-4 line-clamp-4 font-medium">{post.content}</p>
                  <div className="w-full bg-white/50 rounded-xl flex items-center justify-center border border-white/70 backdrop-blur-sm" style={{ height: randomHeight }}>
                    <span className="text-stone-300 text-[10px] tracking-widest uppercase font-bold mix-blend-multiply">Tap to View</span>
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {(post.tags || []).map((tag, i) => (
                      <span key={i} className="text-[11px] font-medium text-stone-400 bg-white/80 border border-white/90 px-2.5 py-1 rounded-full shadow-sm">#{tag}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
