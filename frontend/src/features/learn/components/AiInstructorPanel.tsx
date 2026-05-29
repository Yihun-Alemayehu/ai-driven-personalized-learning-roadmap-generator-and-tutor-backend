import { useState, useRef, useEffect } from 'react';
import { XIcon, SendIcon, BotIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useAskInstructorStream } from '@/api/instructor-chat';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import type { RoadmapNode } from '@/types';

interface Explanation {
  summary: string;
  keyPoints: string[];
  commonMistakes?: string[];
}

interface Message {
  role: 'bot' | 'user';
  text: string;
  /** true while the model is still generating this message */
  streaming?: boolean;
}

interface Props {
  node: RoadmapNode;
  explanation: Explanation | null;
  onClose: () => void;
  enrollmentId: string;
}

function buildSuggestedPrompts(node: RoadmapNode, explanation: Explanation | null): string[] {
  const title = node.title;

  if (explanation && explanation.keyPoints.length >= 2) {
    return [
      `Can you elaborate on: "${explanation.keyPoints[0]}"?`,
      `What's the most common mistake beginners make with ${title}?`,
      `How does ${title} apply in real-world projects?`,
      `What should I practice first when learning ${title}?`,
    ];
  }

  return [
    `What is ${title} and why does it matter?`,
    `What are the core concepts in ${title}?`,
    `What's the best way to practice ${title}?`,
    `What prerequisites do I need for ${title}?`,
  ];
}

function TypingDots() {
  return (
    <div className="flex items-center gap-0.75 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.25 h-1.25 rounded-full animate-bounce"
          style={{
            background: 'oklch(0.6 0.1 60)',
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.9s',
          }}
        />
      ))}
    </div>
  );
}

/** Blinking text cursor shown while streaming */
function StreamCursor() {
  return (
    <span
      className="inline-block w-0.5 h-[1em] ml-px align-middle animate-pulse"
      style={{ background: 'oklch(0.45 0.14 60)', borderRadius: 1 }}
      aria-hidden="true"
    />
  );
}

