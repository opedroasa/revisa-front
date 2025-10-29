import { useEffect, useState } from "react";

export default function UsuarioForm({ initialData, onSubmit, submitting, serverError }) {
  const isEdit = Boolean(initialData?.id);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (initialData) {
      setForm({ email: initialData.email || "", password: "" });
    }
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function submit(e) {
    e.preventDefault();
    const payload = isEdit
      ? { email: form.email.trim() }                           // edição: só e-mail
      : { email: form.email.trim(), password: form.password, role: "ADMIN" }; // criação: sempre ADMIN
    onSubmit(payload);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {serverError && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{serverError}</div>
      )}

      <label className="text-sm font-medium">
        E-mail
        <input
          name="email" type="email" required
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          value={form.email} onChange={handleChange}
        />
      </label>

      {!isEdit && (
        <label className="text-sm font-medium">
          Senha
          <input
            name="password" type="password" required minLength={6}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.password} onChange={handleChange}
          />
        </label>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit" disabled={submitting}
          className="rounded-md bg-[#0D3A53] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Salvando..." : (isEdit ? "Salvar" : "Criar")}
        </button>
      </div>
    </form>
  );
}
