// src/pages/Store/FaleConosco.jsx
import { useMemo, useState } from "react";
import BackButton from "../../components/common/BackButton";
import { EmailService } from "../../services/emailService";

// Os values PRECISAM bater com o enum do back (MotivoContato)
const MOTIVO_OPTIONS = [
  { value: "ORCAMENTO", label: "Orçamento de peças" },
  { value: "DISPONIBILIDADE", label: "Disponibilidade/compatibilidade" },
  { value: "PAGAMENTO_FRETE", label: "Pagamento, frete e prazos" },
  { value: "GARANTIA_POS_VENDA", label: "Pós-venda / garantia" },
  { value: "DEVOLUCAO_TROCA", label: "Troca / Devolução" },
  { value: "PARCERIA", label: "Parcerias comerciais" },
  { value: "RECLAMACAO", label: "Reclamação" },
  { value: "OUTRO", label: "Outro" },
];

const LIMITE = 1500;

export default function FaleConosco() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    motivo: "",
    mensagem: "",
  });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const restante = useMemo(
    () => Math.max(0, LIMITE - (form.mensagem?.length || 0)),
    [form.mensagem]
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function emailValido(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s || "");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);

    if (!form.nome.trim()) return setFeedback({ type: "error", msg: "Preencha o campo: nome" });
    if (!emailValido(form.email)) return setFeedback({ type: "error", msg: "E-mail inválido" });
    if (!form.motivo) return setFeedback({ type: "error", msg: "Selecione o motivo" });
    if (!form.mensagem.trim()) return setFeedback({ type: "error", msg: "Digite a mensagem" });
    if (form.mensagem.length > LIMITE)
      return setFeedback({ type: "error", msg: `Mensagem acima de ${LIMITE} caracteres` });

    try {
      setSending(true);
      await EmailService.enviarFaleConosco({
        nome: form.nome,
        email: form.email,
        motivo: form.motivo, // enum string
        mensagem: form.mensagem,
      });
      setFeedback({ type: "success", msg: "Mensagem enviada com sucesso! Responderemos em breve." });
      setForm({ nome: "", email: "", motivo: "", mensagem: "" });
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.mensagem ||
        "Falha ao enviar. Tente novamente.";
      setFeedback({ type: "error", msg });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Mobile: barra fixa no topo */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 md:hidden">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <BackButton defaultPath="/" />
        </div>
      </div>

      <section className="max-w-6xl mx-auto p-4">
        <BackButton className="mb-4 hidden md:inline-flex" defaultPath="/" />

        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Fale Conosco</h1>
          <p className="mt-2 text-sm text-gray-600">
            Preencha o formulário e entraremos em contato.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Nome"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
              />
              <Input
                type="email"
                label="E-mail para contato"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ex: nome@dominio.com"
                required
              />

              <Select
                label="Motivo"
                name="motivo"
                value={form.motivo}
                onChange={handleChange}
                options={MOTIVO_OPTIONS}
                required
              />

              <TextArea
                className="md:col-span-2"
                label={`Mensagem (${restante} caracteres restantes)`}
                name="mensagem"
                value={form.mensagem}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    mensagem: e.target.value.slice(0, LIMITE),
                  }))
                }
                rows={6}
                required
              />
            </div>
          </div>

          {feedback && (
            <div
              className={`rounded-xl p-4 text-sm ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {feedback.msg}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center rounded-xl bg-brandNavy px-5 py-2.5 text-white hover:opacity-90 disabled:opacity-60"
          >
            {sending ? "Enviando..." : "Enviar mensagem"}
          </button>
        </form>
      </section>
    </>
  );
}

/* ---------- UI helpers ---------- */
function Input({ label, type = "text", ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        {...props}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brandNavy/40"
      />
    </label>
  );
}

function Select({ label, options, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <select
        {...props}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brandNavy/40 bg-white"
      >
        <option value="">Selecione…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({ label, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <textarea
        {...props}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brandNavy/40"
      />
    </label>
  );
}
