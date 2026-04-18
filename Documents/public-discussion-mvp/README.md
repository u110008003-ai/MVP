# 公共討論平台 MVP

這個專案目前的主產品是「公共討論平台 MVP」。

主要功能包含：
- 首頁案件列表
- 提案池
- 正式案件詳情頁
- 修訂與補充資料流程
- 管理端 submissions 審核
- Supabase 權限與角色控管

## 先看這個

這個 repo 目前混有兩條產品線：

1. 主線：公共討論平台
2. 殘留原型：infection / candidemia explorer

之後如果要修改首頁、登入、案件、提案、管理端，請預設你應該改的是「公共討論平台」那條主線，不是 explorer 原型。

更完整的邊界說明在：

- [docs/repo-boundaries.md](./docs/repo-boundaries.md)

## 目前主線檔案

最常會動到的主站入口：

- `app/page.tsx`
- `app/cases/**`
- `app/proposals`
- `app/admin/submissions`
- `components/auth-*`
- `components/home-auth-nav.tsx`
- `components/case-*`
- `lib/cases.ts`
- `lib/server-auth.ts`
- `supabase/*.sql`

## 本機開發

```bash
npm.cmd run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm.cmd run build
```

## 測試

```bash
npm.cmd run test
```
