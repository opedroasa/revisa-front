import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProductsList from "../pages/Store/ProductsList";
import ProductDetails from "../pages/Store/ProductDetails";
import MarcasList from "../pages/Marcas/MarcasList";
import ModelosList from "../pages/Modelos/ModelosList";
import ChangePasswordDialog from "../components/ChangePasswordDialog";

import SettingsProvider from "../context/SettingsContext";

import About from "../pages/Store/About";
import SiteSettingsPage from "../pages/Admin/Config/SiteSettingsPage.jsx";

import { useState } from "react";
import LoginDialog from "../components/LoginDialog";
import { useAuth } from "../context/AuthContext";

import ProdutosAdminList from "../pages/Admin/Produtos/ProdutosAdminList";
import ProdutoAdminForm from "../pages/Admin/Produtos/ProdutoAdminForm";
import FotosAdmin from "../pages/Admin/Produtos/FotosAdmin";

function Guard({ children }) {
  const { isAuth } = useAuth();
  if (!isAuth) return <div className="p-6">Acesso restrito. Faça login.</div>;
  return children;
}

export default function AppRoutes() {
  const { isAuth, logout } = useAuth();
  const [openLogin, setOpenLogin] = useState(false);
  const [openChangePwd, setOpenChangePwd] = useState(false);

  return (
    <BrowserRouter>
      {/* NAV */}
      <nav className="px-4 py-3 border-b bg-white text-brandNavy">
        <div className="mx-auto max-w-7xl flex items-center gap-3">
          <img src="/brand-logo.png" alt="Revisa Caminhões" className="h-8" />

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="hover:opacity-80">Home</Link>
            <Link to="/sobre" className="hover:opacity-80">Sobre</Link>
            {isAuth && (
              <>
                <Link to="/admin/produtos" className="hover:opacity-80">Produtos</Link>
                <Link to="/admin/modelos" className="hover:opacity-80">Modelos</Link>
                <Link to="/admin/marcas" className="hover:opacity-80">Marcas</Link>
                <Link to="/admin/config" className="hover:opacity-80">Configurações</Link>

              </>
            )}
          </div>

          {/* empurra para a direita */}
          <div className="flex-1" />

          {/* Ações desktop */}
          <div className="hidden md:flex items-center gap-2">
            {isAuth ? (
              <>
                <button
                  onClick={() => setOpenChangePwd(true)}
                  className="rounded-md border border-brandNavy/30 px-3 py-1.5 text-sm hover:bg-brandNavy hover:text-white"
                >
                  Alterar senha
                </button>
                <button
                  onClick={logout}
                  className="rounded-md border border-brandNavy/30 px-3 py-1.5 text-sm hover:bg-brandNavy hover:text-white"
                >
                  Sair
                </button>
              </>
            ) : (
              <button
                onClick={() => setOpenLogin(true)}
                className="rounded-md bg-brandNavy text-white px-3 py-1.5 text-sm hover:opacity-90"
              >
                Entrar
              </button>
            )}
          </div>

          {/* Mobile: hambúrguer + painel */}
          <MobileMenu
            isAuth={isAuth}
            onOpenLogin={() => setOpenLogin(true)}
            onOpenChangePwd={() => setOpenChangePwd(true)}
            onLogout={logout}
          />
        </div>
      </nav>

      {/* CONTEÚDO */}
      <div className="p-6">
        <Routes>
          {/* Público */}
          <Route path="/" element={<ProductsList />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/peca/:id" element={<ProductDetails />} />

          {/* Admin */}
          <Route path="/admin/marcas" element={<Guard><MarcasList /></Guard>} />
          <Route path="/admin/modelos" element={<Guard><ModelosList/></Guard>} />
          <Route path="/admin/produtos" element={<Guard><ProdutosAdminList /></Guard>} />
          <Route path="/admin/produtos/novo" element={<Guard><ProdutoAdminForm mode="create" /></Guard>} />
          <Route path="/admin/produtos/:id/editar" element={<Guard><ProdutoAdminForm mode="edit" /></Guard>} />
          <Route path="/admin/produtos/:id/fotos" element={<Guard><FotosAdmin /></Guard>} />
          <Route path="/admin/config" element={<Guard><SiteSettingsPage /></Guard>
  }
/>
        </Routes>
      </div>

      {/* Modais */}
      <LoginDialog open={openLogin} onClose={() => setOpenLogin(false)} />
      <ChangePasswordDialog
        open={openChangePwd}
        onClose={() => setOpenChangePwd(false)}
      />
    </BrowserRouter>
  );
}

/* ----------------- COMPONENTE DO MENU MOBILE ----------------- */
function MobileMenu({ isAuth, onOpenLogin, onOpenChangePwd, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border px-3 py-1.5 text-sm"
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        {open ? "Fechar" : "Menu"}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute left-0 right-0 top-[56px] z-40 border-b bg-white shadow-sm"
        >
          <div className="mx-auto max-w-7xl p-3 space-y-2 text-sm">
            <Link onClick={() => setOpen(false)} to="/" className="block px-2 py-2 rounded hover:bg-gray-50">
              Home
            </Link>
             <Link onClick={() => setOpen(false)} to="/" className="block px-2 py-2 rounded hover:bg-gray-50">
              Sobre
            </Link>

            {isAuth && (
              <>
                <Link onClick={() => setOpen(false)} to="/admin/produtos" className="block px-2 py-2 rounded hover:bg-gray-50">
                  Produtos
                </Link>
                <Link onClick={() => setOpen(false)} to="/admin/modelos" className="block px-2 py-2 rounded hover:bg-gray-50">
                  Modelos
                </Link>
                <Link onClick={() => setOpen(false)} to="/admin/marcas" className="block px-2 py-2 rounded hover:bg-gray-50">
                  Marcas
                </Link>
                <div className="h-px bg-gray-200 my-2" />
                <button
                  onClick={() => { setOpen(false); onOpenChangePwd(); }}
                  className="w-full text-left px-2 py-2 rounded hover:bg-gray-50"
                >
                  Alterar senha
                </button>
                <button
                  onClick={() => { setOpen(false); onLogout(); }}
                  className="w-full text-left px-2 py-2 rounded hover:bg-gray-50"
                >
                  Sair
                </button>
              </>
            )}

            {!isAuth && (
              <button
                onClick={() => { setOpen(false); onOpenLogin(); }}
                className="w-full text-left px-2 py-2 rounded bg-brandNavy text-white"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
