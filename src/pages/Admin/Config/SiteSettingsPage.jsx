import { useEffect, useState } from "react";
import { SiteSettingsService } from "../../../services/siteSettingsService";
import { toast } from "react-hot-toast";
import { useSettings } from "../../../context/SettingsContext";

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    whatsappPhone: "",
    aboutHtml: "",
  });

  // 👇 pega setSettings/refresh do contexto para refletir na hora
  const { setSettings, refresh } = useSettings() || {};

  useEffect(() => {
    (async () => {
      try {
        const { data } = await SiteSettingsService.getAdmin();
        setForm({
          whatsappPhone: data?.whatsappPhone ?? "",
          aboutHtml: data?.aboutHtml ?? "",
        });
      } catch (e) {
        console.error(e);
        toast.error("Falha ao carregar configurações.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function sanitizePhone(p) {
    return String(p || "").replace(/\D/g, "");
  }

  async function salvar() {
    const phone = sanitizePhone(form.whatsappPhone);
    if (!phone) {
      toast.error("Informe um número de WhatsApp.");
      return;
    }

    setSaving(true);
    try {
      await SiteSettingsService.update({
        whatsappPhone: phone,
        aboutHtml: form.aboutHtml || "",
      });

      // ✅ Reflete imediatamente no contexto (efeito instantâneo no botão do WhatsApp etc.)
      if (setSettings) {
        setSettings((prev) => ({
          ...(prev || {}),
          whatsappPhone: phone,
          aboutHtml: form.aboutHtml || "",
          updatedAt: new Date().toISOString(),
        }));
      }

      // (opcional) busca do backend pra garantir consistência
      if (refresh) {
        // não precisa await; pode ser em background
        refresh();
      }

      toast.success("Configurações atualizadas.");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Configurações do site</h2>
        <p className="text-sm text-gray-600">
          Defina o WhatsApp e o conteúdo da página “Sobre nós”.
        </p>
      </div>

      <div className="space-y-5 rounded-xl border bg-white p-4">
        <div>
          <label className="text-sm font-medium">WhatsApp (apenas números)</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="5534999999999"
            value={form.whatsappPhone}
            onChange={(e) => setField("whatsappPhone", e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">
            Ex.: 55 + DDD + número (somente dígitos). Será usado no botão “Falar no WhatsApp”.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Sobre nós (HTML opcional)</label>
          <textarea
            rows={10}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Conte a história da empresa. Pode usar HTML simples."
            value={form.aboutHtml}
            onChange={(e) => setField("aboutHtml", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={salvar}
            disabled={saving}
            className="rounded-md bg-[#0D3A53] px-4 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
