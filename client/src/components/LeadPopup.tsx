import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const STORAGE_KEY = "lead_popup_v2_done";
const SHOW_DELAY_MS = 5_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LeadPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (visible) setTimeout(() => inputRef.current?.focus(), 300);
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  const validate = (value: string) => {
    if (!value.trim()) return "Veuillez saisir votre adresse email.";
    if (!EMAIL_RE.test(value.trim())) return "Format d'email invalide.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(email);
    if (err) { setEmailError(err); return; }
    setEmailError("");
    setServerError("");
    setStatus("loading");

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
        setTimeout(() => setVisible(false), 3_500);
      } else if (res.status === 409) {
        setStatus("success");
        localStorage.setItem(STORAGE_KEY, "1");
        setTimeout(() => setVisible(false), 3_500);
      } else {
        setStatus("error");
        setServerError(data.message ?? "Une erreur est survenue.");
      }
    } catch {
      setStatus("error");
      setServerError("Impossible de contacter le serveur.");
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Dark overlay — clicking it does nothing (modal is forced) */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Centered modal card */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-title"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          >
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-10">
              {/* Close button */}
              <button
                onClick={dismiss}
                aria-label="Fermer"
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                data-testid="button-popup-close"
              >
                <X className="w-4 h-4" />
              </button>

              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4 space-y-4"
                >
                  <div className="text-5xl">✅</div>
                  <h2 className="text-2xl font-bold text-slate-800">Merci !</h2>
                  <p className="text-slate-500">Frédéric vous contactera très bientôt.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                      🦋
                    </div>
                    <h2
                      id="popup-title"
                      className="text-2xl md:text-3xl font-bold text-slate-900"
                    >
                      Je peux vous aider
                    </h2>
                    <p className="text-slate-500 text-sm md:text-base">
                      Entrez votre email pour recevoir des conseils gratuits
                    </p>
                  </div>

                  {/* Email input */}
                  <div className="space-y-1.5">
                    <input
                      ref={inputRef}
                      data-testid="input-popup-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(validate(e.target.value));
                      }}
                      onBlur={() => setEmailError(validate(email))}
                      placeholder="votre@email.com"
                      required
                      disabled={status === "loading"}
                      className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none bg-slate-50 placeholder:text-slate-400 transition-colors disabled:opacity-60 ${
                        emailError
                          ? "border-red-400 focus:border-red-400"
                          : "border-slate-200 focus:border-primary"
                      }`}
                    />
                    {emailError && (
                      <p className="text-xs text-red-500 pl-1">{emailError}</p>
                    )}
                    {status === "error" && serverError && (
                      <p className="text-xs text-red-500 pl-1">{serverError}</p>
                    )}
                  </div>

                  {/* GDPR note */}
                  <p className="text-[11px] text-slate-400 text-center leading-relaxed -mt-2">
                    En cliquant, vous acceptez d'être contacté(e) par Frédéric Niddam.
                    Vos données sont confidentielles et conformes au RGPD.
                  </p>

                  {/* Submit */}
                  <button
                    data-testid="button-popup-submit"
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 text-sm md:text-base"
                  >
                    {status === "loading" ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Envoi…
                      </span>
                    ) : (
                      "Recevoir mon aide"
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
