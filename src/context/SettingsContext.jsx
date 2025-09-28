import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const SettingsCtx = createContext(null);
export const useSettings = () => useContext(SettingsCtx);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    // 👇 liga o loading sempre que recarregar
    setLoading(true);
    try {
      const { data } = await api.get("/api/site/settings/public", {
        validateStatus: (s) => s < 500,
      });
      setSettings(data || null);
    } catch {
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  return (
    <SettingsCtx.Provider value={{ settings, loading, refresh, setSettings }}>
      {children}
    </SettingsCtx.Provider>
  );
}
export default SettingsProvider;
