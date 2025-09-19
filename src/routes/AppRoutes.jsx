import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProductsList from "../pages/Store/ProductsList";
import ProductDetails from "../pages/Store/ProductDetails";
import MarcasList from "../pages/Marcas/MarcasList";
import ModelosList from "../pages/Modelos/ModelosList";

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

  return (
    <BrowserRouter>
     <nav className="px-4 py-3 border-b bg-white text-brandNavy">
  <div className="mx-auto max-w-7xl flex items-center gap-4">
    <img src="/brand-logo.png" alt="Revisa Caminhões" className="h-8" />
    {/* Público: só vitrine */}
    <Link to="/" className="hover:opacity-80">Peças</Link>

    <div className="ml-auto flex items-center gap-3">
      {isAuth ? (
        <>
          {/* Admin links (sem “(admin)”) */}
          <Link to="/admin/produtos" className="hover:opacity-80">Produtos</Link>
          <Link to="/admin/modelos" className="hover:opacity-80">Modelos</Link>
          <Link to="/admin/marcas" className="hover:opacity-80">Marcas</Link>
          <button onClick={logout}
            className="rounded-md border border-brandNavy/30 px-3 py-1.5 text-sm hover:bg-brandNavy hover:text-white">
            Sair
          </button>
        </>
      ) : (
        <button onClick={()=>setOpenLogin(true)}
          className="rounded-md bg-brandNavy text-white px-3 py-1.5 text-sm hover:opacity-90">
          Entrar
        </button>
      )}
    </div>
  </div>
</nav>

      <div className="p-6">
        <Routes>
          {/* Público */}
          <Route path="/" element={<ProductsList />} />
          <Route path="/peca/:id" element={<ProductDetails />} />

          {/* Admin */}
          <Route path="/admin/marcas" element={<Guard><MarcasList /></Guard>} />
          <Route path="/admin/modelos" element={<Guard><ModelosList/></Guard>} />

          <Route path="/admin/produtos" element={<Guard><ProdutosAdminList /></Guard>} />
          <Route path="/admin/produtos/novo" element={<Guard><ProdutoAdminForm mode="create" /></Guard>} />
          <Route path="/admin/produtos/:id/editar" element={<Guard><ProdutoAdminForm mode="edit" /></Guard>} />
          <Route path="/admin/produtos/:id/fotos" element={<Guard><FotosAdmin /></Guard>} />
        </Routes>
      </div>

      <LoginDialog open={openLogin} onClose={()=>setOpenLogin(false)} />
    </BrowserRouter>
  );
}
