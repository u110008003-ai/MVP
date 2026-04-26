export const proposalDraftSections = [
  {
    key: "question",
    label: "核心問題",
    description: "先用一句話說清楚這個提案到底想討論什麼。",
    tone: "neutral",
    promoteToCase: true,
  },
  {
    key: "narrativeSideA",
    label: "觀點 A：來龍去脈",
    description: "放其中一方的事件脈絡，例如甲方、支持方、當事人或某一邊的說法。",
    tone: "neutral",
    promoteToCase: true,
  },
  {
    key: "narrativeSideB",
    label: "觀點 B：來龍去脈",
    description: "放另一方的事件脈絡，例如乙方、反對方、外界或另一邊的說法。",
    tone: "neutral",
    promoteToCase: true,
  },
  {
    key: "conclusion",
    label: "目前暫定結論",
    description: "這裡放目前比較穩的整理，不要直接寫成立場宣言。",
    tone: "gold",
    promoteToCase: true,
  },
  {
    key: "facts",
    label: "已確認事實",
    description: "只放目前有依據、能被查證的內容。",
    tone: "success",
    promoteToCase: true,
  },
  {
    key: "possibleExplanations",
    label: "目前可能解釋",
    description: "列出目前合理的解釋方向，但先不要把猜測寫成定論。",
    tone: "info",
    promoteToCase: true,
  },
  {
    key: "claims",
    label: "未支持主張",
    description: "放目前常被講，但證據還不足的說法。",
    tone: "warning",
    promoteToCase: true,
  },
  {
    key: "evidence",
    label: "證據與材料",
    description: "可放文件、截圖、公開資訊、原始資料線索。",
    tone: "neutral",
    promoteToCase: true,
  },
  {
    key: "referenceLinks",
    label: "參考連結",
    description: "一行一筆，之後可以和內文的 (1)(2) 對應。",
    tone: "neutral",
    promoteToCase: true,
  },
  {
    key: "openQuestions",
    label: "待確認問題",
    description: "列出目前還沒查清楚、需要再補的地方。",
    tone: "neutral",
    promoteToCase: true,
  },
  {
    key: "imageNote",
    label: "總整理圖說明",
    description: "如果之後要加總整理圖，這裡可先寫圖說或視覺結構。",
    tone: "neutral",
    promoteToCase: true,
  },
  {
    key: "authorAside",
    label: "作者 OS / 心裡話",
    description: "這裡可以寫你自己的判斷、顧慮或備註，但不會直接升格進正式案件。",
    tone: "neutral",
    promoteToCase: false,
  },
] as const;

export type ProposalDraftSectionKey = (typeof proposalDraftSections)[number]["key"];
export type ProposalDraftTone = (typeof proposalDraftSections)[number]["tone"];

export type ProposalDraft = Record<ProposalDraftSectionKey, string>;

export const emptyProposalDraft: ProposalDraft = {
  question: "",
  narrativeSideA: "",
  narrativeSideB: "",
  conclusion: "",
  facts: "",
  possibleExplanations: "",
  claims: "",
  evidence: "",
  referenceLinks: "",
  openQuestions: "",
  imageNote: "",
  authorAside: "",
};

const legacyNarrativeLabel = "事件來龍去脈";

function marker(label: string) {
  return `## ${label}`;
}

export function combineNarrativeSides(sideA: string, sideB: string) {
  const blocks = [
    sideA.trim() ? `[觀點 A]\n${sideA.trim()}` : "",
    sideB.trim() ? `[觀點 B]\n${sideB.trim()}` : "",
  ].filter(Boolean);

  return blocks.join("\n\n");
}

export function serializeProposalDraft(draft: ProposalDraft) {
  return proposalDraftSections
    .map(({ key, label }) => `${marker(label)}\n${draft[key].trim()}`)
    .join("\n\n");
}

export function parseProposalDraft(content: string): ProposalDraft {
  const draft: ProposalDraft = { ...emptyProposalDraft };

  for (let index = 0; index < proposalDraftSections.length; index += 1) {
    const current = proposalDraftSections[index];
    const next = proposalDraftSections[index + 1];
    const startMarker = marker(current.label);
    const startIndex = content.indexOf(startMarker);

    if (startIndex < 0) {
      continue;
    }

    const contentStart = startIndex + startMarker.length;
    const endIndex = next ? content.indexOf(marker(next.label), contentStart) : content.length;
    const raw = content.slice(contentStart, endIndex >= 0 ? endIndex : content.length);
    draft[current.key] = raw.trim();
  }

  if (!draft.narrativeSideA && !draft.narrativeSideB) {
    const legacyStart = content.indexOf(marker(legacyNarrativeLabel));

    if (legacyStart >= 0) {
      const afterLegacy = content.slice(legacyStart + marker(legacyNarrativeLabel).length);
      const nextKnownMarkerIndex = proposalDraftSections
        .map((section) => afterLegacy.indexOf(marker(section.label)))
        .filter((index) => index >= 0)
        .sort((a, b) => a - b)[0];

      draft.narrativeSideA =
        (nextKnownMarkerIndex !== undefined
          ? afterLegacy.slice(0, nextKnownMarkerIndex)
          : afterLegacy
        ).trim();
    }
  }

  return draft;
}

export function isStructuredProposalContent(content: string) {
  return (
    proposalDraftSections.some(({ label }) => content.includes(marker(label))) ||
    content.includes(marker(legacyNarrativeLabel))
  );
}
