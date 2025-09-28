import { useSettings } from "../../context/SettingsContext";

export default function About() {
  const { settings } = useSettings();
  const html = settings?.aboutHtml || "<h1>Sobre nós</h1><p>Lorem ipsum...</p>";

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}