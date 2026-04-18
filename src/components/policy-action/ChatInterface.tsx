import type { FormEvent, ReactNode } from 'react';

export type SuggestionChip = {
  id: string;
  label: string;
  description: string;
};

type ChatInterfaceProps = {
  title: string;
  subtitle: string;
  suggestionChips: SuggestionChip[];
  activeSuggestionId: string;
  onSuggestionSelect: (chipId: string) => void;
  showIntro: boolean;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content?: string;
    pending?: boolean;
    error?: boolean;
    intent?: string;
  }>;
  renderAssistantMessage: (message: ChatInterfaceProps['messages'][number]) => ReactNode;
  getUserIntentLabel: (intent?: string) => string;
  promptInput: string;
  onPromptInputChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  quickPrompts: Array<{ label: string; text: string }>;
  onQuickPrompt: (text: string) => void;
  isLoading: boolean;
  isReady: boolean;
  placeholder: string;
};

export default function ChatInterface({
  title,
  subtitle,
  suggestionChips,
  activeSuggestionId,
  onSuggestionSelect,
  showIntro,
  messages,
  renderAssistantMessage,
  getUserIntentLabel,
  promptInput,
  onPromptInputChange,
  onSubmit,
  quickPrompts,
  onQuickPrompt,
  isLoading,
  isReady,
  placeholder,
}: ChatInterfaceProps) {
  return (
    <section
      className="rounded-[32px] border p-4 shadow-[0_28px_80px_rgba(13,33,165,0.18)] backdrop-blur-xl md:p-6"
      style={{
        borderColor: 'var(--theme-border)',
        background: 'linear-gradient(180deg, rgba(13,33,165,0.12), rgba(13,33,165,0.08))',
      }}
    >
      <div
        className="relative overflow-hidden rounded-[30px] border p-4 shadow-[0_18px_60px_rgba(13,33,165,0.28)] md:p-6"
        style={{
          borderColor: 'var(--theme-border)',
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--theme-secondary) 94%, #11218f), color-mix(in srgb, var(--theme-secondary) 88%, #0B1C87))',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(209,208,103,0.2),transparent_65%)]" />

        <div className="relative mx-auto max-w-6xl">
          <div className={`text-center transition-all ${showIntro ? 'pb-2' : 'pb-1'}`}>
            <p className="font-peace text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--theme-accent)' }}>
              Policy Compass
            </p>
            <h2 className={`font-peace mx-auto mt-4 max-w-4xl font-semibold text-[#EFEFEF] ${
              showIntro ? 'text-3xl md:text-5xl' : 'text-2xl md:text-4xl'
            }`}>
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#EFEFEF]/80 md:text-base">
              {subtitle}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {suggestionChips.map((chip) => {
                const active = chip.id === activeSuggestionId;

                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => onSuggestionSelect(chip.id)}
                    className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                      active
                        ? 'text-[#0B132B]'
                        : 'bg-white/[0.08] text-[#EFEFEF]/82 hover:bg-white/[0.14]'
                    }`}
                    style={{
                      borderColor: active ? 'var(--theme-accent)' : 'var(--theme-border)',
                      backgroundColor: active ? 'var(--theme-accent)' : undefined,
                    }}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 text-sm text-[#EFEFEF]/72">
              {suggestionChips.find((chip) => chip.id === activeSuggestionId)?.description}
            </div>
          </div>

          {!showIntro ? (
            <div className="mt-6 space-y-5">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`rounded-[28px] border px-4 py-4 md:px-5 md:py-5 ${
                    message.role === 'user'
                      ? 'ml-auto max-w-3xl bg-white/35'
                      : message.error
                        ? 'max-w-5xl bg-[#ffe7ea]'
                        : 'max-w-5xl bg-white/16'
                  }`}
                  style={{ borderColor: 'var(--theme-border)' }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                        message.role === 'user'
                          ? 'text-[#0B132B]'
                          : 'text-[#EFEFEF]'
                      }`}
                      style={{
                        backgroundColor: message.role === 'user'
                          ? 'var(--theme-accent)'
                          : 'rgba(239, 239, 239, 0.16)',
                      }}
                    >
                      {message.role === 'user' ? getUserIntentLabel(message.intent) : 'Policy-to-Action AI'}
                    </span>
                    {message.pending ? (
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--theme-accent)' }}>
                        Working...
                      </span>
                    ) : null}
                  </div>

                  {message.role === 'assistant' ? (
                    renderAssistantMessage(message)
                  ) : (
                    <pre className="whitespace-pre-wrap font-peace text-sm leading-7 text-[#0B132B]/88">
                      {message.content}
                    </pre>
                  )}
                </article>
              ))}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className={showIntro ? 'mt-6' : 'mt-7'}>
            <div className="rounded-[28px] border p-4 md:p-5" style={{ borderColor: 'var(--theme-border)', background: 'rgba(239, 239, 239, 0.16)' }}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
                    style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-accent)', background: 'rgba(13,33,165,0.2)' }}
                  >
                    Policy-to-Action Flow
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#EFEFEF]/84">
                    I explain the policy, estimate the household impact, preview nearby pressure, then help you take the next step.
                  </p>
                </div>
                <div className="inline-flex w-fit rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#EFEFEF]/88" style={{ borderColor: 'var(--theme-border)', background: 'rgba(13,33,165,0.35)' }}>
                  One guided citizen thread
                </div>
              </div>

              <textarea
                value={promptInput}
                onChange={(event) => onPromptInputChange(event.target.value)}
                placeholder={placeholder}
                disabled={!isReady}
                className={`w-full resize-none bg-transparent text-sm leading-8 text-[#EFEFEF] outline-none placeholder:text-[#EFEFEF]/55 ${
                  showIntro ? 'mt-4 h-28 md:h-32' : 'mt-5 h-28 md:h-32'
                }`}
              />

              <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between" style={{ borderColor: 'rgba(239,239,239,0.35)' }}>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt.text}
                      type="button"
                      onClick={() => onQuickPrompt(prompt.text)}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:bg-white/35"
                      style={{ borderColor: 'var(--theme-border)', background: 'rgba(13,33,165,0.2)', color: '#EFEFEF' }}
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!isReady || isLoading || !promptInput.trim()}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold text-[#0B132B] transition disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: 'var(--theme-accent)' }}
                >
                  {isLoading ? 'Thinking...' : 'Ask Policy Compass'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
