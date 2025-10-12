import { useNavigate, useLocation } from "react-router-dom";

export default function BackButton({
  className = "",
  defaultPath = "/",
  label = "Voltar",
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    // se veio de alguma rota com state.from, prioriza
    const from = location.state?.from;
    if (from) return navigate(from, { replace: true });

    // fallback: histórico do navegador
    if (window.history.length > 1) return navigate(-1);

    // fallback final: vai pra rota padrão
    navigate(defaultPath, { replace: true });
  };

  return (
    <button
      type="button"
      onClick={goBack}
      className={
        "inline-flex items-center gap-2 text-[#0D3A53] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D3A53] " +
        className
      }
    >
      <span aria-hidden>←</span>
      {label}
    </button>
  );
}