export function AiInstructorPanel({ node, explanation, onClose, enrollmentId }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: `Hi! I'm your AI instructor for this lesson. Ask me anything about ${node.title}.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestedPrompts = buildSuggestedPrompts(node, explanation);

  const { ask, isStreaming } = useAskInstructorStream(node.id);

  const showSuggestions = messages.length === 1;
  const hasHistory = messages.length > 1;

  useEffect(() => {
    if (!collapsed) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, collapsed]);

  function send(question: string) {
    const q = question.trim();
    if (!q || isStreaming) return;

    // Add user message + streaming bot placeholder
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: q },
      { role: 'bot', text: '', streaming: true },
    ]);
    setInput('');

    ask(
      { question: q, explanation, enrollmentId },
      {
        onChunk: (chunk) => {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === 'bot') {
              next[next.length - 1] = { ...last, text: last.text + chunk };
            }
            return next;
          });
        },
        onDone: () => {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === 'bot') {
              next[next.length - 1] = { ...last, streaming: false };
            }
            return next;
          });
        },
        onError: () => {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === 'bot' && last.streaming) {
              next[next.length - 1] = {
                role: 'bot',
                text: last.text || 'Something went wrong. Please try again.',
                streaming: false,
              };
            }
            return next;
          });
        },
      },
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div
      className="flex flex-col h-full border-l shrink-0"
      style={{
        background: '#faf7f1',
        borderColor: '#d6cfbf',
        width: collapsed ? 40 : 360,
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* ── Collapsed strip ── */}
      {collapsed && (
        <div className="flex flex-col items-center w-full h-full py-3 gap-2">
          <button
            onClick={() => setCollapsed(false)}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-[#ebe6db]"
            style={{ color: '#9a9088' }}
            title="Expand"
          >
            <ChevronLeftIcon size={14} />
          </button>

          <div className="flex-1 flex flex-col items-center justify-center gap-2 min-h-0">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'oklch(0.92 0.08 60)', color: 'oklch(0.45 0.14 60)' }}
            >
              <BotIcon size={11} />
            </div>
            {hasHistory && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'oklch(0.62 0.18 28)' }}
              />
            )}
            <span
              style={{
                fontFamily: "'Crimson Pro', serif",
                color: '#9a9088',
                fontSize: 10,
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginTop: 6,
              }}
            >
              AI Instructor
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-[#ebe6db]"
            style={{ color: '#9a9088' }}
            title="Close"
          >
            <XIcon size={13} />
          </button>
        </div>
      )}

      {/* ── Expanded panel ── */}
      {!collapsed && (
        <>
          {/* Header */}
          <div
            className="shrink-0 border-b"
            style={{ borderColor: '#d6cfbf', background: 'oklch(0.97 0.03 60)' }}
          >
            <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: 'oklch(0.88 0.1 60)',
                    color: 'oklch(0.42 0.15 60)',
                    boxShadow: '0 0 0 3px oklch(0.94 0.06 60)',
                  }}
                >
                  <BotIcon size={15} />
                </div>
                <div>
                  <div
                    className="text-[13px] font-semibold leading-none"
                    style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
                  >
                    AI Instructor
                  </div>
                  <div
                    className="text-[11px] mt-0.5 truncate max-w-45"
                    style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
                  >
                    {node.title}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCollapsed(true)}
                  className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-[#ebe6db]"
                  style={{ color: '#9a9088' }}
                  title="Collapse panel"
                >
                  <ChevronRightIcon size={14} />
                </button>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-[#ebe6db]"
                  style={{ color: '#9a9088' }}
                  title="Close panel"
                >
                  <XIcon size={14} />
                </button>
              </div>
            </div>

            {/* Context chip */}
            {explanation && (
              <div className="px-4 pb-2.5">
                <span
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    background: 'oklch(0.9 0.07 60)',
                    color: 'oklch(0.42 0.15 60)',
                    border: '1px solid oklch(0.84 0.09 60)',
                  }}
                >
                  <span>✦</span> Explanation loaded as context
                </span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'bot' && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mb-0.5"
                    style={{ background: 'oklch(0.9 0.08 60)', color: 'oklch(0.45 0.14 60)' }}
                  >
                    <BotIcon size={10} />
                  </div>
                )}
                <div
                  className="max-w-[82%] px-3.5 py-2.5 text-[13.5px] leading-relaxed"
                  style={
                    msg.role === 'user'
                      ? {
                          background: '#1a1614',
                          color: '#f5f0ea',
                          fontFamily: "'Crimson Pro', serif",
                          borderRadius: '14px 14px 3px 14px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                        }
                      : {
                          background: '#fff',
                          color: '#2a2420',
                          fontFamily: "'Crimson Pro', serif",
                          borderRadius: '14px 14px 14px 3px',
                          border: '1px solid oklch(0.89 0.06 60)',
                          boxShadow: '0 1px 2px rgba(180,160,130,0.08)',
                          minHeight: msg.streaming && !msg.text ? 32 : undefined,
                        }
                  }
                >
                  {/* Streaming placeholder — show dots while waiting for first token */}
                  {msg.streaming && !msg.text ? (
                    <TypingDots />
                  ) : msg.role === 'bot' ? (
                    <div style={{ minWidth: 0 }}>
                      <MarkdownRenderer context="chat">{msg.text}</MarkdownRenderer>
                      {msg.streaming && <StreamCursor />}
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          {/* Suggested prompts */}
          {showSuggestions && (
            <div
              className="mx-3 mb-3 rounded-[10px] overflow-hidden shrink-0"
              style={{ border: '1px solid oklch(0.88 0.06 60)' }}
            >
              <div
                className="px-3 py-2 text-[9.5px] tracking-widest uppercase font-medium"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: 'oklch(0.55 0.1 60)',
                  background: 'oklch(0.94 0.05 60)',
                  borderBottom: '1px solid oklch(0.88 0.06 60)',
                  letterSpacing: '0.12em',
                }}
              >
                Suggested questions
              </div>
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  disabled={isStreaming}
                  className="w-full text-left flex items-start gap-2 px-3 py-2.5 transition-colors disabled:opacity-50"
                  style={{
                    fontFamily: "'Crimson Pro', serif",
                    color: '#3a342e',
                    fontSize: 13,
                    background: i % 2 === 0 ? '#fefcf9' : '#faf7f1',
                    borderTop: i > 0 ? '1px solid oklch(0.92 0.04 60)' : undefined,
                    lineHeight: 1.4,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'oklch(0.94 0.05 60)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? '#fefcf9' : '#faf7f1')}
                  onClick={() => send(prompt)}
                >
                  <span
                    className="shrink-0 mt-0.5 text-[11px]"
                    style={{ color: 'oklch(0.55 0.12 60)' }}
                  >
                    →
                  </span>
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-1 shrink-0">
            <div
              className="flex items-end gap-2 rounded-xl px-3 py-2.5 transition-shadow"
              style={{
                background: '#f3efe7',
                border: inputFocused ? '1px solid oklch(0.65 0.1 60)' : '1px solid #d6cfbf',
                boxShadow: inputFocused ? '0 0 0 3px oklch(0.93 0.06 60)' : 'none',
              }}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Ask anything about this lesson…"
                disabled={isStreaming}
                className="flex-1 resize-none bg-transparent text-[13.5px] outline-none leading-relaxed placeholder:text-[#b8b0a8]"
                style={{
                  fontFamily: "'Crimson Pro', serif",
                  color: '#1a1614',
                  minHeight: 22,
                  maxHeight: 80,
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = `${Math.min(el.scrollHeight, 80)}px`;
                }}
              />
              <button
                disabled={!input.trim() || isStreaming}
                onClick={() => send(input)}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-all disabled:opacity-35"
                style={{
                  background: input.trim() && !isStreaming ? '#1a1614' : '#c2b9a6',
                  color: '#faf7f1',
                }}
              >
                <SendIcon size={12} />
              </button>
            </div>
            <p
              className="text-[9.5px] text-center mt-1.5"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#c0b8b0' }}
            >
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </>
      )}
    </div>
  );
}
