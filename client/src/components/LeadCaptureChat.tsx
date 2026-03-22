import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, CheckCircle2 } from "lucide-react";

type Step =
  | "greeting"
  | "askCity"
  | "cityRejected"
  | "askEmail"
  | "askConsent"
  | "registered"
  | "declined"
  | "followupSent";

interface Message {
  from: "bot" | "user";
  text: string;
}

const VALID_CITIES = ["paris", "vincennes", "saint-mande", "saint mandé", "saint mande"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function isValidCity(input: string): boolean {
  const normalized = normalizeText(input);
  return VALID_CITIES.some((c) => normalizeText(c) === normalized || normalized === normalizeText(c));
}

export function LeadCaptureChat() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("greeting");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [leadId, setLeadId] = useState<number | null>(null);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCity, setLeadCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addBot = (text: string, delay = 500) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setMessages((prev) => [...prev, { from: "bot", text }]);
        resolve();
      }, delay);
    });
  };

  const addUser = (text: string) => {
    setMessages((prev) => [...prev, { from: "user", text }]);
  };

  useEffect(() => {
    if (open && !started) {
      setStarted(true);
      addBot(
        "Bonjour 👋 Souffrez-vous de fatigue, de prise de poids ou de symptômes liés à la thyroïde ?",
        400
      );
    }
  }, [open, started]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const processInput = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setInput("");
    addUser(trimmed);
    setIsLoading(true);

    if (step === "greeting") {
      await addBot("Pour mieux vous aider, pourriez-vous me dire dans quelle ville vous habitez ?");
      setStep("askCity");
    } else if (step === "askCity") {
      if (isValidCity(trimmed)) {
        setLeadCity(trimmed);
        await addBot(
          "Je peux vous envoyer un plan personnalisé d'optimisation thyroïdienne. Quelle est votre adresse e-mail ?"
        );
        setStep("askEmail");
      } else {
        await addBot(
          "Pour le moment, notre accompagnement est uniquement disponible pour les personnes situées à Paris, Vincennes ou Saint-Mandé. Bonne journée 🙏"
        );
        setStep("cityRejected");
      }
    } else if (step === "askEmail") {
      if (!EMAIL_REGEX.test(trimmed)) {
        await addBot("Cette adresse e-mail ne semble pas valide. Pourriez-vous la vérifier ?");
      } else {
        setLeadEmail(trimmed);
        await addBot(
          "Acceptez-vous de recevoir des conseils de santé et des e-mails de suivi de la part de Frédéric Niddam ?\n\n📋 Conformément au RGPD, vos données ne seront utilisées qu'à cette fin et ne seront jamais partagées avec des tiers."
        );
        setStep("askConsent");
      }
    } else if (step === "askConsent") {
      const n = normalizeText(trimmed);
      const isYes = ["oui", "yes", "o", "y", "ok", "dacord", "j accepte", "j'accepte", "accepte", "je suis d accord"].some((v) => n.includes(v));
      const isNo = ["non", "no", "n", "refus", "pas"].some((v) => n === v || n.startsWith(v + " "));

      if (isYes) {
        try {
          const res = await fetch("/save-lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: leadEmail,
              city: leadCity,
              consent: true,
              followupRequested: false,
              source: "agent_freddy",
            }),
          });
          const data = await res.json();
          if (res.ok) {
            setLeadId(data.id);
            await addBot(
              "✅ Vous êtes bien enregistré(e). Cliquez ci-dessous si vous souhaitez que Frédéric vous contacte avec votre plan personnalisé."
            );
            setStep("registered");
          } else {
            await addBot("Une erreur est survenue. Veuillez réessayer dans un instant.");
          }
        } catch {
          await addBot("Une erreur est survenue. Veuillez réessayer dans un instant.");
        }
      } else if (isNo) {
        await addBot(
          "Très bien, je respecte votre choix. Bonne journée et prenez soin de vous 🙏"
        );
        setStep("declined");
      } else {
        await addBot("Pourriez-vous répondre par oui ou non ?");
      }
    }

    setIsLoading(false);
  };

  const handleFollowup = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch("/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: leadEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep("followupSent");
        await addBot(
          `Parfait 🎯 Votre demande de suivi a bien été enregistrée.\n\nFrédéric Niddam vous contactera très prochainement à l'adresse ${leadEmail} avec votre plan d'optimisation thyroïdienne personnalisé.\n\nMerci de votre confiance 🙏`,
          0
        );
      } else {
        await addBot("Une erreur est survenue. Veuillez réessayer.");
      }
    } catch {
      await addBot("Une erreur est survenue. Veuillez réessayer.");
    }
    setIsLoading(false);
  };

  const inputPlaceholder =
    step === "askEmail"
      ? "votre@email.com"
      : step === "askCity"
        ? "Paris, Vincennes, Saint-Mandé..."
        : "Votre réponse...";

  const inputDisabled =
    isLoading ||
    step === "cityRejected" ||
    step === "declined" ||
    step === "followupSent" ||
    step === "registered";

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl shadow-blue-900/20 border border-slate-100 flex flex-col overflow-hidden"
            style={{ height: "500px" }}
          >
            <div className="bg-gradient-to-r from-primary to-blue-800 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">
                  🦋
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">Assistant Thyroïde</p>
                  <p className="text-blue-200 text-xs mt-0.5">Frédéric Niddam</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.from === "user"
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {step === "greeting" && messages.length > 0 && !isLoading && (
                <div className="flex gap-2 flex-wrap pt-1">
                  <button
                    onClick={() => processInput("Oui, j'ai ces symptômes")}
                    className="px-3 py-1.5 bg-white border border-primary text-primary text-xs rounded-full hover:bg-primary hover:text-white transition-colors"
                  >
                    Oui, j'ai ces symptômes
                  </button>
                  <button
                    onClick={() => processInput("Je voudrais juste des informations")}
                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-500 text-xs rounded-full hover:bg-slate-100 transition-colors"
                  >
                    Juste des informations
                  </button>
                </div>
              )}

              {step === "askConsent" && messages.length > 0 && !isLoading && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => processInput("Oui, j'accepte")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-xs font-medium rounded-full hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Oui, j'accepte
                  </button>
                  <button
                    onClick={() => processInput("Non")}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs rounded-full hover:bg-slate-50 transition-colors"
                  >
                    Non
                  </button>
                </div>
              )}

              {step === "registered" && !isLoading && (
                <div className="flex justify-start pt-1">
                  <button
                    onClick={handleFollowup}
                    className="px-5 py-2.5 bg-accent text-accent-foreground text-sm font-semibold rounded-xl hover:bg-accent/90 transition-colors shadow-md shadow-accent/20"
                  >
                    📬 Me faire suivre par Frédéric
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "160ms" }} />
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "320ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {!inputDisabled && (
              <div className="p-3 bg-white border-t border-slate-100 flex-shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    processInput(input);
                  }}
                  className="flex gap-2"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={inputPlaceholder}
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-slate-50 placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 flex-shrink-0"
                    aria-label="Envoyer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-colors"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
          </>
        )}
      </motion.button>
    </>
  );
}
