import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import { ProdutosService } from "../../../services/produtosService";
// Se o arquivo for plural, troque para '../../../services/produtosFotosService'
import { ProdutoFotosService as FotosService } from "../../../services/produtoFotosService";

import Button from "../../../components/Button";

export default function FotosAdmin() {
  const { id } = useParams(); // produtoId
  const nav = useNavigate();

  const [produto, setProduto] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const p = await ProdutosService.buscar(id);
      setProduto(p.data);

      const f = await FotosService.listar(id).catch(() => ({ data: [] }));
      setFotos(f.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Falha ao carregar fotos do produto");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function enviar() {
    if (!file) return;
    try {
      await FotosService.upload(id, file);
      toast.success("Foto enviada");
      setFile(null);
      await carregar();
    } catch (e) {
      console.error(e);
      toast.error("Falha no upload");
    }
  }

  async function definirDestaque(fotoId) {
    try {
      await FotosService.destacar(id, fotoId);
      toast.success("Destaque definido");
      await carregar();
    } catch (e) {
      console.error(e);
      toast.error("Falha ao definir destaque");
    }
  }

  async function excluir(fotoId) {
    if (!window.confirm("Excluir esta foto?")) return;
    try {
      await FotosService.excluir(fotoId);
      toast.success("Excluída");
      await carregar();
    } catch (e) {
      console.error(e);
      toast.error("Falha ao excluir");
    }
  }

  if (loading) return <p className="p-6">Carregando...</p>;

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">
          Fotos — {produto?.nome || `#${id}`}
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-64 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#0D3A53] file:px-3 file:py-2 file:text-white"
          />
          <Button onClick={enviar} disabled={!file}>
            Upload
          </Button>
          <Button
            className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
            onClick={() => nav("/admin/produtos")}
          >
            Voltar
          </Button>
        </div>
      </div>

      {fotos.length === 0 && (
        <p className="text-gray-500">Nenhuma foto enviada.</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {fotos.map((f) => (
          <div
            key={f.id}
            className={
              "rounded-xl border p-2 " +
              (f.destaque ? "ring-2 ring-[#0D3A53]" : "")
            }
          >
            <div className="aspect-[4/3] rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center">
              {f.url ? (
                <img
                  src={f.url}
                  alt=""
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-sm text-gray-500">
                  Imagem indisponível
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <Button
                className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
                onClick={() => definirDestaque(f.id)}
              >
                {f.destaque ? "Destaque ✓" : "Definir destaque"}
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => excluir(f.id)}
              >
                Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
