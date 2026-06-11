/**
 * DeepSeek AI 解题服务
 * 直接调用 Supabase Edge Function
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '')
const API_URL = `https://${projectRef}.supabase.co/functions/v1/deepseek-proxy`

/** 调用 Edge Function 的通用请求头 */
function getHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  if (supabaseAnonKey) headers['Authorization'] = `Bearer ${supabaseAnonKey}`
  return headers
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function buildMessages({ mode, text, imageBase64, questionCount }) {
  const content = []

  if (imageBase64) {
    content.push({ type: 'image_url', image_url: { url: imageBase64 } })
  }

  const userText = text?.trim()

  if (mode === 'solve') {
    content.push({
      type: 'text',
      text: userText
        ? `请解答这道题目：${userText}`
        : '请解答图片中的题目。',
    })

    return [
      {
        role: 'system',
        content: `你是一位解题教师。分析题目后严格按以下 JSON 格式回复，不要输出其他文字：

{
  "subject": "科目",
  "tags": ["知识点"],
  "type": "essay",
  "title": "题目",
  "steps": ["第一步", "第二步"],
  "answer": "答案",
  "explanation": "解析"
}`,
      },
      { role: 'user', content },
    ]
  }

  // generate mode
  const count = questionCount || 1
  const subjectHint = userText ? `主题方向：${userText}` : ''

  content.push({
    type: 'text',
    text: `${subjectHint}，请按照以上内容生成 ${count} 道相似的练习题。每道题的格式都要包含题目、答案和解析。`,
  })

  return [
    {
      role: 'system',
      content: `你是一位出题教师。根据用户输入生成 ${count} 道相似的练习题，严格按以下 JSON 格式回复，不要输出其他文字：

{
  "questions": [
    {
      "subject": "科目",
      "tags": ["知识点"],
      "type": "choice",
      "title": "题目",
      "options": ["A.选项1", "B.选项2"],
      "answer": "A",
      "explanation": "解析"
    }
  ]
}

type 说明：choice=选择题(需options)  fill=填空题(options=[])  essay=解答题(options=[])
所有题型都必须包含：subject, tags, type, title, answer, explanation`,
    },
    { role: 'user', content },
  ]
}

export async function solveProblem({
  mode = 'solve',
  text,
  imageBase64,
  questionCount = 1,
  onChunk,
  onDone,
  onError,
  signal,
}) {
  try {
    const messages = buildMessages({ mode, text, imageBase64, questionCount })

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        stream: true,
        max_tokens: 4096,
        temperature: mode === 'generate' ? 0.9 : 0.7,
      }),
      signal,
    })

    if (!response.ok) {
      let errMsg = `请求失败 (${response.status})`
      try {
        const errData = await response.json()
        errMsg = errData.error || errMsg
      } catch {}
      throw new Error(errMsg)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const data = trimmed.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) onChunk(delta)
        } catch {}
      }
    }

    onDone()
  } catch (err) {
    if (err.name === 'AbortError') {
      onDone()
      return
    }
    onError(err.message || '请求失败，请检查网络连接')
  }
}

export async function quickChat(text, signal) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一位全科教师，擅长解答学习问题。请用 Markdown 格式输出，包含详细的解释和步骤。' },
        { role: 'user', content: text },
      ],
      stream: false,
      max_tokens: 4096,
      temperature: 0.7,
    }),
    signal,
  })

  if (!response.ok) {
    let errMsg = `请求失败 (${response.status})`
    try {
      const errData = await response.json()
      errMsg = errData.error || errMsg
    } catch {}
    throw new Error(errMsg)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}
