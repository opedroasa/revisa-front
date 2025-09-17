import { useEffect, useState } from "react";
import Button from "../../components/Button";

export default function MarcaForm({ initialData, onSubmit, submitting }) {
  const [nome, setNome] = useState("");

  useEffect(() => {
    setNome(initialData?.nome || "");
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ nome });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Nome</span>
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </label>

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
