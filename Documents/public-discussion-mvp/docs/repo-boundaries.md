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

## 已清理的舊原型

先前混入 working tree 的 infection / candidemia explorer 原型，已經從主專案清理掉。

本次清理包含：

- `app/explorer/**`
- `app/api/v1/**`
- `components/infection-explorer/**`
- `lib/infection-explorer.ts`
- `research/infection-repurposing-openapi.yaml`

## 編輯規則

除非之後重新建立新的獨立原型，否則：

1. 不要再把首頁改成其他產品的 landing page
2. 不要把 `app/layout.tsx` metadata 改成不相關產品文案
3. 不要從主站流程新增與 infection explorer 相關的依賴
4. 如果之後又出現 `explorer` 或 `api/v1` 之類的新路徑，先確認是不是另一條產品線被混進來

## 最容易搞混的地方

- `app/page.tsx`
  - 這是公共討論平台首頁。

- `app/layout.tsx`
  - metadata 應該描述公共討論平台，不應出現其他產品名稱。

- `README.md`
  - 應該永遠優先描述公共討論平台，而不是其他歷史原型。
