import { useState } from "react";
import BackButton from "../../components/common/BackButton";
import { EmailService } from "../../services/emailService";

const FOTO_CAMPOS = [
  { key: "cabineFrente", label: "Cabine de frente" },
  { key: "lateralMotorista", label: "Lateral motorista" },
  { key: "lateralPassageiro", label: "Lateral passageiro" },
  { key: "traseira", label: "Foto traseira" },
  { key: "painel", label: "Foto do painel" },
  { key: "bancosMotorista", label: "Foto dos bancos pela porta do motorista" },
  { key: "motor", label: "Capô aberto - Mostrando o motor" },
  { key: "crlv", label: "Foto do CRLV" },
];

export default function CompramosSeuBatido() {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    email: "", // opcional
    marca: "",
    modelo: "",
    anoModelo: "",
  });

  const [fotos, setFotos] = useState(
    FOTO_CAMPOS.reduce((acc, f) => ({ ...acc, [f.key]: null }), {})
  );

  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleFile(key, file) {
    setFotos((s) => ({ ...s, [key]: file || null }));
  }

  function emailValido(s) {
    if (!s) return true; // como é opcional, só valida se existir
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);

    const obrig = ["nome", "cpf", "telefone", "marca", "modelo", "anoModelo"];
    for (const k of obrig) {
      if (!form[k]?.trim()) {
        setFeedback({ type: "error", msg: `Preencha o campo: ${k}` });
        return;
      }
    }
    if (!emailValido(form.email)) {
      setFeedback({ type: "error", msg: "E-mail inválido" });
      return;
    }

    // monta o JSON "dados" (só inclui email se tiver)
    const dados = {
      nome: form.nome,
      cpf: form.cpf,
      telefone: form.telefone,
      marca: form.marca,
      modelo: form.modelo,
      anoModelo: form.anoModelo,
    };
    if (form.email) dados.email = form.email;

    const formData = new FormData();
    formData.append(
      "dados",
      new Blob([JSON.stringify(dados)], { type: "application/json" })
    );

    // adiciona apenas os arquivos preenchidos
    Object.entries(fotos).forEach(([key, file]) => {
      if (file) formData.append("fotos", file, sugestaoNomeArquivo(key, file));
    });

    try {
      setSending(true);
      await EmailService.enviarCompramosSeuBatido(formData);
      setFeedback({
        type: "success",
        msg: "Solicitação enviada com sucesso! Em breve entraremos em contato.",
      });
      // reset
      setForm({
        nome: "",
        cpf: "",
        telefone: "",
        email: "",
        marca: "",
        modelo: "",
        anoModelo: "",
      });
      setFotos(FOTO_CAMPOS.reduce((acc, f) => ({ ...acc, [f.key]: null }), {}));
      (e.target?.reset?.())?.(); // limpa inputs de arquivo
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Compramos seu batido
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Envie seus dados e as fotos do caminhão. Você receberá uma proposta
            por nossos canais de contato.
          </p>
        </header>

        {/* coluna única: formulário e, abaixo, fotos */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Dados */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Seus dados</h2>

            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Nome"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
              />
              <Input
                label="CPF"
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                required
              />
              <Input
                label="Telefone"
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                required
              />
              <Input
                type="email"
                label="E-mail (opcional)"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ex: nome@dominio.com"
              />
              <Input
                label="Marca"
                name="marca"
                value={form.marca}
                onChange={handleChange}
                required
              />
              <Input
                label="Modelo"
                name="modelo"
                value={form.modelo}
                onChange={handleChange}
                required
              />
              <Input
                label="Ano-Modelo"
                name="anoModelo"
                value={form.anoModelo}
                onChange={handleChange}
                placeholder="Ex.: 2015/2016"
                required
              />
            </div>
          </div>

          {/* Fotos (abaixo do formulário) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Anexar fotos</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {FOTO_CAMPOS.map((f) => (
                <FileInput
                  key={f.key}
                  label={f.label}
                  onChange={(file) => handleFile(f.key, file)}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Formatos aceitos: JPG, PNG, HEIC. Tamanho total recomendado &lt; 25MB.
            </p>
          </div>

          {/* Feedback */}
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

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center rounded-xl bg-brandNavy px-5 py-2.5 text-white hover:opacity-90 disabled:opacity-60"
            >
              {sending ? "Enviando..." : "Enviar proposta"}
            </button>
            <p className="text-xs text-gray-500">
              Tamanho máximo por envio ~25MB (limite do provedor).
            </p>
          </div>
        </form>
      </section>
    </>
  );
}

/* -------------------- UI helpers -------------------- */

function Input({ label, type = "text", ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      <input
        type={type}
        {...props}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brandNavy/40"
      />
    </label>
  );
}

function FileInput({ label, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </span>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium"
      />
    </label>
  );
}

// nomes de arquivos amigáveis ao anexar (só estética)
function sugestaoNomeArquivo(key, file) {
  const map = {
    cabineFrente: "cabine-frente",
    lateralMotorista: "lateral-motorista",
    lateralPassageiro: "lateral-passageiro",
    traseira: "traseira",
    painel: "painel",
    bancosMotorista: "bancos-motorista",
    motor: "motor",
    crlv: "crlv",
  };
  const ext = (file?.name?.split(".").pop() || "jpg").toLowerCase();
  return `${map[key] || key}.${ext}`;
}
