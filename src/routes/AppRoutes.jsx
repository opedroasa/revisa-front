import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProductsList from "../pages/Store/ProductsList";
import ProductDetails from "../pages/Store/ProductDetails";
import MarcasList from "../pages/Marcas/MarcasList";
import ModelosList from "../pages/Modelos/ModelosList";
import ChangePasswordDialog from "../components/ChangePasswordDialog";
import Footer from "../components/Footer";
import FloatingWhatsApp from "../components/common/FloatingWhatsApp";

import AdminMenu from "../components/admin/AdminMenu";



import Localizacao from "../pages/Store/Localizacao";
import CompramosSeuBatido from "../pages/Store/CompramosSeuBatido";
import FaleConosco from "../pages/Store/FaleConosco";
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
      <header className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4">
          {/* Linha 1: Brand bar */}
          <div className="relative flex items-center justify-between py-1">
            {/* Logo + texto mobile */}
            <div className="flex items-center gap-3">
              {/* Logo maior no desktop */}
              <img src="/brand-logo.png" alt="Revisa Caminhões" className="h-14 md:h-30 lg:h-44" />
              {/* No mobile, texto curto ao lado da logo */}
              <span className="md:hidden text-xs font-semibold text-brandNavy">
                REVISA CAMINHÕES
              </span>
            </div>

            {/* Headline no desktop (mais bold e maior) */}
          <div className="hidden md:block md:text-4xl lg:text-4xl font-extrabold tracking-wide text-brandInk leading-tight">
            REVISA CAMINHÕES – PEÇAS E SERVIÇOS
          </div>

            {/* Ações (login/sair) no desktop */}
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

            {/* Mobile menu (hambúrguer) */}
            <MobileMenu
              isAuth={isAuth}
              onOpenLogin={() => setOpenLogin(true)}
              onOpenChangePwd={() => setOpenChangePwd(true)}
              onLogout={logout}
            />
          </div>

          {/* Linha 2: Navbar (desktop) — faixa azul com links brancos e hover invertendo */}
          <nav className="hidden md:flex items-center gap-2 py-2 bg-brandNavy rounded-md mb-2">
            <Link to="/" className="px-4 py-2 rounded-md text-white hover:bg-white hover:text-brandNavy transition">
              Home
            </Link>
            <Link to="/sobre" className="px-4 py-2 rounded-md text-white hover:bg-white hover:text-brandNavy transition">
              Sobre nós
            </Link>
            <Link to="/localizacao" className="px-4 py-2 rounded-md text-white hover:bg-white hover:text-brandNavy transition">
              Localização
            </Link>
            <Link to="/compramos-seu-batido" className="px-4 py-2 rounded-md text-white hover:bg-white hover:text-brandNavy transition">
              Compramos seu batido
            </Link>
            <Link to="/fale-conosco" className="px-4 py-2 rounded-md text-white hover:bg-white hover:text-brandNavy transition">
              Fale conosco
            </Link>

            {isAuth && (
              <>
                <span className="flex-1" />
                <div className="relative ml-auto mr-3">
                <AdminMenu />
              </div>
              </>
            )}
          </nav>
        </div>
      </header>


      {/* CONTEÚDO */}
      <div className="p-0">
        <Routes>
          {/* Público */}
          <Route path="/" element={<ProductsList />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/localizacao" element={<Localizacao />} />
          <Route path="/compramos-seu-batido" element={<CompramosSeuBatido />} />
          <Route path="/fale-conosco" element={<FaleConosco />} />
          <Route path="/peca/:id" element={<ProductDetails />} />

          {/* Admin */}
          <Route path="/admin/marcas" element={<Guard><MarcasList /></Guard>} />
          <Route path="/admin/modelos" element={<Guard><ModelosList/></Guard>} />
          <Route path="/admin/produtos" element={<Guard><ProdutosAdminList /></Guard>} />
          <Route path="/admin/produtos/novo" element={<Guard><ProdutoAdminForm mode="create" /></Guard>} />
          <Route path="/admin/produtos/:id/editar" element={<Guard><ProdutoAdminForm mode="edit" /></Guard>} />
          <Route path="/admin/produtos/:id/fotos" element={<Guard><FotosAdmin /></Guard>} />
          <Route path="/admin/config" element={<Guard><SiteSettingsPage /></Guard>} />

        </Routes>
        <Footer />

        <FloatingWhatsApp />

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

function MobileMenu({ isAuth, onOpenLogin, onOpenChangePwd, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="rounded-md border px-3 py-1.5 text-sm"
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        {open ? "Fechar" : "Menu"}
      </button>

      {open && (
        <div id="mobile-menu" className="absolute left-0 right-0 top-full z-40 border-b bg-white shadow-sm">
          <div className="mx-auto max-w-7xl p-3 space-y-2 text-sm text-brandNavy">
            <Link onClick={() => setOpen(false)} to="/" className="block px-2 py-2 rounded hover:bg-gray-50">Home</Link>
            <Link onClick={() => setOpen(false)} to="/sobre" className="block px-2 py-2 rounded hover:bg-gray-50">Sobre nós</Link>
            <Link onClick={() => setOpen(false)} to="/localizacao" className="block px-2 py-2 rounded hover:bg-gray-50">Localização</Link>
            <Link onClick={() => setOpen(false)} to="/compramos-seu-batido" className="block px-2 py-2 rounded hover:bg-gray-50">Compramos seu batido</Link>
            <Link onClick={() => setOpen(false)} to="/fale-conosco" className="block px-2 py-2 rounded hover:bg-gray-50">Fale conosco</Link>

            {isAuth ? (
              <>
                <div className="h-px bg-gray-200 my-2" />
                <Link onClick={() => setOpen(false)} to="/admin/produtos" className="block px-2 py-2 rounded hover:bg-gray-50">Produtos</Link>
                <Link onClick={() => setOpen(false)} to="/admin/modelos" className="block px-2 py-2 rounded hover:bg-gray-50">Modelos</Link>
                <Link onClick={() => setOpen(false)} to="/admin/marcas" className="block px-2 py-2 rounded hover:bg-gray-50">Marcas</Link>
                <Link onClick={() => setOpen(false)} to="/admin/config" className="block px-2 py-2 rounded hover:bg-gray-50">Configurações</Link>
                <button onClick={() => { setOpen(false); onOpenChangePwd(); }} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">
                  Alterar senha
                </button>
                <button onClick={() => { setOpen(false); onLogout(); }} className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">
                  Sair
                </button>
              </>
            ) : (
              <button onClick={() => { setOpen(false); onOpenLogin(); }} className="w-full text-left px-2 py-2 rounded bg-brandNavy text-white">
                Entrar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
