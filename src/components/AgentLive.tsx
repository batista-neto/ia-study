"use client";

type Props = {
  busy: boolean;
  status: string;
  thinking: string;
  transcript: string;
};

export function AgentLive({ busy, status, thinking, transcript }: Props) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-line bg-ink-2/70">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${busy ? "bg-gold live-dot" : "bg-muted"}`}
          />
          <p className="text-sm">Agente Cursor</p>
        </div>
        <p className="max-w-[70%] truncate text-xs text-muted">{status}</p>
      </div>
      <div className="grid gap-0 md:grid-cols-2">
        <LivePane title="Raciocínio" empty="O raciocínio do agente aparece aqui.">
          {thinking}
        </LivePane>
        <LivePane title="Resposta ao vivo" empty="O texto gerado entra em tempo real.">
          {transcript}
        </LivePane>
      </div>
    </section>
  );
}

function LivePane({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: string;
}) {
  return (
    <div className="min-h-40 border-t border-line p-4 md:border-t-0 md:border-l md:first:border-l-0">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
        {title}
      </p>
      <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap font-mono text-[12px] leading-5 text-cream/80">
        {children || <span className="text-muted">{empty}</span>}
      </pre>
    </div>
  );
}
