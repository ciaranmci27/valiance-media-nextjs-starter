// Pure-string HTML to Markdown converter used by the blog .md and page .md
// route handlers. No Node-only imports; safe in any runtime.
//
// Intentionally a dependency-free implementation. Turndown / remark would
// each add ~50KB to the function bundle for roughly the same output on the
// HTML shapes we emit (rich-text editor output for blogs, cheerio-extracted
// subtrees for pages). Revisit if a specific conversion bug shows up that
// would be cheaper to fix by swapping converters than by patching here.

const ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&nbsp;': ' ',
};

function decodeEntities(str) {
  return str
    .replace(/&(amp|lt|gt|quot|apos|#39|nbsp);/g, (m) => ENTITIES[m] || m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function inlineConvert(html) {
  let s = html;
  s = s.replace(/<br\s*\/?>(\n)?/gi, '  \n');
  s = s.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  s = s.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
  s = s.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  s = s.replace(/<img\s+[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*\/?>/gi, '![$1]($2)');
  s = s.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)');
  s = s.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*\/?>/gi, '![]($1)');
  return s;
}

function cellText(inner) {
  return inlineConvert(inner)
    .replace(/<[^>]+>/g, '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

function collectCells(trInner) {
  const cells = [];
  trInner.replace(/<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi, (_m, content) => {
    cells.push(cellText(content));
    return '';
  });
  return cells;
}

function convertTables(html) {
  return html.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, inner) => {
    let header = null;
    const bodyRows = [];

    const theadMatch = inner.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
    if (theadMatch) {
      const firstTr = theadMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);
      if (firstTr) header = collectCells(firstTr[1]);
    }

    const bodyHtml = theadMatch ? inner.replace(theadMatch[0], '') : inner;
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    let firstSeen = false;
    while ((trMatch = trRegex.exec(bodyHtml)) !== null) {
      const cells = collectCells(trMatch[1]);
      if (!cells.length) continue;
      if (!header && !firstSeen && /<th[\s>]/i.test(trMatch[1])) {
        header = cells;
      } else {
        bodyRows.push(cells);
      }
      firstSeen = true;
    }

    if (!header && bodyRows.length) header = bodyRows.shift();
    if (!header) return '';

    const width = header.length;
    const lines = [];
    lines.push('| ' + header.join(' | ') + ' |');
    lines.push('| ' + header.map(() => '---').join(' | ') + ' |');
    for (const row of bodyRows) {
      const padded = row.slice(0, width);
      while (padded.length < width) padded.push('');
      lines.push('| ' + padded.join(' | ') + ' |');
    }
    return '\n\n' + lines.join('\n') + '\n\n';
  });
}

// Innermost-first list conversion. A single regex pass can't handle nesting
// because non-greedy `<ul>...</ul>` closes on the first `</ul>` (the inner
// one), leaving the outer tag dangling. Instead we iterate: each pass
// matches only lists that contain no further <ul>/<ol> tags. After the
// innermost pair becomes markdown text, its parent becomes the new innermost.
function convertLists(html) {
  let s = html;
  const innerRe = /<(ul|ol)[^>]*>((?:(?!<\/?(?:ul|ol)[^>]*>)[\s\S])*?)<\/\1>/i;
  for (let pass = 0; pass < 30; pass += 1) {
    if (!innerRe.test(s)) break;
    s = s.replace(new RegExp(innerRe.source, 'gi'), (_, tag, inner) => {
      const items = [];
      let n = 0;
      inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m, content) => {
        n += 1;
        let body = inlineConvert(content);
        body = body.replace(/<\/?(?:p|div|span)[^>]*>/gi, '');
        body = body.replace(/<[^>]+>/g, '');
        body = body.replace(/\s+$/g, '');
        const prefix = tag.toLowerCase() === 'ol' ? `${n}. ` : '- ';
        const pad = ' '.repeat(prefix.length);
        const trimmed = body.replace(/^\s*\n+/, '');
        const [first, ...rest] = trimmed.split('\n');
        const lines = [prefix + (first || '').trim()];
        for (const line of rest) {
          if (line.trim() === '') continue;
          lines.push(pad + line);
        }
        items.push(lines.join('\n'));
        return '';
      });
      return `\n\n${items.join('\n')}\n\n`;
    });
  }
  return s;
}

function htmlToMarkdown(html) {
  if (!html || typeof html !== 'string') return '';

  let s = html;

  s = s.replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');

  // Extract code/pre blocks first as placeholders so their content (which may
  // contain literal `<h1>` etc.) is not mangled by later regex passes.
  const codeBlocks = [];
  const stash = (raw) => {
    const idx = codeBlocks.length;
    codeBlocks.push(raw);
    return `\u0000CODEBLOCK_${idx}\u0000`;
  };
  s = s.replace(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (_, code) => stash(`\n\n\`\`\`\n${decodeEntities(code).trim()}\n\`\`\`\n\n`));
  s = s.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi,
    (_, code) => stash(`\n\n\`\`\`\n${decodeEntities(code).trim()}\n\`\`\`\n\n`));

  // Tables before lists/blockquotes so their cells don't get treated as list
  // items. Tables are AEO-valuable (comparison content), so worth preserving.
  s = convertTables(s);

  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) => {
    const text = inlineConvert(inner).replace(/<[^>]+>/g, '').trim();
    return '\n\n' + text.split('\n').map((l) => `> ${l}`).join('\n') + '\n\n';
  });

  s = convertLists(s);

  for (let level = 1; level <= 6; level += 1) {
    const tag = new RegExp(`<h${level}[^>]*>([\\s\\S]*?)</h${level}>`, 'gi');
    const hashes = '#'.repeat(level);
    s = s.replace(tag, (_, content) => `\n\n${hashes} ${inlineConvert(content).replace(/<[^>]+>/g, '').trim()}\n\n`);
  }

  s = s.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');

  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, content) => `\n\n${inlineConvert(content)}\n\n`);

  s = inlineConvert(s);

  s = s.replace(/<\/?(div|section|article|header|footer|main|aside|nav|figure|figcaption|span)[^>]*>/gi, '');

  s = s.replace(/<[^>]+>/g, '');

  s = decodeEntities(s);

  // Restore code block placeholders.
  s = s.replace(/\u0000CODEBLOCK_(\d+)\u0000/g, (_, idx) => codeBlocks[parseInt(idx, 10)]);

  s = s.replace(/[ \t]+\n/g, '\n');
  s = s.replace(/\n{3,}/g, '\n\n');
  s = s.trim();

  return s + '\n';
}

module.exports = { htmlToMarkdown, decodeEntities };
