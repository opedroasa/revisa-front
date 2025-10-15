import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import { ProdutosService } from "../../../services/produtosService";
import { ProdutoFotosService as FotosService } from "../../../services/produtoFotosService";
import Button from "../../../components/Button";

export default function FotosAdmin() {
  const { id } = useParams(); // produtoId
  const nav = useNavigate();

  const [produto, setProduto] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [file, setFile] = useState(null);

  // estados novos
  const [isUploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const carregar = useCallback(async () => {
    try {
      const p = await ProdutosService.buscar(id);
      setProduto(p.data);

      const f = await FotosService.listar(id).catch(() => ({ data: [] }));
      setFotos(f.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Falha ao carregar fotos do produto");
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function onSelect(e) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setProgress(0);
  }

  async function enviar() {
    if (!file || isUploading) return; // trava duplo clique
    try {
      setUploading(true);
      setProgress(0);
      await FotosService.upload(id, file, setProgress);
      toast.success("Foto enviada");

      // limpa input para permitir re-escolher o mesmo arquivo
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      await carregar(); // atualiza galeria
    } catch (e) {
      console.error(e);
      toast.error("Falha no upload");
    } finally {
      setUploading(false);
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

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">
          Fotos — {produto?.nome || `#${id}`}
        </h2>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onSelect}
            disabled={isUploading}
            className="block w-64 text-sm disabled:opacity-60
                       file:mr-3 file:rounded-md file:border-0
                       file:bg-[#0D3A53] file:px-3 file:py-2 file:text-white
                       file:disabled:opacity-70"
          />

          <Button onClick={enviar} disabled={!file || isUploading}>
            {isUploading ? `Enviando ${progress || 0}%` : "Upload"}
          </Button>

          <Button
            className="inline-flex items-center gap-1 rounded-md border !border-[#0D3A53]/30 !bg-white px-2 py-1 text-xs font-medium !text-[#0D3A53] hover:!bg-[#0D3A53]/5"
            onClick={() => nav("/admin/produtos")}
            disabled={isUploading}
          >
            Voltar
          </Button>
        </div>
      </div>

      {/* Barra de progresso */}
      {isUploading && (
        <div className="mb-3 w-full max-w-xs h-2 bg-gray-200 rounded">
          <div
            className="h-2 bg-[#0D3A53] rounded transition-[width] duration-150"
            style={{ width: `${progress || 1}%` }}
          />
        </div>
      )}

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
                <img src={f.url} alt="" className="h-full w-full object-contain" />
              ) : (
                <span className="text-sm text-gray-500">Imagem indisponível</span>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <Button
                className="inline-flex items-center gap-1 rounded-md border !border-[#0D3A53]/30 !bg-white px-2 py-1 text-xs font-medium !text-[#0D3A53] hover:!bg-[#0D3A53]/5"
                onClick={() => definirDestaque(f.id)}
                disabled={isUploading}
              >
                {f.destaque ? "Destaque ✓" : "Definir destaque"}
              </Button>

              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => excluir(f.id)}
                disabled={isUploading}
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
