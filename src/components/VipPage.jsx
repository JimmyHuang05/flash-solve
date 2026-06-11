import { useState } from 'react'
import { NoticeDialog } from './Dialogs'
import { CheckIcon } from './Icons'

const plans = [
  {
    name: 'Free',
    price: '¥0',
    period: '',
    color: 'text-stone-400',
    features: [
      { text: '免费 50c', included: true },
      { text: '错题本 10 道题', included: true },
      { text: '历史记录 3 道题', included: true },
      { text: '', included: false },
    ],
  },
  {
    name: 'Lite',
    price: '¥5',
    period: '/月',
    color: 'text-warm-camelDark',
    features: [
      { text: '500c / 月', included: true, bold: true },
      { text: '错题本 50 道题', included: true },
      { text: '历史记录 5 道题', included: true },
      { text: '', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '¥25',
    period: '/月',
    color: 'text-warm-coralHover',
    features: [
      { text: '1600c / 月', included: true, bold: true },
      { text: '错题本 100 道题', included: true },
      { text: '历史记录 10 道题', included: true },
      { text: '', included: false },
    ],
  },
  {
    name: 'Ultra',
    price: '¥58',
    period: '/月',
    color: 'text-warm-sandDark',
    features: [
      { text: '4000c / 月', included: true, bold: true },
      { text: '错题本 120 道题', included: true },
      { text: '历史记录 20 道题', included: true },
      { text: '', included: false },
    ],
  },
]

export default function VipPage({ tier }) {
  const [showNotice, setShowNotice] = useState(false)
  const [pendingPlan, setPendingPlan] = useState('')

  const currentTier = (tier || 'free').toLowerCase()
  const isOnPaidPlan = currentTier !== 'free'

  const handleSubscribe = (planName) => {
    if (planName === 'Free') return
    setPendingPlan(planName)
    setShowNotice(true)
  }

  return (
    <div>
      <div className="text-center mb-12 mt-6 relative">
        <div className="absolute left-1/2 -top-10 -translate-x-1/2 w-32 h-32 bg-warm-coral/15 rounded-full blur-3xl -z-10"></div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-700 mb-4 tracking-tight">选择适合你的计划</h1>
        <p className="text-stone-400 max-w-lg mx-auto font-medium">✦ 积分，用于 AI 搜题和生成练习</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
        {plans.map((plan) => {
          const isCurrent = plan.name.toLowerCase() === currentTier
          // 非当前方案、非免费、且用户已在付费方案 → 按钮置灰
          const isLocked = !isCurrent && plan.name !== 'Free' && isOnPaidPlan

          return (
            <div
              key={plan.name}
              className={`bg-white/70 backdrop-blur-xl border border-white/90 rounded-[2.5rem] p-8 flex flex-col shadow-glass hover:shadow-glass-lg hover:bg-white/90 transition-all ${isCurrent ? 'ring-1 ring-warm-coral/20' : ''}`}
            >
              {/* 标题行：方案名 + 当前方案标签 */}
              <div className="flex items-center gap-3 mb-2">
                <h3 className={`text-xl font-bold ${plan.color}`}>{plan.name}</h3>
                {isCurrent && (
                  <span className="text-[10px] font-bold text-warm-coralHover bg-warm-coral/10 px-2 py-0.5 rounded-full border border-warm-coral/20">
                    当前方案
                  </span>
                )}
              </div>

              {/* 价格 */}
              <div className="flex items-baseline gap-1 mb-7">
                <span className="text-4xl font-extrabold text-stone-600">{plan.price}</span>
                {plan.period && <span className="text-stone-400 font-medium">{plan.period}</span>}
              </div>

              {/* 特点列表：正好 4 行 */}
              <ul className="space-y-3.5 mb-8 flex-1 text-stone-500 text-sm font-medium">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-3 ${!f.text ? 'opacity-0' : ''}`}>
                    {f.text ? (
                      <CheckIcon size={20} className="text-stone-400 shrink-0 mt-0.5" />
                    ) : (
                      <span className="w-5 h-5 shrink-0 mt-0.5" />
                    )}
                    <span className={f.bold ? 'font-bold text-stone-700' : ''}>{f.text}</span>
                  </li>
                ))}
              </ul>

              {/* 按钮 */}
              {plan.name === 'Free' ? (
                <div className="h-12" /> // 空白占位
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={isCurrent || isLocked}
                  className={`w-full py-3.5 px-4 rounded-2xl font-semibold transition-all ${
                    isCurrent
                      ? 'bg-stone-100 text-stone-300 cursor-default'
                      : isLocked
                        ? 'bg-stone-50 text-stone-300 cursor-not-allowed border border-stone-100'
                        : 'bg-white/80 text-stone-600 hover:bg-white border-2 border-stone-200 hover:border-warm-coral/30 hover:text-warm-coralHover active:scale-[0.98]'
                  }`}
                >
                  {isCurrent ? '当前方案' : '订阅'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-center text-sm text-stone-400 mt-12 font-medium">
        所有计划均可随时取消。如需帮助，请联系 <a href="#" className="text-warm-coralHover hover:text-warm-peachDark underline decoration-warm-coral/30 underline-offset-4">在线客服</a>。
      </p>

      {/* 暂未开通弹窗 */}
      <NoticeDialog
        open={showNotice}
        onClose={() => setShowNotice(false)}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M15 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>
        }
        title="暂未开通该功能"
        message="在线支付功能正在开发中，敬请期待"
      />
    </div>
  )
}
