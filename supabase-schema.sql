-- ============================================================
-- AnswerAI - 完整建表脚本
-- 删除所有旧表后再重建（保留 auth.users）
-- ============================================================

-- ========== 删除所有旧表（按依赖顺序） ==========
DROP TABLE IF EXISTS redeem_code_usages CASCADE;
DROP TABLE IF EXISTS redeem_codes CASCADE;
DROP TABLE IF EXISTS workbooks CASCADE;
DROP TABLE IF EXISTS generate_records CASCADE;
DROP TABLE IF EXISTS solve_records CASCADE;
DROP TABLE IF EXISTS square_posts CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS generated_questions CASCADE;
DROP TABLE IF EXISTS user_credits CASCADE;


-- ========== 1. 解题记录表 ==========
CREATE TABLE solve_records (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_input TEXT,
  image_url TEXT,
  ai_response JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE solve_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own solve records"
  ON solve_records FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own solve records"
  ON solve_records FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own solve records"
  ON solve_records FOR DELETE USING (auth.uid() = user_id);


-- ========== 2. 题生题记录表 ==========
CREATE TABLE generate_records (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_input TEXT,
  question_count INTEGER NOT NULL DEFAULT 1,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE generate_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generate records"
  ON generate_records FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generate records"
  ON generate_records FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generate records"
  ON generate_records FOR DELETE USING (auth.uid() = user_id);


-- ========== 3. 错题本表 ==========
CREATE TABLE workbooks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'solve',
  source_record_id BIGINT,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  options TEXT[] DEFAULT '{}',
  answer TEXT,
  explanation TEXT,
  difficulty TEXT DEFAULT '中等',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workbooks"
  ON workbooks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workbooks"
  ON workbooks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workbooks"
  ON workbooks FOR DELETE USING (auth.uid() = user_id);


-- ========== 4. 发现广场表 ==========
CREATE TABLE square_posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  content TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT '中等',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE square_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view square_posts"
  ON square_posts FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert square_posts"
  ON square_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own square_posts"
  ON square_posts FOR DELETE USING (auth.uid() = user_id);


-- ========== 5. 用户订阅/会员表 ==========
CREATE TABLE user_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free',
  credits INTEGER NOT NULL DEFAULT 5,
  credits_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  daily_credits_date DATE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ========== 6. 兑换码表 ==========
CREATE TABLE redeem_codes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tier', 'credits')),
  tier_value TEXT CHECK (tier_value IN ('lite', 'pro', 'ultra')),
  tier_duration_days INTEGER,
  credits_amount INTEGER,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE redeem_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can query redeem codes"
  ON redeem_codes FOR SELECT USING (true);

CREATE POLICY "Service role can manage redeem codes"
  ON redeem_codes FOR ALL USING (auth.role() = 'service_role');


-- ========== 7. 兑换记录表 ==========
CREATE TABLE redeem_code_usages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code_id BIGINT NOT NULL REFERENCES redeem_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  result TEXT NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(code_id, user_id)
);

ALTER TABLE redeem_code_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usages"
  ON redeem_code_usages FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usages"
  ON redeem_code_usages FOR INSERT WITH CHECK (auth.uid() = user_id);
