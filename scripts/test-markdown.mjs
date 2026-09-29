// Manual sanity test for the markdown parser regexes used in
// src/components/chat/markdown.tsx. Run: node scripts/test-markdown.mjs
// (not a real unit suite — just a quick check of the parse rules.)

const INLINE_RE =
  /(\*\*|__)(?=\S)([\s\S]*?\S)\1|(\*)(?=\S)([^*_\n]*?\S)\3|`([^`\n]+)`|((?:https?:\/\/|www\.)[^\s<>()\[\]{}"']+[^\s<>()\[\]{}"',.;:!?])/g;
const HEADING_RE = /^(#{1,3})\s+(.+)$/;
const BULLET_RE = /^\s*[-*+]\s+(.+)$/;
const ORDERED_RE = /^\s*\d+[.)]\s+(.+)$/;

function inline(text) {
  const out = [];
  let m, cursor = 0, i = 0;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > cursor) out.push(["text", text.slice(cursor, m.index)]);
    const [full, b, bt, it, itt, code, url] = m;
    if (b) out.push(["bold", bt]);
    else if (it) out.push(["italic", itt]);
    else if (code !== undefined) out.push(["code", code]);
    else if (url) out.push(["url", url]);
    cursor = m.index + full.length;
  }
  if (cursor < text.length) out.push(["text", text.slice(cursor)]);
  return out;
}

let failed = 0;
function expect(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) console.log("PASS", name);
  else {
    failed++;
    console.log("FAIL", name, "\n  got     ", a, "\n  expected", e);
  }
}

// The user's reported bug: bold showing literal asterisks.
expect("bold", inline("He is a **Software Engineer** at Acme"), [
  ["text", "He is a "],
  ["bold", "Software Engineer"],
  ["text", " at Acme"],
]);
expect("bold with punctuation", inline("**Netflix**, **Amazon**"), [
  ["bold", "Netflix"],
  ["text", ", "],
  ["bold", "Amazon"],
]);
expect("italic", inline("this is *really* good"), [
  ["text", "this is "],
  ["italic", "really"],
  ["text", " good"],
]);
expect("code", inline("the `useState` hook"), [
  ["text", "the "],
  ["code", "useState"],
  ["text", " hook"],
]);
expect("bold url inside", inline("**[GitHub](https://github.com/x)**"), [
  ["bold", "[GitHub](https://github.com/x)"],
]);
expect("bare url", inline("see https://amansinganamala.vercel.app."), [
  ["text", "see "],
  ["url", "https://amansinganamala.vercel.app"],
  ["text", "."],
]);
expect("no false positive on math", inline("2 * 3 * 4 = 24"), [
  ["text", "2 * 3 * 4 = 24"],
]);
expect("no false positive snake_case", inline("his handle is snake_case_name"), [
  ["text", "his handle is snake_case_name"],
]);
expect("unclosed bold stays literal", inline("wait **for it"), [
  ["text", "wait **for it"],
]);

expect("bullet", BULLET_RE.exec("- First item")?.[1], "First item");
expect("star bullet", BULLET_RE.exec("* also works")?.[1], "also works");
expect("ordered", ORDERED_RE.exec("2) Second")?.[1], "Second");
expect("heading", HEADING_RE.exec("### Projects")?.[2], "Projects");
expect("not a bullet mid-sentence", BULLET_RE.exec("a - b"), null);

console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) FAILED.`);
process.exit(failed === 0 ? 0 : 1);
