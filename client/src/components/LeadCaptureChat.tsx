import { useState, useRef, useEffect, useCallback } from "react";
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
const INACTIVITY_DELAY_MS = 30_000;

const INACTIVITY_NUDGES: Partial<Record<Step, string>> = {
  greeting:
    "Vous êtes toujours là ? 😊 Beaucoup de nos clients ont retrouvé leur énergie grâce à un suivi personnalisé. Puis-je vous aider ?",
  askCity:
    "Je suis disponible 24h/24 pour vous aider 🕐 Dans quelle ville êtes-vous situé(e) — Paris, Vincennes ou Saint-Mandé ?",
  askEmail:
    "Votre plan thyroïdien personnalisé n'attend plus que vous ✨ Quel est votre e-mail ?",
  askConsent:
    "Pas de pression 😊 Un simple « Oui » vous donnera accès à votre plan d'optimisation thyroïdienne gratuit.",
};

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
  return VALID_CITIES.some((c) => normalizeText(c) === normalized);
}

export function LeadCaptureChat() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("greeting");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCity, setLeadCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRef = useRef<Step>("greeting");
  const isLoadingRef = useRef(false);

  stepRef.current = step;
  isLoadingRef.current = isLoading;

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

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const scheduleInactivityNudge = useCallback(() => {
    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(async () => {
      const currentStep = stepRef.current;
      const currentlyLoading = isLoadingRef.current;
      const nudge = INACTIVITY_NUDGES[currentStep];
      if (!nudge || currentlyLoading) return;
      setMessages((prev) => [...prev, { from: "bot", text: nudge }]);
    }, INACTIVITY_DELAY_MS);
  }, [clearInactivityTimer]);

  useEffect(() => {
    if (open && !started) {
      setStarted(true);
      addBot(
        "Bonjour 👋 Je suis l'assistant de Frédéric Niddam, coach spécialisé en thyroïde.\n\nSouffrez-vous de fatigue persistante, de prise de poids inexpliquée ou d'autres symptômes thyroïdiens ?",
        400
      ).then(() => scheduleInactivityNudge());
    }
    if (!open) {
      clearInactivityTimer();
    }
  }, [open, started, scheduleInactivityNudge, clearInactivityTimer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const TERMINAL_STEPS: Step[] = ["cityRejected", "declined", "followupSent", "registered"];

  const processInput = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    clearInactivityTimer();
    setInput("");
    addUser(trimmed);
    setIsLoading(true);

    if (step === "greeting") {
      await addBot(
        "Super, je suis là pour vous aider 💙\n\nPour que Frédéric puisse vous accompagner, j'ai besoin de savoir dans quelle ville vous habitez."
      );
      setStep("askCity");
    } else if (step === "askCity") {
      if (isValidCity(trimmed)) {
        setLeadCity(trimmed);
        await addBot(
          "Parfait ! Frédéric accompagne des patients dans votre secteur 🎯\n\nPour vous envoyer votre plan personnalisé d'optimisation thyroïdienne, quelle est votre adresse e-mail ?"
        );
        setStep("askEmail");
      } else {
        await addBot(
          "Je suis désolé(e), notre accompagnement est pour l'instant disponible uniquement à Paris, Vincennes et Saint-Mandé.\n\nBonne journée et prenez soin de vous 🙏"
        );
        setStep("cityRejected");
      }
    } else if (step === "askEmail") {
      if (!EMAIL_REGEX.test(trimmed)) {
        await addBot(
          "Hmm, cette adresse e-mail ne semble pas correcte 🤔 Pourriez-vous la vérifier et réessayer ?"
        );
      } else {
        setLeadEmail(trimmed);
        await addBot(
          "Excellent ! Une dernière étape 📋\n\nAcceptez-vous de recevoir des conseils santé et un suivi personnalisé de la part de Frédéric Niddam ?\n\n🔒 Conformément au RGPD, vos données restent strictement confidentielles et ne seront jamais partagées."
        );
        setStep("askConsent");
      }
    }

    setIsLoading(false);

    if (!TERMINAL_STEPS.includes(step)) {
      scheduleInactivityNudge();
    }
  };

  const handleConsent = async (accepted: boolean) => {
    if (isLoading) return;
    clearInactivityTimer();
    setIsLoading(true);

    if (accepted) {
      addUser("Oui, j'accepte");
      try {
        const res = await fetch("/save-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: leadEmail,
            city: leadCity,
            consent: true,
            source: "agent_freddy",
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          await addBot(
            "✅ Vous êtes bien enregistré(e) — merci pour votre confiance !\n\nCliquez ci-dessous si vous souhaitez que Frédéric vous contacte personnellement avec votre plan d'optimisation thyroïdienne."
          );
          setStep("registered");
        } else if (res.status === 409) {
          await addBot(
            "✅ Votre adresse e-mail est déjà dans notre système.\n\nVous pouvez demander un suivi personnalisé ci-dessous 👇"
          );
          setStep("registered");
        } else {
          await addBot(
            "Une erreur est survenue de notre côté 😔 Veuillez réessayer dans un instant."
          );
        }
      } catch {
        await addBot(
          "Une erreur est survenue de notre côté 😔 Veuillez réessayer dans un instant."
        );
      }
    } else {
      addUser("Non");
      await addBot(
        "Très bien, je respecte entièrement votre choix 🙏\n\nVos données ne seront pas conservées.\n\nSi vous changez d'avis, n'hésitez pas à revenir. Bonne journée et prenez soin de vous !"
      );
      setStep("declined");
    }

    setIsLoading(false);
  };

  const handleFollowup = async () => {
    if (isLoading) return;
    clearInactivityTimer();
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
          `🎯 Parfait ! Votre demande de suivi est bien enregistrée.\n\nFrédéric Niddam vous contactera très prochainement à l'adresse ${leadEmail} avec votre plan d'optimisation thyroïdienne personnalisé.\n\nMerci de votre confiance — vous faites le bon choix pour votre santé 🙏`,
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
            style={{ height: "520px" }}
          >
            <div className="bg-gradient-to-r from-primary to-blue-800 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">
                  🦋
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">Assistant Thyroïde</p>
                  <p className="text-blue-200 text-xs mt-0.5">Disponible 24h/24 · Frédéric Niddam</p>
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
                    data-testid="button-greeting-yes"
                    onClick={() => processInput("Oui, j'ai ces symptômes")}
                    className="px-3 py-1.5 bg-white border border-primary text-primary text-xs rounded-full hover:bg-primary hover:text-white transition-colors"
                  >
                    Oui, j'ai ces symptômes
                  </button>
                  <button
                    data-testid="button-greeting-info"
                    onClick={() => processInput("Je voudrais des informations")}
                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-500 text-xs rounded-full hover:bg-slate-100 transition-colors"
                  >
                    Juste des informations
                  </button>
                </div>
              )}

              {step === "askConsent" && messages.length > 0 && !isLoading && (
                <div className="flex gap-2 pt-1">
                  <button
                    data-testid="button-consent-yes"
                    onClick={() => handleConsent(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-xs font-medium rounded-full hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Oui, j'accepte
                  </button>
                  <button
                    data-testid="button-consent-no"
                    onClick={() => handleConsent(false)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs rounded-full hover:bg-slate-50 transition-colors"
                  >
                    Non
                  </button>
                </div>
              )}

              {step === "registered" && !isLoading && (
                <div className="flex justify-start pt-1">
                  <button
                    data-testid="button-followup"
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
                    data-testid="input-chat"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={inputPlaceholder}
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-slate-50 placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                  <button
                    data-testid="button-send"
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
