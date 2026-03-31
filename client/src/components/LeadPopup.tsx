import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const STORAGE_KEY = "lead_popup_dismissed";
const SHOW_DELAY_MS = 6_000;

export function LeadPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/popup-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        localStorage.setItem(STORAGE_KEY, "1");
      } else if (res.status === 409) {
        setStatus("success");
        localStorage.setItem(STORAGE_KEY, "1");
      } else {
        setStatus("error");
        setErrorMsg(data.message ?? "Une erreur est survenue.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Impossible de contacter le serveur.");
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Aide thyroïde"
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="fixed bottom-[7.5rem] right-5 z-[9999] w-[300px] bg-white rounded-2xl shadow-2xl shadow-blue-900/20 border border-slate-100 p-5"
        >
          <button
            onClick={dismiss}
            aria-label="Fermer"
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {status === "success" ? (
            <div className="text-center py-2 space-y-2">
              <div className="text-3xl">✅</div>
              <p className="font-semibold text-slate-800">Merci !</p>
              <p className="text-sm text-slate-500">Frédéric vous contactera très bientôt.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <p className="font-bold text-slate-800 text-base leading-snug">
                  Problème de thyroïde ?
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  Je peux vous aider, homme ou femme !
                </p>
              </div>

              <input
                data-testid="input-popup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                required
                disabled={status === "loading"}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-slate-50 placeholder:text-slate-400 disabled:opacity-60"
              />

              {status === "error" && (
                <p className="text-xs text-red-500">{errorMsg}</p>
              )}

              <p className="text-[11px] text-slate-400 leading-tight">
                En cliquant, vous acceptez d'être contacté(e) par Frédéric Niddam. Données confidentielles, conformément au RGPD.
              </p>

              <button
                data-testid="button-popup-submit"
                type="submit"
                disabled={status === "loading" || !email.trim()}
                className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {status === "loading" ? "Envoi…" : "Recevoir mon aide"}
              </button>
            </form>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
