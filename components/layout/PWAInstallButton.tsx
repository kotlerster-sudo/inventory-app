"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export function PWAInstallButton() {
  const [prompt, setPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!prompt || installed) return null;

  async function handleInstall() {
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
  }

  return (
    <button
      onClick={handleInstall}
      className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100 active:scale-95 transition-all"
    >
      <Download className="w-3.5 h-3.5" />
      Install App
    </button>
  );
}
