// Simple markdown to HTML converter for legal pages
// Uses regex for headers, bold, italic, lists — no external dep needed

export function marked(text: string): string {
  return text
    // Remove YAML frontmatter
    .replace(/^---[\s\S]*?---\n?/, '')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // H1
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // H2
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // H4
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr/>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Unordered lists
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)(?!\s*<li>)/g, '<ul>$&</ul>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs (lines not starting with html tags)
    .replace(/^(?!<[a-z])(.{1,})$/gm, '<p>$1</p>')
    // Clean up double <p> around block elements
    .replace(/<p>(<h[1-6]>)/g, '$1')
    .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
    .replace(/<p>(<ul>)/g, '$1')
    .replace(/(<\/ul>)<\/p>/g, '$1')
    .replace(/<p>(<li>)/g, '$1')
    .replace(/(<\/li>)<\/p>/g, '$1')
    .replace(/<p>(<hr\/>)/g, '$1')
    .replace(/(<hr\/>)<\/p>/g, '$1')
    .replace(/<p>(<blockquote>)/g, '$1')
    .replace(/(<\/blockquote>)<\/p>/g, '$1')
    // Empty paragraphs
    .replace(/<p>\s*<\/p>/g, '')
    .trim();
}
