import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Shirt, CheckCircle } from "lucide-react";

const RegistrationForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    tamanho_camisa: "",
    quer_camisa: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nome.trim() || !formData.email.trim() || !formData.telefone.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (formData.quer_camisa && !formData.tamanho_camisa) {
      toast({
        title: "Tamanho da camisa",
        description: "Por favor, selecione o tamanho da camisa.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const env = import.meta.env as { VITE_API_BASE_URL?: string; DEV?: boolean };
      const base = env.VITE_API_BASE_URL ? env.VITE_API_BASE_URL.replace(/\/$/, "") : "";
      const endpoint = `${base}/api/send-registration-email`;
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome.trim(),
          email: formData.email.trim(),
          telefone: formData.telefone.trim(),
          quer_camisa: formData.quer_camisa,
          tamanho_camisa: formData.tamanho_camisa || undefined,
        }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        if (env.DEV) {
          console.warn("API indisponível em dev; simulando sucesso:", text);
        } else {
          throw new Error(text || "Falha ao enviar inscrição");
        }
      }

      toast({
        title: "Inscrição realizada! 🎉",
        description: "Você receberá um e-mail de confirmação em breve.",
      });

      try {
        const base = env.VITE_API_BASE_URL ? env.VITE_API_BASE_URL.replace(/\/$/, "") : "";
        const appendEndpoint = `${base}/api/append-athlete`;
        const r = await fetch(appendEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: formData.nome.trim() }),
        });
        if (!r.ok) {
          const t = await r.text();
          if (env.DEV) {
            console.warn("Append TSV indisponível em dev; seguindo fluxo:", t);
          } else {
            console.warn("Falha ao gravar TSV:", t);
          }
        }
      } catch (e) {
        console.warn("Erro ao chamar append TSV:", e);
      }
      
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        tamanho_camisa: "",
        quer_camisa: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro ao enviar inscrição:", message);
      toast({
        title: "Erro ao enviar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="inscricao" className="py-20 bg-background">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display text-foreground mb-4">
              Faça sua <span className="text-secondary">Inscrição</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Garanta sua vaga na Corrida para o Everest - 26/12/2025
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="card-glass rounded-2xl p-8 border border-border/50">
            <div className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome" className="flex items-center gap-2 text-foreground">
                  <User className="w-4 h-4" />
                  Nome Completo *
                </Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  className="h-12"
                  maxLength={100}
                />
              </div>
              
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
                  <Mail className="w-4 h-4" />
                  E-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12"
                  maxLength={255}
                />
              </div>
              
              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="telefone" className="flex items-center gap-2 text-foreground">
                  <Phone className="w-4 h-4" />
                  Telefone / WhatsApp *
                </Label>
                <Input
                  id="telefone"
                  type="tel"
                  placeholder="(22) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  required
                  className="h-12"
                  maxLength={20}
                />
              </div>
              
              {/* Camisa */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="quer_camisa"
                    checked={formData.quer_camisa}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, quer_camisa: checked as boolean })
                    }
                  />
                  <Label 
                    htmlFor="quer_camisa" 
                    className="flex items-center gap-2 cursor-pointer text-foreground"
                  >
                    <Shirt className="w-4 h-4 text-secondary" />
                    Quero a camisa do evento
                  </Label>
                </div>
                
                {formData.quer_camisa && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="tamanho" className="text-foreground">Tamanho da Camisa *</Label>
                    <Select
                      value={formData.tamanho_camisa}
                      onValueChange={(value) => setFormData({ ...formData, tamanho_camisa: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione o tamanho" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PP">PP</SelectItem>
                        <SelectItem value="P">P</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                        <SelectItem value="GG">GG</SelectItem>
                        <SelectItem value="XGG">XGG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              {/* Submit */}
              <Button 
                type="submit" 
                variant="hero" 
                size="xl" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Confirmar Inscrição
                  </span>
                )}
              </Button>
            </div>
          </form>
          
          {/* Note */}
          <p className="text-center text-muted-foreground text-sm mt-6">
            Ao se inscrever, você receberá um e-mail de confirmação com os detalhes do evento.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RegistrationForm;
