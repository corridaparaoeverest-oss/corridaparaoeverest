import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Athlete = {
  nome: string;
  email?: string;
  telefone?: string;
  camisa?: string;
  tamanho?: string;
  data?: string;
  nomeCamisa?: string;
};

const AthletesSection = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const env = import.meta.env as { VITE_SUPABASE_URL?: string; VITE_SUPABASE_PUBLISHABLE_KEY?: string; VITE_ATLETAS_TSV_URL?: string };
        if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_PUBLISHABLE_KEY) {
          const { data, error } = await supabase
            .from("registrations")
            .select("nome, quer_camisa, tamanho_camisa, nome_na_camisa, created_at")
            .order("created_at", { ascending: false });
          if (error) {
            throw new Error(error.message);
          }
          const parsed = (data || []).map((row: { nome: string; quer_camisa: boolean; tamanho_camisa: string | null; nome_na_camisa: string | null; created_at: string }) => ({
            nome: row.nome,
            camisa: row.quer_camisa ? "Sim" : undefined,
            tamanho: row.tamanho_camisa || undefined,
            nomeCamisa: row.nome_na_camisa || undefined,
            data: row.created_at,
          }));
          setAthletes(parsed);
        } else {
          const url = env.VITE_ATLETAS_TSV_URL ?? "/atletas.tsv";
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) {
            throw new Error("Falha ao carregar lista de atletas");
          }
          const text = await res.text();
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length === 0) {
            setAthletes([]);
          } else {
            const hasHeader = /^nome\t/i.test(lines[0]);
            const dataLines = hasHeader ? lines.slice(1) : lines;
            const parsed = dataLines
              .map((line) => line.split("\t"))
              .filter((cols) => cols[0] && cols[0].trim().length > 0)
              .map((cols) => ({
                nome: cols[0]?.trim() || "",
                email: cols[1]?.trim() || undefined,
                telefone: cols[2]?.trim() || undefined,
                camisa: cols[3]?.trim() || undefined,
                tamanho: cols[4]?.trim() || undefined,
                data: cols[5]?.trim() || undefined,
              }));
            setAthletes(parsed);
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erro ao carregar";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section id="inscritos" className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">
            Atletas <span className="text-primary">inscritos</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Lista pública atualizada pelo arquivo TSV
          </p>
        </div>

        {loading && (
          <div className="text-center text-muted-foreground">Carregando...</div>
        )}

        {!loading && error && (
          <div className="text-center text-destructive">{error}</div>
        )}

        {!loading && !error && athletes.length === 0 && (
          <div className="text-center text-muted-foreground">Nenhum inscrito ainda</div>
        )}

        {!loading && !error && athletes.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <span className="inline-block bg-card rounded-full px-4 py-2 border border-border text-sm">
                {athletes.length} inscrito{athletes.length > 1 ? "s" : ""}
              </span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {athletes.map((a, idx) => (
                <li
                  key={`${a.nome}-${idx}`}
                  className="flex items-center gap-3 bg-card rounded-full px-6 py-3 shadow-md border border-border"
                >
                  <div className="p-2 rounded-full bg-primary/10">
                    <div className="w-5 h-5 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-foreground">{a.nome}</p>
                    {a.camisa && (
                      <p className="text-xs text-muted-foreground">
                        Camisa: {a.camisa}
                    {a.tamanho ? ` (${a.tamanho})` : ""}
                    {a.nomeCamisa ? ` — Nome: ${a.nomeCamisa}` : ""}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default AthletesSection;
