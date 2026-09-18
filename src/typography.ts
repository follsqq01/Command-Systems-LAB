import { useEffect, type RefObject } from "react";

// Keep Russian prepositions and short connecting words with the word that follows.
// Text stays ordinary and editable in the source; only rendered text nodes change.
const nonBreakingWords = new Set([
  "а", "без", "близ", "в", "вместо", "вне", "во", "возле", "вокруг", "внутри",
  "для", "до", "за", "из", "изо", "и", "или", "к", "ко", "между", "на", "над",
  "не", "ни", "но", "о", "об", "обо", "около", "от", "ото", "перед", "по",
  "под", "после", "при", "про", "против", "ради", "с", "сквозь", "со", "среди",
  "у", "через",
]);

const wordAndSpace = /(?<![\p{L}\p{N}])([\p{L}]+)([ \t]+)(?=[«„“"(\[]?[\p{L}\p{N}])/gu;
const excluded = "script, style, textarea, pre, code, svg, [contenteditable], [data-keep-spaces]";
const originalText = new WeakMap<Text, { source: string; rendered: string }>();

function keepWordsTogether(node: Text, isPhone: boolean) {
  if (!node.parentElement || node.parentElement.closest(excluded)) return;
  const current = node.data;
  const isChangeCard = !!node.parentElement.closest(".change-card");
  const previous = originalText.get(node);
  // Keep the editable source text so resizing can restore ordinary spaces in mobile cards.
  const source = previous && current === previous.rendered
    ? previous.source
    : isChangeCard ? current.replace(/\u00a0/g, " ") : current;
  const updated = isPhone && isChangeCard
    ? source
    : source.replace(wordAndSpace, (match, word: string) =>
      nonBreakingWords.has(word.toLocaleLowerCase("ru")) ? `${word}\u00a0` : match,
    );
  originalText.set(node, { source, rendered: updated });
  if (updated !== current) node.data = updated;
}

function visit(node: Node, isPhone: boolean) {
  if (node.nodeType === Node.TEXT_NODE) {
    keepWordsTogether(node as Text, isPhone);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE || (node as Element).matches(excluded)) return;
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) keepWordsTogether(walker.currentNode as Text, isPhone);
}

export function useRussianTypography(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const phone = window.matchMedia("(max-width: 600px)");
    const rescan = () => visit(root, phone.matches);
    rescan();
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "characterData") keepWordsTogether(record.target as Text, phone.matches);
        else record.addedNodes.forEach((node) => visit(node, phone.matches));
      }
    });
    observer.observe(root, { subtree: true, childList: true, characterData: true });
    phone.addEventListener("change", rescan);
    return () => {
      phone.removeEventListener("change", rescan);
      observer.disconnect();
    };
  }, [rootRef]);
}
