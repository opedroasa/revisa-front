import { useMemo } from "react";
import { useSettings } from "../../context/SettingsContext";

/**
 * Botão flutuante do WhatsApp.
 * - Lê o telefone do SettingsContext (e cai para REACT_APP_WHATSAPP_PHONE, se existir)
 * - Some se não houver telefone configurado
 * - Fica fixo no canto inferior direito
 */
export default function FloatingWhatsApp({ text, className = "" }) {
  const settings = useSettings()?.settings;

  // Sem import.meta para evitar o warning do webpack
  const phone = useMemo(() => {
    const raw =
      settings?.whatsappPhone ??
      process.env.REACT_APP_WHATSAPP_PHONE ??
      "";
    return String(raw).replace(/\D/g, "");
  }, [settings]);

  if (!phone) return null;

  const message =
    text ?? "Olá! Vim pelo site e gostaria de tirar uma dúvida.";
  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noreferrer"
      aria-label="Chamar no WhatsApp"
      className={
        "fixed bottom-4 right-4 z-50 inline-flex items-center justify-center " +
        "rounded-full shadow-lg bg-[#25D366] text-white w-14 h-14 md:w-16 md:h-16 " +
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0D3A53] " +
        "hover:opacity-95 " +
        className
      }
    >
      <img
        src="/whatsapp.png"
        alt="WhatsApp"
        className="w-7 h-7 md:w-8 md:h-8"
        loading="lazy"
      />
      <span className="sr-only">WhatsApp</span>
    </a>
  );
}
