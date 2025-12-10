interface RequestLike {
  method: string;
  body?: unknown;
}

interface ResponseStatus {
  json(body: unknown): void;
  end(): void;
}

interface ResponseLike {
  setHeader(name: string, value: string): void;
  status(code: number): ResponseStatus;
  json(body: unknown): void;
  end(): void;
}

type AppendRequest = {
  nome: string;
};

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !owner || !repo) {
    res.status(400).json({ error: "Configuração do GitHub ausente (GITHUB_TOKEN/OWNER/REPO)" });
    return;
  }

  const body = (req.body ?? {}) as Partial<AppendRequest>;
  const nome = (body.nome || "").trim();
  if (!nome) {
    res.status(400).json({ error: "Nome é obrigatório" });
    return;
  }

  const path = "public/atletas.tsv";
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };

  try {
    const getRes = await fetch(`${baseUrl}?ref=${encodeURIComponent(branch)}`, { headers });
    let existingText = "";
    let sha: string | undefined;

    if (getRes.status === 200) {
      const json = (await getRes.json()) as { content: string; sha: string };
      existingText = Buffer.from(json.content, "base64").toString("utf-8");
      sha = json.sha;
    } else if (getRes.status === 404) {
      existingText = "nome\temail\ttelefone\tcamisa\ttamanho\tdata\n";
    } else {
      const t = await getRes.text();
      throw new Error(`Falha ao ler arquivo: ${t}`);
    }

    const dateIso = new Date().toISOString();
    const newLine = [nome, "", "", "", "", dateIso].join("\t") + "\n";
    const updatedText = existingText.endsWith("\n") ? existingText + newLine : existingText + "\n" + newLine;
    const contentB64 = Buffer.from(updatedText, "utf-8").toString("base64");

    const putRes = await fetch(baseUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `Append atleta: ${nome}`,
        content: contentB64,
        sha,
        branch,
      }),
    });

    if (!putRes.ok) {
      const t = await putRes.text();
      throw new Error(`Falha ao gravar arquivo: ${t}`);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao gravar";
    res.status(500).json({ error: msg });
  }
}
