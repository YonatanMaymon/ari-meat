// Renders the text blocks Ari edits in the admin (src/content/pages/*.yaml) at build time.
// A blank line starts a new paragraph and a single line break is kept (`breaks`), like the old
// Wix text. Links and bold use Markdown: [לחצו כאן](/menu), **מודגש**.
import { marked } from 'marked';

export function markdown(text: string): string {
  return marked.parse(text, { async: false, breaks: true });
}
