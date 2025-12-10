// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationRequest {
  nome: string;
  email: string;
  telefone: string;
  quer_camisa: boolean;
  tamanho_camisa?: string;
}

async function sendEmail(to: string[], subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Corrida para o Everest <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
}

serve(async (req: Request): Promise<Response> => {
  console.log("Received registration request");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: "RESEND_API_KEY não configurada" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { nome, email, telefone, quer_camisa, tamanho_camisa }: RegistrationRequest = await req.json();
    
    console.log("Processing registration for:", nome, email);

    // Build shirt info text
    const camisaInfo = quer_camisa 
      ? `<p><strong>Camisa do evento:</strong> Sim - Tamanho ${tamanho_camisa}</p>` 
      : `<p><strong>Camisa do evento:</strong> Não</p>`;

    // Send email to organizer
    const emailToOrganizer = await sendEmail(
      ["luizcarlostostes@gmail.com"],
      `Nova Inscrição - Corrida para o Everest: ${nome}`,
      `
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
      `
    );

    console.log("Email sent to organizer:", emailToOrganizer);

    // Send confirmation email to participant
    const emailToParticipant = await sendEmail(
      [email],
      "Inscrição Confirmada - Corrida para o Everest 🏃",
      `
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
      `
    );

    console.log("Confirmation email sent to participant:", emailToParticipant);

    return new Response(JSON.stringify({ success: true, message: "Inscrição enviada com sucesso!" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    console.error("Error in send-registration-email function:", message);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
