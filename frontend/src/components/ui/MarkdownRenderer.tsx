/**
 * MarkdownRenderer — renders AI-generated text as structured markdown.
 *
 * Supports:
 *  • Ordered and unordered lists (the primary fix — "1. item" displays as a real list)
 *  • Inline code  (`code`)
 *  • Fenced code blocks  (```lang … ```)
 *  • Bold, italic, paragraphs
 *  • Tables (via remark-gfm)
 *
 * Two style contexts:
 *  • "chat"    — smaller text, tighter spacing, for AI instructor bubble text
 *  • "content" — larger text, relaxed spacing, for explanation sections
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

type MarkdownContext = 'chat' | 'content';

interface MarkdownRendererProps {
  children: string;
  context?: MarkdownContext;
}

function buildComponents(ctx: MarkdownContext): Components {
  const isChat = ctx === 'chat';
  const baseFont = "'Crimson Pro', serif";
  const monoFont = 'JetBrains Mono, monospace';

  const textColor = isChat ? '#2a2420' : '#3a342e';
  const textSize  = isChat ? '13.5px' : '15px';
  const lineH     = isChat ? 1.6 : 1.65;
  const pGap      = isChat ? '0.45em' : '0.6em';

  return {
    // ── Paragraphs ──────────────────────────────────────────────────────────
    p({ children }) {
      return (
        <p
          style={{
            fontFamily: baseFont,
            fontSize: textSize,
            lineHeight: lineH,
            color: textColor,
            margin: `0 0 ${pGap}`,
          }}
        >
          {children}
        </p>
      );
    },

    // ── Ordered list (numbered) ──────────────────────────────────────────────
    ol({ children }) {
      return (
        <ol
          style={{
            margin: `${pGap} 0`,
            paddingLeft: isChat ? '1.2em' : '1.4em',
            listStyleType: 'decimal',
            display: 'flex',
            flexDirection: 'column',
            gap: isChat ? '0.25em' : '0.35em',
          }}
        >
          {children}
        </ol>
      );
    },

    // ── Unordered list ────────────────────────────────────────────────────────
    ul({ children }) {
      return (
        <ul
          style={{
            margin: `${pGap} 0`,
            paddingLeft: isChat ? '1.2em' : '1.4em',
            listStyleType: 'disc',
            display: 'flex',
            flexDirection: 'column',
            gap: isChat ? '0.25em' : '0.35em',
          }}
        >
          {children}
        </ul>
      );
    },

    // ── List item ─────────────────────────────────────────────────────────────
    li({ children }) {
      return (
        <li
          style={{
            fontFamily: baseFont,
            fontSize: textSize,
            lineHeight: lineH,
            color: textColor,
          }}
        >
          {children}
        </li>
      );
    },

    // ── Inline code ───────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    code({ node, className, children, ref: _ref, ...props }) {
      // react-markdown passes className="language-xxx" for fenced code blocks;
      // inline code has no className.
      const isBlock = Boolean(className);
      if (isBlock) {
        // block code is handled by <pre> below — just emit the raw text
        return (
          <code
            className={className}
            style={{ fontFamily: monoFont, fontSize: isChat ? '12px' : '13px' }}
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code
          style={{
            fontFamily: monoFont,
            fontSize: isChat ? '11.5px' : '12.5px',
            background: 'oklch(0.93 0.04 60)',
            border: '1px solid oklch(0.87 0.05 60)',
            borderRadius: 4,
            padding: '0.1em 0.35em',
            color: 'oklch(0.38 0.12 60)',
          }}
          {...props}
        >
          {children}
        </code>
      );
    },

    // ── Code block (fenced) ───────────────────────────────────────────────────
    pre({ children }) {
      return (
        <pre
          style={{
            fontFamily: monoFont,
            fontSize: isChat ? '12px' : '13px',
            background: '#1e1a16',
            color: '#e8dfd0',
            border: '1px solid #3a322a',
            borderRadius: 8,
            padding: isChat ? '10px 12px' : '14px 16px',
            overflowX: 'auto',
            margin: `${pGap} 0`,
            lineHeight: 1.6,
            whiteSpace: 'pre',
          }}
        >
          {children}
        </pre>
      );
    },

    // ── Strong / em ────────────────────────────────────────────────────────────
    strong({ children }) {
      return (
        <strong style={{ fontWeight: 600, color: isChat ? '#1a1614' : '#2a2420' }}>
          {children}
        </strong>
      );
    },
    em({ children }) {
      return <em style={{ fontStyle: 'italic', color: textColor }}>{children}</em>;
    },

    // ── Headings (unlikely in chat, but handle for content context) ─────────
    h1({ children }) {
      return (
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: isChat ? '16px' : '20px',
            fontWeight: 600,
            color: '#1a1614',
            margin: `0.6em 0 0.3em`,
          }}
        >
          {children}
        </h2>
      );
    },
    h2({ children }) {
      return (
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: isChat ? '15px' : '18px',
            fontWeight: 600,
            color: '#1a1614',
            margin: `0.5em 0 0.25em`,
          }}
        >
          {children}
        </h3>
      );
    },
    h3({ children }) {
      return (
        <h4
          style={{
            fontFamily: baseFont,
            fontSize: isChat ? '14px' : '16px',
            fontWeight: 600,
            color: '#2a2420',
            margin: `0.4em 0 0.2em`,
          }}
        >
          {children}
        </h4>
      );
    },

    // ── Blockquote ────────────────────────────────────────────────────────────
    blockquote({ children }) {
      return (
        <blockquote
          style={{
            borderLeft: '3px solid oklch(0.7 0.1 60)',
            paddingLeft: '0.75em',
            margin: `${pGap} 0`,
            color: 'oklch(0.5 0.08 60)',
            fontStyle: 'italic',
          }}
        >
          {children}
        </blockquote>
      );
    },

    // ── Table (GFM) ───────────────────────────────────────────────────────────
    table({ children }) {
      return (
        <div style={{ overflowX: 'auto', margin: `${pGap} 0` }}>
          <table
            style={{
              borderCollapse: 'collapse',
              fontSize: textSize,
              fontFamily: baseFont,
              width: '100%',
            }}
          >
            {children}
          </table>
        </div>
      );
    },
    th({ children }) {
      return (
        <th
          style={{
            fontFamily: monoFont,
            fontSize: isChat ? '11px' : '12px',
            fontWeight: 600,
            background: 'oklch(0.94 0.04 60)',
            border: '1px solid oklch(0.86 0.05 60)',
            padding: '6px 10px',
            textAlign: 'left',
            color: '#2a2420',
          }}
        >
          {children}
        </th>
      );
    },
    td({ children }) {
      return (
        <td
          style={{
            border: '1px solid oklch(0.9 0.04 60)',
            padding: '5px 10px',
            color: textColor,
            verticalAlign: 'top',
          }}
        >
          {children}
        </td>
      );
    },

    // ── Horizontal rule ───────────────────────────────────────────────────────
    hr() {
      return (
        <hr
          style={{
            border: 'none',
            borderTop: '1px solid oklch(0.88 0.05 60)',
            margin: '0.75em 0',
          }}
        />
      );
    },
  };
}

export function MarkdownRenderer({ children, context = 'chat' }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={buildComponents(context)}
    >
      {children}
    </ReactMarkdown>
  );
}
