import { CaseRecord } from "@/lib/types";

export const sampleCases: CaseRecord[] = [
  {
    id: "sample-case-1",
    title: "某圖卡宣稱某政策已違法，是否屬實？",
    question: "這張流傳圖卡中的說法，是否能從公開資料直接推出？",
    stable_conclusion:
      "目前只能確認部分事實，無法直接推出圖卡中的完整指控。",
    confirmed_facts:
      "- 某政策確實在某年開始實施\n- 官方公開文件有提及執行流程\n- 已找到至少一份可核對的原始來源",
    unsupported_claims:
      "- 現有資料不足以直接證明違法\n- 無法從已公開資料直接推論決策動機",
    evidence_list:
      "- 官方新聞稿：https://example.com/a\n- 公開會議紀錄：https://example.com/b",
    open_questions:
      "- 還缺完整原始公文\n- 需要確認當時適用法規版本",
    status: "draft",
    updated_at: new Date().toISOString(),
  },
];
