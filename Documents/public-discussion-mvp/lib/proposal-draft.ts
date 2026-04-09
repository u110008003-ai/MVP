export const proposalDraftSections = [
  { key: "question", label: "核心問題" },
  { key: "narrative", label: "事件來龍去脈" },
  { key: "conclusion", label: "目前暫定結論" },
  { key: "facts", label: "已確認事實" },
  { key: "claims", label: "待查或未支持主張" },
  { key: "evidence", label: "目前掌握材料" },
  { key: "imageNote", label: "總整理圖說明" },
] as const;

export type ProposalDraftSectionKey = (typeof proposalDraftSections)[number]["key"];

export type ProposalDraft = Record<ProposalDraftSectionKey, string>;

export const emptyProposalDraft: ProposalDraft = {
  question: "",
  narrative: "",
  conclusion: "",
  facts: "",
  claims: "",
  evidence: "",
  imageNote: "",
};

function marker(label: string) {
  return `## ${label}`;
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

  return draft;
}

export function isStructuredProposalContent(content: string) {
  return proposalDraftSections.some(({ label }) => content.includes(marker(label)));
}
