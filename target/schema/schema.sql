-- ==============================================
-- 🚀 AI Finance Assistant – Supabase Schema
-- Author: Jaiyantan
-- ==============================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ===============================
-- 1️⃣ Profiles
-- ===============================
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  username text unique,
  avatar_url text,
  currency text default 'INR',
  created_at timestamp with time zone default now()
);

-- ===============================
-- 2️⃣ Transactions
-- ===============================
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  txn_date date not null,
  description text,
  category text,
  merchant text,
  type text check (type in ('credit', 'debit')),
  amount numeric(10,2) not null,
  created_at timestamp with time zone default now()
);
create index transactions_user_date_idx on public.transactions (user_id, txn_date);

-- ===============================
-- 3️⃣ Categories
-- ===============================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  color text default '#4f46e5',
  icon text,
  budget_limit numeric(10,2),
  created_at timestamp with time zone default now()
);

-- ===============================
-- 4️⃣ Budgets
-- ===============================
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete cascade,
  month integer check (month between 1 and 12),
  year integer,
  limit_amount numeric(10,2),
  spent_amount numeric(10,2) default 0,
  created_at timestamp with time zone default now()
);
create index budgets_user_month_idx on public.budgets (user_id, year, month);

-- ===============================
-- 5️⃣ Goals
-- ===============================
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  target_amount numeric(10,2),
  current_amount numeric(10,2) default 0,
  deadline date,
  status text check (status in ('active', 'completed', 'missed')) default 'active',
  created_at timestamp with time zone default now()
);

-- ===============================
-- 6️⃣ Chat Sessions
-- ===============================
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  session_name text,
  created_at timestamp with time zone default now()
);

-- ===============================
-- 7️⃣ Messages
-- ===============================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.chat_sessions on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamp with time zone default now()
);
create index messages_session_idx on public.messages (session_id);

-- ===============================
-- 8️⃣ Insights
-- ===============================
create table public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  type text check (type in ('spending_pattern', 'goal_progress', 'budget_alert')),
  summary text,
  data jsonb,
  created_at timestamp with time zone default now()
);

-- ===============================
-- 9️⃣ User Settings
-- ===============================
create table public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  theme text default 'light',
  notifications_enabled boolean default true,
  preferred_view text default 'chart',
  language text default 'en',
  created_at timestamp with time zone default now()
);

-- ===============================
-- Enable Row Level Security (RLS)
-- ===============================
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.categories enable row level security;
alter table public.budgets enable row level security;
alter table public.goals enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.messages enable row level security;
alter table public.insights enable row level security;
alter table public.user_settings enable row level security;

-- ===============================
-- RLS Policies
-- ===============================

-- Profiles
create policy "Users can manage their own profiles"
on public.profiles for all
using (auth.uid() = id);

-- Transactions
create policy "Users can manage their own transactions"
on public.transactions for all
using (auth.uid() = user_id);

-- Categories
create policy "Users can manage their own categories"
on public.categories for all
using (auth.uid() = user_id);

-- Budgets
create policy "Users can manage their own budgets"
on public.budgets for all
using (auth.uid() = user_id);

-- Goals
create policy "Users can manage their own goals"
on public.goals for all
using (auth.uid() = user_id);

-- Chat Sessions
create policy "Users can manage their own chat sessions"
on public.chat_sessions for all
using (auth.uid() = user_id);

-- Messages
create policy "Users can manage their own messages"
on public.messages for all
using (
  auth.uid() in (
    select user_id from public.chat_sessions where id = session_id
  )
);

-- Insights
create policy "Users can manage their own insights"
on public.insights for all
using (auth.uid() = user_id);

-- User Settings
create policy "Users can manage their own settings"
on public.user_settings for all
using (auth.uid() = user_id);

-- ===============================
-- ✅ Done
-- ===============================
