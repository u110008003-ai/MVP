import { CaseRecord } from "@/lib/types";

export const sampleCases: CaseRecord[] = [
  {
    id: "sample-case-1",
    title: "某公共事件是否存在錯誤訊息擴散問題",
    question: "這起事件中的主要說法是否被過度簡化，並造成後續討論失真？",
    narrative_timeline: [
      "- 第一階段：事件最早在社群平台上被大量轉傳，說法尚未穩定。",
      "- 第二階段：媒體與意見領袖開始引用片段資訊，產生多個不同版本。",
      "- 第三階段：出現反駁資料與補充背景，但沒有被集中整理。",
      "- 第四階段：討論進入情緒化對立，真正需要驗證的問題被稀釋。",
    ].join("\n"),
    stable_conclusion:
      "目前可以先確認，這起事件至少存在資訊碎片化與二手轉述放大的問題，但仍需要更多可追溯資料來釐清責任與因果鏈。",
    confirmed_facts: [
      "- 事件在短時間內被多個帳號與媒體同步轉載。",
      "- 討論過程中出現彼此矛盾的版本。",
      "- 後續已有部分補充資料浮現，但尚未完成整合。",
    ].join("\n"),
    unsupported_claims: [
      "- 某些最早流傳的版本尚未找到原始來源。",
      "- 關於動機與幕後協調的推測目前缺乏直接證據。",
    ].join("\n"),
    evidence_list: [
      "- 第一波轉傳貼文與時間序列截圖。",
      "- 主要媒體報導連結與改稿紀錄。",
      "- 後續澄清聲明或當事人補充說明。",
    ].join("\n"),
    open_questions: [
      "- 最早的錯誤版本是怎麼形成的？",
      "- 哪些節點造成了誤解被大規模放大？",
      "- 哪些資料足以讓討論回到可驗證層次？",
    ].join("\n"),
    summary_image_url: "",
    summary_image_note: "可以放事件流程圖、關係圖或資訊流向圖。",
    status: "draft",
    updated_at: new Date().toISOString(),
  },
];
