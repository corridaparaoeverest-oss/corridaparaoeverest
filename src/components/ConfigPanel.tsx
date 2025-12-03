import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Cog, Trash2, X, Save } from "lucide-react";

type Row = {
  id: string;
  created_at: string;
  nome: string;
  quer_camisa: boolean;
  tamanho_camisa: string | null;
  nome_na_camisa: string | null;
  status_pagamento: string;
};

const PASS = "corrid@";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

const ConfigPanel = ({ open, onOpenChange }: Props) => {
  const [authorized, setAuthorized] = useState(false);
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => [r.nome, r.nome_na_camisa || ""].some((v) => v.toLowerCase().includes(term)));
  }, [q, rows]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      const mapped = (data || []).map((r: any) => ({
        id: r.id,
        created_at: r.created_at,
        nome: r.nome,
        quer_camisa: r.quer_camisa,
        tamanho_camisa: r.tamanho_camisa ?? null,
        nome_na_camisa: r.nome_na_camisa ?? null,
        status_pagamento: r.status_pagamento ?? "pendente",
      })) as Row[];
      setRows(mapped);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && authorized) load();
  }, [open, authorized]);

  const tryAuth = () => {
    if (pass === PASS) {
      setAuthorized(true);
      setPass("");
    } else {
      setAuthorized(false);
    }
  };

  const del = async (id: string) => {
    if (!authorized) return;
    const ok = window.confirm("Confirmar exclusão?");
    if (!ok) return;
    const { error } = await supabase.from("registrations").delete().eq("id", id);
    if (error) {
      console.warn("Falha ao deletar:", error.message);
      return;
    }
    await load();
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-background w-full max-w-3xl rounded-2xl border border-border shadow-lg text-foreground">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display text-xl text-foreground">Configuração</h3>
              <button className="p-2 rounded-md hover:bg-muted" onClick={() => onOpenChange(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {!authorized ? (
              <div className="p-6">
                <label className="block text-sm mb-2">Senha</label>
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full h-12 px-3 rounded-md border border-border bg-card text-foreground placeholder:text-foreground/70"
                  placeholder="Digite a senha"
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={tryAuth}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
                  >
                    Entrar
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-md border border-border bg-card text-foreground placeholder:text-foreground/70"
                    placeholder="Buscar por nome"
                  />
                  <button
                    onClick={load}
                    className="px-3 rounded-md border border-border bg-card hover:bg-muted"
                  >
                    Atualizar
                  </button>
                </div>
                {loading && <div className="">Carregando...</div>}
                {error && <div className="text-destructive">{error}</div>}
                {!loading && !error && (
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left py-2 pr-2">Nome</th>
                          <th className="text-left py-2 pr-2">Status</th>
                          <th className="text-left py-2 pr-2">Data</th>
                          <th className="text-right py-2 pl-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((r) => (
                          <tr key={r.id} className="border-t border-border">
                            <td className="py-2 pr-2">
                              <div className="text-foreground">{r.nome}</div>
                              {r.nome_na_camisa && (
                                <div className="text-xs text-muted-foreground">Camisa: {r.nome_na_camisa}</div>
                              )}
                            </td>
                            <td className="py-2 pr-2">
                              <select
                                value={r.status_pagamento}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status_pagamento: val } : x)));
                                }}
                                className="h-9 px-2 rounded-md border border-border bg-card text-foreground"
                              >
                                <option value="pendente">pendente</option>
                                <option value="pago">pago</option>
                                <option value="isento">isento</option>
                              </select>
                            </td>
                            <td className="py-2 pr-2">{new Date(r.created_at).toLocaleString()}</td>
                            <td className="py-2 pl-2 text-right">
                              <button
                                onClick={async () => {
                                  const payload: Database["public"]["Tables"]["registrations"]["Update"] = {
                                    status_pagamento: r.status_pagamento,
                                  };
                                  const { error } = await supabase
                                    .from("registrations")
                                    .update(payload)
                                    .eq("id", r.id);
                                  if (error) {
                                    console.warn("Falha ao salvar:", error.message);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 mr-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
                              >
                                <Save className="w-4 h-4" />
                                Salvar
                              </button>
                              <button
                                onClick={() => del(r.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-destructive text-destructive-foreground hover:opacity-90"
                              >
                                <Trash2 className="w-4 h-4" />
                                Deletar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ConfigPanel;
