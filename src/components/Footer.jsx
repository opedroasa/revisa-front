import { useSettings } from "../context/SettingsContext";

// mantém a mesma mensagem usada no resto do site
const MSG = "Olá! Vim pelo site e gostaria de mais informações.";

// normaliza para wa.me (apenas dígitos, com DDI)
const normalizePhone = (s) => String(s || "").replace(/\D/g, "");

export default function Footer() {
  const settingsCtx = useSettings();
  const settings = settingsCtx?.settings;

  // fonte da verdade: site_settings -> fallback .env
  const phone =
    normalizePhone(settings?.whatsappPhone) ||
    normalizePhone(process.env.REACT_APP_WHATSAPP_PHONE);

  const waLink = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(MSG)}`
    : null;

  return (
    <footer className="mt-10">
      <div className="bg-brandNavy text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-3 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-white ring-2 ring-white/70 shadow flex items-center justify-center mx-auto">
            <img
                src="/brand-logo.png"
                alt="Revisa Caminhões"
                className="h-[100%] w-auto object-contain"
            />
            </div>
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-white text-brandNavy px-4 py-2 font-medium hover:opacity-90 mx-auto"
              >
                <img src="/whatsapp.png" alt="" className="h-5 w-5" />
                WhatsApp
              </a>
            ) : (
              <span className="text-xs opacity-70">WhatsApp indisponível</span>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-2">Endereço</h4>
            <p className="text-sm">Rua Exemplo, 123 – Bairro</p>
            <p className="text-sm">Cidade/UF – CEP 00000-000</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Telefone</h4>
            <p className="text-sm">(00) 00000-0000</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">E-mail</h4>
            <a className="text-sm underline" href="mailto:contato@revisa.com.br">
              contato@revisa.com.br
            </a>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 text-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 text-xs text-center">
          Copyright {new Date().getFullYear()} © Revisa Caminhões – CNPJ: 00.000.000/0001-00
        </div>
      </div>
    </footer>
  );
}
