import { supabase } from './supabase'

/**
 * 订阅/积分管理服务
 * 表: user_subscriptions
 * 字段: user_id, tier, credits, credits_updated_at, daily_credits_date, expires_at
 */

/**
 * 获取用户完整订阅信息
 * @returns {{ tier, credits, expires_at, daily_credits_date } | null}
 */
export async function getSubscription(userId) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('tier, credits, expires_at, daily_credits_date')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('获取订阅信息失败:', error)
    return null
  }
  return data || null
}

/**
 * 获取用户当前积分
 */
export async function getCredits(userId) {
  const sub = await getSubscription(userId)
  return sub?.credits ?? 0
}

/**
 * 获取用户会员等级
 */
export async function getTier(userId) {
  const sub = await getSubscription(userId)
  return sub?.tier || 'free'
}

/**
 * 扣除积分
 * @returns {boolean} 是否扣除成功
 */
export async function deductCredits(userId, amount) {
  // 获取当前积分
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('credits')
    .eq('user_id', userId)
    .single()

  if (error || !data) return false
  if (data.credits < amount) return false

  const newCredits = data.credits - amount
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({ credits: newCredits, credits_updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (updateError) {
    console.error('扣除积分失败:', updateError)
    return false
  }
  return true
}

/**
 * 为用户添加积分
 */
export async function addCredits(userId, amount) {
  const { data } = await supabase
    .from('user_subscriptions')
    .select('credits')
    .eq('user_id', userId)
    .single()

  if (data) {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ credits: data.credits + amount, credits_updated_at: new Date().toISOString() })
      .eq('user_id', userId)
    if (error) console.error('添加积分失败:', error)
  } else {
    // 首次添加：初始化一条记录
    const { error } = await supabase
      .from('user_subscriptions')
      .insert({ user_id: userId, tier: 'free', credits: amount, daily_credits_date: new Date().toISOString().split('T')[0] })
    if (error) console.error('初始化订阅记录失败:', error)
  }
}

/**
 * 注册时初始化订阅记录（免费用户，5 积分）
 */
export async function initCreditsOnSignUp(userId) {
  const { data } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('user_id', userId)
    .single()

  if (!data) {
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        tier: 'free',
        credits: 5,
        daily_credits_date: today,
      })
    if (error) console.error('初始化订阅记录失败:', error)
  }
}
