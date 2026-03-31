import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

const PHONE = "33609472205";
const MESSAGE = encodeURIComponent("Bonjour, je peux vous aider et aider votre thyroïde");
const WHATSAPP_URL = `https://wa.me/${PHONE}?text=${MESSAGE}`;

export function WhatsAppButton() {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="button-whatsapp-right"
      aria-label="Contacter par WhatsApp"
      className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-green-800/30 hover:shadow-green-800/50 transition-shadow"
      style={{ backgroundColor: "#25D366" }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.93 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.5 }}
    >
      <FaWhatsapp className="w-7 h-7 text-white" />
    </motion.a>
  );
}

export function WhatsAppLeftButton() {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="button-whatsapp-left"
      aria-label="Contacter par WhatsApp"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-white text-sm font-semibold shadow-lg shadow-green-800/30 select-none"
      style={{ backgroundColor: "#25D366" }}
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.8 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <FaWhatsapp className="w-5 h-5 flex-shrink-0" />
      </motion.span>
      Je peux vous aider
    </motion.a>
  );
}
