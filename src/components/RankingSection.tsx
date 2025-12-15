import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  nome: string;
  sexo: string | null;
  tempo: number | null;
};

function formatSecondsToClock(s: number | null): string {
  if (s == null || isNaN(s)) return "";
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    const hh = String(hours).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

const RankingSection = () => {
  const [visible, setVisible] = useState<boolean>(() => {
    try {
      return localStorage.getItem("finalCorrida") === "1";
    } catch {
      return false;
    }
  });
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "finalCorrida") {
        setVisible(e.newValue === "1");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const loadFlag = async () => {
      try {
        const env = import.meta.env as { VITE_SUPABASE_URL?: string; VITE_SUPABASE_PUBLISHABLE_KEY?: string };
        if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_PUBLISHABLE_KEY) {
          const { data, error } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "final_corrida")
            .maybeSingle();
          if (!error && data && typeof data.value === "boolean") {
            setVisible(Boolean(data.value));
            try {
              localStorage.setItem("finalCorrida", data.value ? "1" : "0");
            } catch {
              console.warn("Falha ao gravar finalCorrida no localStorage");
            }
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn("Erro ao consultar settings:", msg);
      }
    };
    loadFlag();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const env = import.meta.env as { VITE_SUPABASE_URL?: string; VITE_SUPABASE_PUBLISHABLE_KEY?: string; VITE_RANKING_TSV_URL?: string };
        let loadedFromSupabase = false;

        if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_PUBLISHABLE_KEY) {
          try {
            const { data, error } = await supabase
              .from("registrations")
              .select("id, nome, sexo, tempo");
            if (error) throw new Error(error.message);
            setRows((data || []) as Row[]);
            loadedFromSupabase = true;
          } catch (err) {
            console.warn("Supabase indisponível; usando TSV como fallback:", err);
          }
        }

        if (!loadedFromSupabase) {
          const url = env.VITE_RANKING_TSV_URL ?? "/ranking.tsv";
          try {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) throw new Error("Falha ao carregar ranking TSV");
            const text = await res.text();
            const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
            if (lines.length === 0) {
              setRows([]);
            } else {
              const hasHeader = /^nome\t/i.test(lines[0]);
              const dataLines = hasHeader ? lines.slice(1) : lines;
              const parsed = dataLines
                .map((line) => line.split("\t"))
                .filter((cols) => cols[0] && cols[0].trim().length > 0)
                .map((cols, idx) => ({
                  id: `${cols[0]}-${idx}`,
                  nome: cols[0]?.trim() || "",
                  sexo: (cols[1]?.trim() || "").toUpperCase(),
                  tempo: Number(cols[2] || "") || null,
                }));
              setRows(parsed);
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro ao carregar fallback TSV";
            setError(msg);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const male = useMemo(
    () =>
      rows
        .filter((r) => (r.sexo || "").toLowerCase().startsWith("m") && r.tempo != null)
        .slice()
        .sort((a, b) => (a.tempo ?? Infinity) - (b.tempo ?? Infinity)),
    [rows]
  );

  const female = useMemo(
    () =>
      rows
        .filter((r) => (r.sexo || "").toLowerCase().startsWith("f") && r.tempo != null)
        .slice()
        .sort((a, b) => (a.tempo ?? Infinity) - (b.tempo ?? Infinity)),
    [rows]
  );

  if (!visible) return null;

  return (
    <section id="ranking" className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">
            Ranking <span className="text-primary">Final</span>
          </h2>
        </div>

        {loading && (
          <div className="text-center text-muted-foreground">Carregando...</div>
        )}

        {!loading && error && (
          <div className="text-center text-destructive">{error}</div>
        )}

        {!loading && !error && male.length === 0 && female.length === 0 && (
          <div className="text-center text-muted-foreground">Sem dados de ranking</div>
        )}

        {!loading && !error && (male.length > 0 || female.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Masculino</h3>
              <ul className="grid grid-cols-1 gap-4">
                {male.map((r, idx) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-3 bg-card rounded-full px-6 py-3 shadow-md border border-border"
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      <div className="w-5 h-5 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-foreground">{idx + 1}. {r.nome}</p>
                    </div>
                    <div className="text-muted-foreground">{formatSecondsToClock(r.tempo)}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-4">Feminino</h3>
              <ul className="grid grid-cols-1 gap-4">
                {female.map((r, idx) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-3 bg-card rounded-full px-6 py-3 shadow-md border border-border"
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      <div className="w-5 h-5 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-foreground">{idx + 1}. {r.nome}</p>
                    </div>
                    <div className="text-muted-foreground">{formatSecondsToClock(r.tempo)}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RankingSection;
