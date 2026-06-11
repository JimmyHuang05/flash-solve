import { useState, useRef, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { solveProblem, quickChat, fileToBase64 } from '../lib/deepseek'
import { deductCredits } from '../lib/credits'
import SolveResult from './SolveResult'
import { SearchIcon, PlusIcon, XIcon, StarIcon, CameraIcon, ImageIcon } from './Icons'

function isMobile() {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

function extractJSON(text) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match) {
      try { return JSON.parse(match[1].trim()) } catch {}
    }
    const first = text.indexOf('{')
    const last = text.lastIndexOf('}')
    if (first !== -1 && last > first) {
      try { return JSON.parse(text.slice(first, last + 1)) } catch {}
    }
    return null
  }
}

export default function UploadPage({ session, credits, onCreditsChange }) {
  const [mode, setMode] = useState('solve')
  const [text, setText] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [result, setResult] = useState('')
  const [parsed, setParsed] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [questionCount, setQuestionCount] = useState(1)
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())

  const fileInputRef = useRef(null)
  const abortRef = useRef(null)
  const recordIdRef = useRef(null)

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert('图片大小不能超过 10MB'); e.target.value = ''; return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError(null); setResult(''); setParsed(null)
  }, [])

  const handleRemoveImage = useCallback(() => {
    setImageFile(null); setImagePreview(null); setParsed(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [imagePreview])

  const handleTriggerUpload = useCallback(() => fileInputRef.current?.click(), [])

  const cost = mode === 'solve' ? 1 : questionCount

  // 保存解题记录
  const saveSolveRecord = useCallback(async (parsedData) => {
    if (!session) return null
    const { data, error } = await supabase.from('solve_records').insert({
      user_id: session.user.id,
      user_input: text.trim() || null,
      image_url: null,
      ai_response: parsedData,
    }).select('id').single()
    if (error) { console.error('保存解题记录失败:', error); return null }
    return data.id
  }, [session, text])

  // 保存题生题记录
  const saveGenerateRecord = useCallback(async (parsedData) => {
    if (!session) return null
    const { data, error } = await supabase.from('generate_records').insert({
      user_id: session.user.id,
      user_input: text.trim() || null,
      question_count: parsedData.questions?.length || questionCount,
      questions: parsedData.questions || [],
    }).select('id').single()
    if (error) { console.error('保存题生题记录失败:', error); return null }
    return data.id
  }, [session, text, questionCount])

  const handleSolve = useCallback(async () => {
    if (!imageFile && !text.trim()) { alert('请输入题目或上传图片'); return }
    if (!session) return

    if (credits < cost) {
      alert(`积分不足！需要 ${cost} 积分，当前只有 ${credits} 积分。`)
      return
    }

    const ok = await deductCredits(session.user.id, cost)
    if (!ok) { alert('积分扣除失败'); return }
    onCreditsChange(session.user)

    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true); setError(null); setResult(''); setParsed(null)
    recordIdRef.current = null

    try {
      let imageBase64 = null
      if (imageFile) imageBase64 = await fileToBase64(imageFile)

      let fullText = ''
      await solveProblem({
        mode, text: text.trim(), imageBase64, questionCount,
        signal: abortRef.current.signal,
        onChunk: (chunk) => { fullText += chunk; setResult(fullText) },
        onDone: async () => {
          // 解析 JSON
          const parsedData = extractJSON(fullText)
          setParsed(parsedData)

          // 存入历史记录表
          if (parsedData) {
            if (mode === 'solve') {
              recordIdRef.current = await saveSolveRecord(parsedData)
            } else if (parsedData.questions) {
              recordIdRef.current = await saveGenerateRecord(parsedData)
            }
          }
          setLoading(false)
        },
        onError: (errMsg) => { setError(errMsg); setLoading(false) },
      })
    } catch (err) { setError(err.message); setLoading(false) }
  }, [text, imageFile, mode, questionCount, credits, session, cost, onCreditsChange, saveSolveRecord, saveGenerateRecord])

  const handleQuickPrompt = useCallback(async (prompt) => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    setLoading(true); setError(null); setResult(''); setParsed(null)
    setImagePreview(null); setImageFile(null)
    try {
      const response = await quickChat(prompt, abortRef.current.signal)
      const parsedData = extractJSON(response)
      setResult(response)
      setParsed(parsedData)
      if (parsedData) {
        const id = await saveSolveRecord(parsedData)
        recordIdRef.current = id
      }
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message)
    } finally { setLoading(false) }
  }, [saveSolveRecord])

  // 解题模式：整题收藏
  const handleAddToWorkbook = useCallback(async () => {
    if (!session) { alert('请先登录'); return }
    if (!parsed) { alert('没有可保存的内容'); return }
    const recordId = recordIdRef.current
    const { error } = await supabase.from('workbooks').insert({
      user_id: session.user.id,
      source: 'solve',
      source_record_id: recordId,
      subject: parsed.subject || '综合',
      content: parsed.steps?.join('\n') || JSON.stringify(parsed),
      answer: parsed.answer || '',
      tags: parsed.tags || [],
      recorded_at: new Date().toISOString().split('T')[0],
    })
    if (error) alert('收藏失败: ' + error.message)
    else {
      setBookmarkedIds(new Set(['solved']))
      alert('已添加到错题本！')
    }
  }, [session, parsed])

  // 题生题模式：单题收藏（直接保存，无需二次确认）
  const handleBookmarkQuestion = useCallback(async (question, index) => {
    if (!session) { alert('请先登录'); return }
    if (bookmarkedIds.has(index)) return // 已收藏，跳过
    const recordId = recordIdRef.current
    const { error } = await supabase.from('workbooks').insert({
      user_id: session.user.id,
      source: 'generate',
      source_record_id: recordId,
      subject: question.subject || '综合',
      content: question.title,
      options: question.options || [],
      answer: question.answer || '',
      explanation: question.explanation || '',
      tags: question.tags || [],
      recorded_at: new Date().toISOString().split('T')[0],
    })
    if (error) alert('收藏失败: ' + error.message)
    else setBookmarkedIds((prev) => new Set(prev).add(index))
  }, [session, bookmarkedIds])

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode); setResult(''); setError(null); setParsed(null)
  }, [])

  const btnLabel = loading
    ? (mode === 'solve' ? '解题中...' : '生成中...')
    : (mode === 'solve' ? '发送' : '生成')

  return (
    <div className="animate-[fadeInUp_0.4s_ease-out_forwards]">
      <div className="max-w-3xl mx-auto mt-8 sm:mt-12 px-2 text-center">

        <div className="mb-6 relative inline-block">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-warm-coral/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-warm-peach/20 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-warm-coralHover to-warm-camelDark tracking-tight leading-tight pb-2">
            {mode === 'solve' ? '今天遇到什么难题了？' : '想要什么方向的练习题？'}
          </h1>
          <p className="mt-4 text-stone-400 font-medium text-lg">
            {mode === 'solve'
              ? (isMobile() ? '拍照上传或输入题目，AI 为你秒出解析' : '上传题目图片或输入题目，AI 为你秒出解析')
              : '告诉我主题或上传资料，AI 为你生成定制练习题'}
          </p>
        </div>

        {/* 模式切换 */}
        <div className="flex items-center justify-center mb-5">
          <div className="bg-white/50 p-1 rounded-2xl border border-white/70 backdrop-blur-md shadow-glass inline-flex">
            <button onClick={() => handleModeChange('solve')}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'solve' ? 'text-warm-coralHover bg-white/90 shadow-sm border border-white/80' : 'text-stone-400 hover:text-warm-coralHover'}`}>
              <SearchIcon size={16} className="inline mr-1.5 -mt-0.5" />
              解题模式
            </button>
            <button onClick={() => handleModeChange('generate')}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'generate' ? 'text-warm-coralHover bg-white/90 shadow-sm border border-white/80' : 'text-stone-400 hover:text-warm-coralHover'}`}>
              <PlusIcon size={16} className="inline mr-1.5 -mt-0.5" />
              题生题模式
            </button>
          </div>
        </div>

        {/* 图片预览 */}
        {imagePreview && (
          <div className="mb-6 relative inline-block group">
            <img src={imagePreview} alt="预览" className="max-h-64 rounded-2xl shadow-glass-lg border border-white/90 object-contain bg-white/50" />
            <button onClick={handleRemoveImage} className="absolute -top-2 -right-2 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full shadow-md border border-white/80 flex items-center justify-center text-stone-400 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100">
              <XIcon size={16} />
            </button>
          </div>
        )}

        {/* 输入框 */}
        <div className="relative group text-left">
          <div className="absolute -inset-1 bg-gradient-to-r from-warm-coral to-warm-peach rounded-[2.5rem] blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl border border-white/90 rounded-[2.5rem] shadow-glass-lg p-2 sm:p-3 transition-all duration-300">
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows="3"
              className="w-full bg-transparent border-none outline-none resize-none px-5 py-4 text-stone-700 placeholder-stone-300 font-medium text-[15px] sm:text-base"
              placeholder={mode === 'solve' ? '请输入题目内容，或点击下方按钮上传试卷/题目图片...' : '请输入想练习的知识点/主题，或上传资料图片...'}
            />
            <div className="flex items-center justify-between mt-2 px-3 pb-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" capture={isMobile() ? 'environment' : undefined} onChange={handleImageSelect} className="hidden" />
                <button onClick={handleTriggerUpload} className="p-2.5 rounded-xl text-stone-400 hover:text-warm-coralHover hover:bg-white/80 transition-all flex items-center justify-center group/btn" title={isMobile() ? '拍照' : '上传图片'}>
                  {isMobile() ? <CameraIcon size={22} className="group-hover/btn:scale-110 transition-transform" /> : <ImageIcon size={22} className="group-hover/btn:scale-110 transition-transform" />}
                </button>
                {mode === 'generate' && (
                  <div className="flex items-center bg-white/70 border border-stone-200/80 rounded-xl p-0.5 shadow-sm">
                    {[1, 2, 3].map((n) => (
                      <button key={n} onClick={() => setQuestionCount(n)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${questionCount === n ? 'text-white bg-gradient-to-r from-warm-coral to-warm-coralHover shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>x{n}</button>
                    ))}
                  </div>
                )}
                {imageFile && <span className="text-[10px] font-bold text-warm-coralHover bg-warm-coral/10 px-2 py-1 rounded-full border border-warm-coral/20">已选图片</span>}
              </div>
              <div className="flex items-center">
                <button onClick={handleSolve}
                  disabled={loading || (!imageFile && !text.trim()) || (session && credits < cost)}
                  className="px-5 py-2.5 bg-gradient-to-r from-warm-coral to-warm-coralHover hover:from-warm-coralHover hover:to-warm-peachDark text-white font-bold rounded-2xl shadow-md shadow-warm-coral/20 hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95 border border-warm-coral/40 disabled:opacity-40 disabled:cursor-not-allowed">
                  <span>{btnLabel}</span>
                  {session && !loading && (
                    <span className="text-[11px] font-bold flex items-center gap-0.5">
                      {cost}<StarIcon size={12} />
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 快捷提示 */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs font-medium text-stone-300 mr-1">试试这些：</span>
          {mode === 'solve' ? (
            <>
              <button onClick={() => handleQuickPrompt('帮我总结高频导数公式')} disabled={loading} className="px-4 py-2 rounded-full bg-white/60 border border-white/80 text-xs font-semibold text-stone-500 hover:text-warm-coralHover hover:bg-white/90 backdrop-blur-md transition-all shadow-glass hover:-translate-y-0.5 disabled:opacity-40">✨ 帮我总结高频导数公式</button>
              <button onClick={() => handleQuickPrompt('请出一道典型的几何证明大题')} disabled={loading} className="px-4 py-2 rounded-full bg-white/60 border border-white/80 text-xs font-semibold text-stone-500 hover:text-warm-coralHover hover:bg-white/90 backdrop-blur-md transition-all shadow-glass hover:-translate-y-0.5 disabled:opacity-40">📐 这道几何大题怎么做？</button>
            </>
          ) : (
            <>
              <button onClick={() => { setText('生成 3 道关于三角函数的高中数学练习题'); setMode('generate'); }} disabled={loading} className="px-4 py-2 rounded-full bg-white/60 border border-white/80 text-xs font-semibold text-stone-500 hover:text-warm-coralHover hover:bg-white/90 backdrop-blur-md transition-all shadow-glass hover:-translate-y-0.5 disabled:opacity-40">🔺 三角函数练习题 x3</button>
              <button onClick={() => { setText('生成 2 道关于英语语法的选择题'); setMode('generate'); }} disabled={loading} className="px-4 py-2 rounded-full bg-white/60 border border-white/80 text-xs font-semibold text-stone-500 hover:text-warm-coralHover hover:bg-white/90 backdrop-blur-md transition-all shadow-glass hover:-translate-y-0.5 disabled:opacity-40">📝 英语语法选择题 x2</button>
            </>
          )}
        </div>

        {/* AI 结果 */}
        <SolveResult
          result={result} parsed={parsed} loading={loading} error={error}
          onRetry={handleSolve}
          bookmarkedIds={bookmarkedIds}
          onBookmark={mode === 'generate' && parsed?.questions ? handleBookmarkQuestion : null}
          onAddToWorkbook={result && !loading && mode === 'solve' && parsed ? handleAddToWorkbook : null}
        />

        {!result && !loading && (
          <div className="mt-10 text-center">
            <p className="text-xs text-stone-300 font-medium">
              {mode === 'solve'
                ? (isMobile() ? '点击相机图标拍照上传题目，或输入文字描述' : '点击图片按钮上传题目截图，或输入文字描述')
                : '输入想练习的知识点，或上传资料图片让 AI 出题'}
              <br />{session ? `每次 ${cost} 积分` : '登录后可获得积分并使用 AI 功能'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
