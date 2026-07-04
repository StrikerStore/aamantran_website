'use client';

/**
 * Client component that renders markdown content as HTML.
 * Uses a simple regex-based parser — sufficient for blog content.
 * All source HTML is escaped up front, so raw tags in post content render
 * as text instead of executing; link/image URLs are restricted to safe schemes.
 */

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Allow only http(s), site-relative, anchor and mailto URLs in href/src. */
function safeUrl(url: string): string {
  const u = url.trim();
  return /^(https?:\/\/|\/|#|mailto:)/i.test(u) ? u : '#';
}

function markdownToHtml(md: string): string {
  if (!md) return '';
  // Normalise line endings first. Browsers submit <textarea> content with CRLF,
  // and JS's "." / "$" don't match a trailing "\r", which would make every
  // heading, list item and blockquote fall through to a plain paragraph.
  const normalised = md.replace(/\r\n?/g, '\n');
  // Escape everything first — the parser below only ever inserts its own tags.
  let html = escapeHtml(normalised)
    // Code blocks (must be before other replacements)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) =>
      `<pre><code class="lang-${lang || 'text'}">${code}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>');

  // Process line by line for block-level elements
  const lines = html.split('\n');
  const result: string[] = [];
  let inParagraph = false;
  let listTag: 'ul' | 'ol' | null = null;
  let inPre = false;

  const closeList = () => {
    if (listTag) { result.push(`</${listTag}>`); listTag = null; }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track pre blocks (already processed above, but still in the string)
    if (line.includes('<pre>')) { inPre = true; }
    if (line.includes('</pre>')) { inPre = false; result.push(line); continue; }
    if (inPre) { result.push(line); continue; }

    // Empty line — close paragraph/list
    if (line.trim() === '') {
      if (inParagraph) { result.push('</p>'); inParagraph = false; }
      closeList();
      continue;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      if (inParagraph) { result.push('</p>'); inParagraph = false; }
      closeList();
      const level = headerMatch[1].length;
      result.push(`<h${level}>${processInline(headerMatch[2])}</h${level}>`);
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      if (inParagraph) { result.push('</p>'); inParagraph = false; }
      closeList();
      result.push('<hr />');
      continue;
    }

    // Blockquote ("> " is "&gt; " after escaping)
    if (line.startsWith('&gt; ')) {
      if (inParagraph) { result.push('</p>'); inParagraph = false; }
      closeList();
      result.push(`<blockquote>${processInline(line.slice(5))}</blockquote>`);
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      if (inParagraph) { result.push('</p>'); inParagraph = false; }
      if (listTag !== 'ul') { closeList(); result.push('<ul>'); listTag = 'ul'; }
      result.push(`<li>${processInline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (inParagraph) { result.push('</p>'); inParagraph = false; }
      if (listTag !== 'ol') { closeList(); result.push('<ol>'); listTag = 'ol'; }
      result.push(`<li>${processInline(olMatch[1])}</li>`);
      continue;
    }

    // Close list if entering a non-list line
    closeList();

    // Regular text — paragraph
    if (!inParagraph) {
      result.push('<p>');
      inParagraph = true;
    } else {
      result.push('<br />');
    }
    result.push(processInline(line));
  }

  // Close open tags
  if (inParagraph) result.push('</p>');
  closeList();

  return result.join('\n');
}

/** Process inline markdown (bold, italic, links, images). Input is pre-escaped. */
function processInline(text: string): string {
  return text
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) =>
      `<img src="${safeUrl(url)}" alt="${alt}" loading="lazy" />`)
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) =>
      `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`)
    // Bold + Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

export default function BlogContent({ content }: { content: string }) {
  const html = markdownToHtml(content);
  return (
    <div
      className="blog-content-rendered"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
