import { useEffect, useState } from "react";
import Button from "../../components/Button";

export default function MarcaForm({ initialData, onSubmit, submitting, serverError }) {
  const [nome, setNome] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    setNome(initialData?.nome || "");
    setErr("");
  }, [initialData]);

  function validate() {
    const n = nome.trim();
    if (!n) return "Nome é obrigatório.";
    if (n.length > 120) return "Nome muito longo (máx. 120 caracteres).";
    return "";
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErr(v); return; }
    setErr("");
    onSubmit({ nome: nome.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </div>
      ) : null}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Nome da marca</span>
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brandNavy"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Scania, Volvo, Mercedes..."
          maxLength={120}
          required
        />
        {err ? <span className="mt-1 block text-xs text-red-600">{err}</span> : null}
      </label>

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
