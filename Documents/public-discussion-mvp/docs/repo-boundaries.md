# Repo Boundaries

## 主產品是什麼

這個 repo 現在的正式產品是：

- 公共討論平台 MVP

如果你要修改首頁、登入、提案池、案件頁、管理端，預設都應該改這條主線。

## 主線路徑

這些路徑屬於公共討論平台主線：

- `app/page.tsx`
- `app/cases/**`
- `app/proposals`
- `app/admin/submissions`
- `app/api/auth/**`
- `app/api/cases/**`
- `app/api/proposals/**`
- `app/api/submissions/**`
- `components/auth-panel.tsx`
- `components/auth-provider.tsx`
- `components/home-auth-nav.tsx`
- `components/case-*`
- `components/proposals-board.tsx`
- `lib/cases.ts`
- `lib/server-auth.ts`
- `lib/roles.ts`
- `supabase/*.sql`

## 殘留 explorer 路徑

下面這些是另一條 infection / candidemia explorer 原型殘留，不是公共討論平台首頁，也不是主站核心流程：

- `app/explorer/**`
- `app/api/v1/**`
- `components/infection-explorer/**`
- `lib/infection-explorer.ts`
- `research/infection-repurposing-openapi.yaml`

## 編輯規則

除非你這次的任務是明確要修 explorer 原型，否則：

1. 不要把 `app/page.tsx` 改成 explorer 首頁
2. 不要把 `app/layout.tsx` metadata 改成 infection / candidemia 產品文案
3. 不要從首頁或主站流程新增對 `lib/infection-explorer.ts` 的依賴
4. 若看到 `explorer`、`api/v1`、`infection-explorer` 字樣，先確認是不是改錯產品線

## 最容易混淆的地方

- `app/page.tsx`
  - 這個現在是公共討論平台首頁，不是 infection explorer landing page。

- `app/layout.tsx`
  - metadata 應該描述公共討論平台，不應再顯示 infection repurposing 文案。

- `lib/infection-explorer.ts`
  - 這是另一條原型的資料與分析邏輯，不應被主站首頁直接引用。

## 建議的後續整理

如果之後要更徹底避免混淆，可以考慮：

1. 把 explorer 原型搬到獨立 repo
2. 或把 explorer 全部集中到單一明確資料夾並加上 `legacy/` 前綴
3. 或直接刪除已經不再使用的 explorer 原型
