import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

const PHONE = "33609472205";
const MESSAGE = encodeURIComponent("Bonjour, je souhaite avoir plus d'informations");
const WHATSAPP_URL = `https://wa.me/${PHONE}?text=${MESSAGE}`;

export function WhatsAppButton() {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="button-whatsapp"
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
