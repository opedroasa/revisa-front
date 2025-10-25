import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Menu hambúrguer com os atalhos de Administração.
 * Mostra um botão (ícone ☰) e abre um dropdown com os links.
 * Fechamento por clique fora e por tecla ESC.
 */
export default function AdminMenu({ className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { pathname } = useLocation();

  // Itens do menu (ajuste as rotas se for diferente no seu app)
  const items = useMemo(
    () => [
      { to: "/admin/produtos",  label: "Produtos" },
      { to: "/admin/modelos",   label: "Modelos"  },
      { to: "/admin/marcas",    label: "Marcas"   },
      { to: "/admin/usuarios",  label: "Usuários" }, // << NOVO
      { to: "/admin/config/",   label: "Configurações" },
    ],
    []
  );

  // Fecha ao clicar fora
  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Fecha ao trocar de rota
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 rounded-md px-3 py-2 bg-white text-brandNavy shadow-sm
                   hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brandNavy"
        title="Administração"
      >
        {/* Ícone “hamburger” */}
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="hidden sm:inline">Admin</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl z-50"
        >
          <ul className="py-1">
            {items.map(it => (
              <li key={it.to}>
                <Link
                  to={it.to}
                  className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
