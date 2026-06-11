import { useEffect, useRef, useState } from 'react'
import { AlertIcon, LightbulbIcon, BookmarkIcon, PlusIcon } from './Icons'

export default function SolveResult({ result, parsed, loading, error, onRetry, onBookmark, onAddToWorkbook, bookmarkedIds }) {
  const containerRef = useRef(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [result])

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // 错误展示
  if (error) {
    return (
      <div className="mt-6 bg-red-50/80 backdrop-blur-lg rounded-2xl p-6 border border-red-100/80 shadow-glass">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-red-100 rounded-lg shrink-0">
            <AlertIcon size={20} className="text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-500 mb-1">出错了</p>
            <p className="text-sm text-red-400">{error}</p>
            {onRetry && (
              <button onClick={onRetry} className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-500 text-sm font-semibold rounded-xl transition-all">重新尝试</button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 加载中
  if (loading && !result) {
    return (
      <div className="mt-6 bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-white/90 shadow-glass">
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-warm-coral/30 border-t-warm-coralHover rounded-full animate-spin"></div>
          <span className="text-stone-400 font-medium text-sm">AI 正在分析...</span>
        </div>
      </div>
    )
  }

  if (!result && !loading) return null

  // 题生题模式：逐题展示
  if (parsed?.questions) {
    return (
      <div className="mt-6 bg-white/70 backdrop-blur-lg rounded-[1.5rem] border border-white/90 shadow-glass-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-warm-coral to-warm-peach rounded-xl flex items-center justify-center text-white shadow-sm">
<LightbulbIcon size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-700">AI 生成了 {parsed.questions.length} 道题</p>
              {loading && <p className="text-xs text-stone-400 font-medium">生成中...</p>}
            </div>
          </div>
          <button onClick={handleCopy} className="px-3 py-1.5 text-xs font-semibold text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all">
            {copied ? '已复制' : '复制全部'}
          </button>
        </div>

        <div className="px-6 py-5 max-h-[600px] overflow-y-auto no-scrollbar space-y-4">
          {parsed.questions.map((q, idx) => (
          <div key={idx} className="bg-white/70 backdrop-blur-lg rounded-[1.5rem] p-5 shadow-glass border border-white/90">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">第 {idx + 1} 题</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                    q.subject === '数学' ? 'bg-warm-coral/10 text-warm-coralHover' :
                    q.subject === '英语' ? 'bg-warm-camel/15 text-warm-camelDark' :
                    'bg-warm-peach/15 text-warm-peachDark'
                  }`}>{q.subject}</span>
                  <span className={`text-[10px] font-medium ${
                    q.difficulty === '简单' ? 'text-green-400' :
                    q.difficulty === '困难' ? 'text-red-400' : 'text-yellow-500'
                  }`}>{q.difficulty}</span>
                </div>

                <p className="text-stone-700 font-semibold text-[15px] mb-2">{q.title}</p>

                {q.options?.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {q.options.map((opt, i) => (
                      <div key={i} className="text-sm text-stone-500 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-400">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt.replace(/^[A-Z][.、\)]\s*/, '')}
                      </div>
                    ))}
                  </div>
                )}

                {q.answer && (
                  <div className="mt-2 px-3 py-2 bg-green-50/80 rounded-xl border border-green-100/60">
                    <span className="text-xs font-bold text-green-600">答案：</span>
                    <span className="text-sm text-green-700">{q.answer}</span>
                  </div>
                )}

                {q.explanation && (
                  <div className="mt-2 px-3 py-2 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-xs font-bold text-stone-500">解析：</span>
                    <span className="text-sm text-stone-600">{q.explanation}</span>
                  </div>
                )}

                {q.tags?.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {q.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] font-medium text-stone-400 bg-white/80 border border-stone-200 px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {onBookmark && (
                <button
                  onClick={() => onBookmark(q, idx)}
                  disabled={bookmarkedIds?.has(idx)}
                  className={`shrink-0 w-9 h-9 rounded-full border shadow-sm flex items-center justify-center transition-all ${
                    bookmarkedIds?.has(idx)
                      ? 'bg-warm-coral text-white border-warm-coral/40 scale-110'
                      : 'bg-white/90 border-stone-200 text-warm-coralHover hover:bg-warm-coral hover:text-white hover:scale-110'
                  }`}
                  title={bookmarkedIds?.has(idx) ? '已收藏' : '收藏到错题本'}
                >
<BookmarkIcon size={16} />
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="w-4 h-4 border-2 border-warm-coral/30 border-t-warm-coralHover rounded-full animate-spin"></div>
            <span className="text-xs text-stone-400">生成中...</span>
          </div>
        )}
        </div>
      </div>
    )
  }

  // 解题模式：显示步骤和答案
  return (
    <div className="mt-6 bg-white/70 backdrop-blur-lg rounded-[1.5rem] border border-white/90 shadow-glass-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-warm-coral to-warm-peach rounded-xl flex items-center justify-center text-white shadow-sm">
            <LightbulbIcon size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-stone-700">AI 解题助手</p>
            {parsed?.subject && <p className="text-xs text-stone-400 font-medium">{parsed.subject} · {parsed.difficulty}</p>}
            {loading && <p className="text-xs text-stone-400 font-medium">生成中...</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onAddToWorkbook && (
            <button onClick={onAddToWorkbook} className="px-3 py-1.5 text-xs font-semibold text-warm-coralHover hover:bg-warm-coral/10 rounded-lg transition-all flex items-center gap-1" title="加入错题本">
              <PlusIcon size={14} />
              加入错题本
            </button>
          )}
          <button onClick={handleCopy} className="px-3 py-1.5 text-xs font-semibold text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all">
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      </div>

      <div ref={containerRef} className="px-6 py-5 max-h-[600px] overflow-y-auto no-scrollbar text-left">
        {parsed?.steps ? (
          <div className="space-y-4">
            {parsed.tags?.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {parsed.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] font-medium text-stone-400 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-full">#{tag}</span>
                ))}
              </div>
            )}
            {parsed.steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-warm-coral to-warm-peach flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5">{i + 1}</div>
                <div className="flex-1 text-[15px] text-stone-600 leading-relaxed">{step}</div>
              </div>
            ))}
            {parsed.answer && (
              <div className="mt-6 px-4 py-3 bg-gradient-to-r from-warm-coral/5 to-warm-peach/5 rounded-xl border border-warm-coral/10">
                <span className="text-sm font-bold text-warm-coralHover">答案：</span>
                <span className="text-sm font-semibold text-stone-700">{parsed.answer}</span>
              </div>
            )}
            {parsed.explanation && (
              <div className="mt-3 px-4 py-3 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-sm font-bold text-stone-500">解析：</span>
                <span className="text-sm text-stone-600">{parsed.explanation}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-[15px] text-stone-600 leading-relaxed whitespace-pre-wrap">{result}</div>
        )}

        {loading && (
          <span className="inline-block w-2 h-4 bg-warm-coralHover/60 rounded-sm ml-0.5 animate-pulse"></span>
        )}
      </div>
    </div>
  )
}
