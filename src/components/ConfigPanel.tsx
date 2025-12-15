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
  sexo: string | null;
  tempo: number | null;
  tempoH?: string;
  tempoM?: string;
  tempoS?: string;
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
        sexo: r.sexo ?? null,
        tempo: r.tempo ?? null,
        tempoText: formatSecondsToClock(r.tempo ?? null),
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

  // Helpers de tempo
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

  function toParts(s: number | null): { hh: string; mm: string; ss: string } {
    if (s == null || isNaN(s)) return { hh: "", mm: "", ss: "" };
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return {
      hh: String(h),
      mm: String(m).padStart(2, "0"),
      ss: String(sec).padStart(2, "0"),
    };
  }

  function partsToSeconds(hh: string | undefined, mm: string | undefined, ss: string | undefined): number | null {
    const h = Number(hh || "0");
    const m = Number(mm || "0");
    const s = Number(ss || "0");
    if (!Number.isFinite(h) || !Number.isFinite(m) || !Number.isFinite(s)) return null;
    const mClamped = Math.max(0, Math.min(59, m));
    const sClamped = Math.max(0, Math.min(59, s));
    return h * 3600 + mClamped * 60 + sClamped;
  }

  const [finalCorrida, setFinalCorrida] = useState<boolean>(() => {
    try {
      return localStorage.getItem("finalCorrida") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("finalCorrida", finalCorrida ? "1" : "0");
    } catch {
      console.warn("Falha ao gravar finalCorrida no localStorage");
    }
  }, [finalCorrida]);

  useEffect(() => {
    const loadFlag = async () => {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "final_corrida")
          .maybeSingle();
        if (error) {
          console.warn("Falha ao carregar flag final_corrida:", error.message);
          return;
        }
        if (data && typeof data.value === "boolean") {
          setFinalCorrida(Boolean(data.value));
          try {
            localStorage.setItem("finalCorrida", data.value ? "1" : "0");
          } catch {
            console.warn("Falha ao gravar finalCorrida no localStorage");
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn("Erro ao consultar settings:", msg);
      }
    };
    if (open && authorized) {
      loadFlag();
    }
  }, [open, authorized]);

  const toggleFinalCorrida = async (checked: boolean) => {
    setFinalCorrida(checked);
    setSaving(true);
    setSaveMsg(null);
    try {
      await supabase
        .from("settings")
        .upsert({ key: "final_corrida", value: checked, updated_at: new Date().toISOString() });
      setSaveMsg("Salvo no Supabase");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("Erro ao salvar flag final_corrida:", msg);
      setSaveMsg("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [inscricoesAbertas, setInscricoesAbertas] = useState<boolean>(() => {
    try {
      return localStorage.getItem("inscricoesAbertas") !== "0";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const loadRegFlag = async () => {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "inscricoes_abertas")
          .maybeSingle();
        if (!error && data && typeof data.value === "boolean") {
          const open = Boolean(data.value);
          setInscricoesAbertas(open);
          try {
            localStorage.setItem("inscricoesAbertas", open ? "1" : "0");
          } catch {}
        }
      } catch {}
    };
    if (open && authorized) {
      loadRegFlag();
    }
  }, [open, authorized]);

  const [savingReg, setSavingReg] = useState(false);
  const [saveRegMsg, setSaveRegMsg] = useState<string | null>(null);

  const toggleFimInscricoes = async (checked: boolean) => {
    const open = !checked;
    setInscricoesAbertas(open);
    setSavingReg(true);
    setSaveRegMsg(null);
    try {
      await supabase
        .from("settings")
        .upsert({ key: "inscricoes_abertas", value: open, updated_at: new Date().toISOString() });
      setSaveRegMsg("Salvo no Supabase");
      try {
        localStorage.setItem("inscricoesAbertas", open ? "1" : "0");
      } catch {}
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("Erro ao salvar flag inscricoes_abertas:", msg);
      setSaveRegMsg("Erro ao salvar");
    } finally {
      setSavingReg(false);
    }
  };

  

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-background w-full max-w-3xl rounded-2xl border border-border shadow-lg text-foreground max-h-[85vh] overflow-y-auto">
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
                          <th className="text-left py-2 pr-2">Tempo (hh:mm:ss)</th>
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
                            <td className="py-2 pr-2">
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={r.tempoH ?? toParts(r.tempo).hh}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
                                    const hh = raw;
                                    const mm = r.tempoM ?? toParts(r.tempo).mm;
                                    const ss = r.tempoS ?? toParts(r.tempo).ss;
                                    const seconds = partsToSeconds(hh, mm, ss);
                                    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, tempoH: hh, tempo: seconds } : x)));
                                  }}
                                  placeholder="hh"
                                  className="h-9 w-14 px-2 rounded-md border border-border bg-card text-foreground text-center"
                                />
                                <span>:</span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={r.tempoM ?? toParts(r.tempo).mm}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
                                    const mm = raw;
                                    const hh = r.tempoH ?? toParts(r.tempo).hh;
                                    const ss = r.tempoS ?? toParts(r.tempo).ss;
                                    const seconds = partsToSeconds(hh, mm, ss);
                                    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, tempoM: mm, tempo: seconds } : x)));
                                  }}
                                  placeholder="mm"
                                  className="h-9 w-12 px-2 rounded-md border border-border bg-card text-foreground text-center"
                                />
                                <span>:</span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={r.tempoS ?? toParts(r.tempo).ss}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
                                    const ss = raw;
                                    const hh = r.tempoH ?? toParts(r.tempo).hh;
                                    const mm = r.tempoM ?? toParts(r.tempo).mm;
                                    const seconds = partsToSeconds(hh, mm, ss);
                                    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, tempoS: ss, tempo: seconds } : x)));
                                  }}
                                  placeholder="ss"
                                  className="h-9 w-12 px-2 rounded-md border border-border bg-card text-foreground text-center"
                                />
                              </div>
                            </td>
                            <td className="py-2 pr-2">{new Date(r.created_at).toLocaleString()}</td>
                            <td className="py-2 pl-2 text-right">
                              <button
                                onClick={async () => {
                                  const payload: Database["public"]["Tables"]["registrations"]["Update"] = {
                                    status_pagamento: r.status_pagamento,
                                    tempo: r.tempo ?? null,
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
              <div className="mt-4 p-4 border rounded-md">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={finalCorrida}
                    onChange={(e) => toggleFinalCorrida(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="font-semibold">Final de Corrida</span>
                </label>
                {saving && <p className="mt-2 text-sm text-muted-foreground">Salvando...</p>}
                {!saving && saveMsg && <p className="mt-2 text-sm text-muted-foreground">{saveMsg}</p>}
              </div>
              <div className="mt-4 p-4 border rounded-md">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!inscricoesAbertas}
                    onChange={(e) => toggleFimInscricoes(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="font-semibold">Fim de Inscrições</span>
                </label>
                {savingReg && <p className="mt-2 text-sm text-muted-foreground">Salvando...</p>}
                {!savingReg && saveRegMsg && <p className="mt-2 text-sm text-muted-foreground">{saveRegMsg}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </>
  );
};

export default ConfigPanel;
