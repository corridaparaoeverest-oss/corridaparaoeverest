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

type RegistrationRequest = {
  nome: string;
  email: string;
  telefone: string;
  quer_camisa: boolean;
  tamanho_camisa?: string;
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

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM || "Corrida para o Everest <onboarding@resend.dev>";
  const testMode = (process.env.RESEND_TEST_MODE || "").toLowerCase() === "true";
  if (!apiKey) {
    res.status(400).json({ error: "RESEND_API_KEY não configurada" });
    return;
  }

  const body = (req.body ?? {}) as Partial<RegistrationRequest>;
  const { nome, email, telefone, quer_camisa, tamanho_camisa } = body;
  if (!nome || !email || !telefone) {
    res.status(400).json({ error: "Campos obrigatórios ausentes" });
    return;
  }

  const camisaInfo = quer_camisa
    ? `<p><strong>Camisa do evento:</strong> Sim - Tamanho ${tamanho_camisa || ""}</p>`
    : `<p><strong>Camisa do evento:</strong> Não</p>`;

  const organizerHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2d5a27; border-bottom: 2px solid #e6a33e; padding-bottom: 10px;">
            🏃 Nova Inscrição - Corrida para o Everest
          </h1>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Dados do Participante:</h2>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>E-mail:</strong> ${email}</p>
            <p><strong>Telefone:</strong> ${telefone}</p>
            ${camisaInfo}
          </div>
          <div style="background: #2d5a27; color: white; padding: 15px; border-radius: 10px; text-align: center;">
            <p style="margin: 0;">📅 26/12/2025 às 07:00h</p>
            <p style="margin: 5px 0 0 0;">📍 Parque de Exposições → Sítio Everest</p>
          </div>
        </div>
      `;

  const participantHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2d5a27; border-bottom: 2px solid #e6a33e; padding-bottom: 10px;">
            🎉 Inscrição Confirmada!
          </h1>
          <p>Olá <strong>${nome}</strong>,</p>
          <p>Sua inscrição na <strong>Corrida para o Everest</strong> foi realizada com sucesso!</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">📋 Detalhes do Evento:</h2>
            <p><strong>📅 Data:</strong> 26/12/2025</p>
            <p><strong>⏰ Horário:</strong> 07:00h (concentração 30min antes)</p>
            <p><strong>📍 Largada:</strong> Parque de Exposições - Miracema RJ</p>
            <p><strong>🏁 Chegada:</strong> Sítio Everest - Miracema RJ</p>
            <p><strong>🛤️ Distância:</strong> 10 km</p>
            <p><strong>☕ Café da manhã:</strong> Incluso na chegada!</p>
          </div>
          <div style="background: #e6a33e; color: white; padding: 15px; border-radius: 10px; text-align: center;">
            <p style="margin: 0; font-size: 18px;"><strong>Nos vemos no Everest! 🏔️</strong></p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Em caso de dúvidas, entre em contato pelo telefone informado no site do evento.
          </p>
        </div>
      `;

  const send = async (to: string[], subject: string, html: string) => {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromAddress, to, subject, html }),
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(t);
    }
    return r.json();
  };

  try {
    const organizer = process.env.RESEND_ORGANIZER_EMAIL || "corridaparaoeverest@gmail.com";
    await send([organizer], `Nova Inscrição - Corrida para o Everest: ${nome}`, organizerHtml);
    let participantEmailSkipped = false;
    if (!testMode) {
      try {
        await send([email], "Inscrição Confirmada - Corrida para o Everest 🏃", participantHtml);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("validation_error") || msg.includes("\"statusCode\":403")) {
          participantEmailSkipped = true;
        } else {
          throw e;
        }
      }
    }
    res.status(200).json({ success: true, message: "Inscrição enviada com sucesso!", participant_email_skipped: participantEmailSkipped });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao enviar";
    res.status(500).json({ error: msg });
  }
}
