import { useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Section } from "@/components/Section";
import { LeadCaptureChat } from "@/components/LeadCaptureChat";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, CheckCircle2, ArrowRight, Activity, Heart, Clock } from "lucide-react";
import { FaTelegramPlane, FaPaypal } from "react-icons/fa";

export default function Home() {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-900 text-white">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium backdrop-blur-sm">
              <Activity className="w-4 h-4 text-accent" />
              <span>Expertise Basedow & Hashimoto</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
              Coach Santé <br />
              <span className="text-accent">Thyroïde</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-lg">
              Accompagnement holistique et preuves à l’appui pour retrouver votre équilibre hormonal.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="rounded-full text-lg px-8 py-6 bg-accent text-accent-foreground hover:bg-accent/90 shadow-xl shadow-accent/20"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Réserver une séance
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full text-lg px-8 py-6 border-white/30 text-primary-foreground hover:bg-white/10 bg-transparent backdrop-blur-sm"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Découvrir mon approche
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden md:block"
          >
            {/* Medical Illustration Placeholder - abstract representation */}
            <div className="relative z-10 aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/50 border border-white/10 bg-white/5 backdrop-blur-sm p-8 flex items-center justify-center">
               {/* thyroid gland location illustration */}
               <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Thyroid_gland_location.svg/512px-Thyroid_gland_location.svg.png" 
                alt="Thyroid Gland Location" 
                className="w-full h-auto drop-shadow-2xl opacity-90 invert brightness-200 contrast-200"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <Section id="about" title="À propos" subtitle="Une approche née de l'expérience personnelle" background="white">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg text-slate-600"
          >
            <p className="text-xl font-medium text-primary mb-6">
              Je suis Frédéric Niddam, ex-ingénieur télécom, ayant souffert 7 ans de la maladie de Basedow (1992 à 1999).
            </p>
            <p>
              Mon parcours m'a conduit à explorer en profondeur les mécanismes hormonaux et les solutions naturelles. Aujourd’hui, j’accompagne celles et ceux qui veulent retrouver un équilibre et un mieux-être global.
            </p>
            <p>
              Ma méthode repose sur une approche <strong>naturelle et personnalisée</strong>, sans jamais se substituer à un suivi médical, mais en venant le compléter par une hygiène de vie adaptée.
            </p>
            
            <div className="mt-8 flex gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-bold text-accent">7+</span>
                <span className="text-sm font-medium uppercase tracking-wider text-slate-500">Années d'expérience<br/>personnelle</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-bold text-accent">100%</span>
                <span className="text-sm font-medium uppercase tracking-wider text-slate-500">Approche<br/>Holistique</span>
              </div>
            </div>
          </motion.div>
          
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-slate-200 relative z-10">
               <img 
                src="/images/freddy.jpg" 
                alt="Frédéric Niddam - Coach Santé Thyroïde" 
                className="object-cover w-full h-full"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/20 rounded-full blur-2xl z-0" />
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl z-0" />
          </div>
        </div>
      </Section>

      {/* Consultation Section */}
      <Section id="consultation" background="gradient" className="text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900">
              Consultations à Paris / Saint-Mandé / Vincennes
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Consultations sur rendez-vous — avec preuves à l’appui. Contactez-moi directement pour plus d’informations ou pour réserver un accompagnement personnalisé.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: "Analyse Complète", desc: "Étude approfondie de votre situation et historique." },
              { icon: Heart, title: "Approche Naturelle", desc: "Solutions douces respectueuses de votre corps." },
              { icon: Clock, title: "Suivi Régulier", desc: "Un accompagnement dans la durée pour des résultats pérennes." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-50 hover:border-primary/20 transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-6 text-primary">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-8 max-w-3xl mx-auto">
               <img 
                src="/images/anatomy.jpg" 
                alt="Illustration Hypophyse et Thyroïde" 
                className="w-64 h-auto rounded-2xl shadow-md"
              />
            <div className="text-left space-y-4">
              <h3 className="text-2xl font-bold text-slate-900">Comprendre pour mieux agir</h3>
              <p className="text-slate-600">
                La thyroïde est le chef d'orchestre de votre métabolisme. Un dysfonctionnement peut impacter votre énergie, votre humeur et votre poids. Mon approche vise à rétablir cette harmonie.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Pricing Section */}
      <Section id="pricing" title="Réserver votre consultation" subtitle="Investissez dans votre santé et votre bien-être" background="white">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />
            
            <div className="p-8 md:p-10 space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">Consultation Individuelle</h3>
                <div className="flex items-baseline justify-center gap-1 text-primary">
                  <span className="text-5xl font-bold font-display">80</span>
                  <span className="text-2xl font-bold">€</span>
                </div>
                <p className="text-slate-500 font-medium">Séance de 1 heure</p>
              </div>

              <div className="space-y-4">
                {[
                  "Bilan complet initial",
                  "Conseils personnalisés",
                  "Plan d'action concret",
                  "Support par email"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 border border-slate-100">
                <p className="font-medium mb-1">📝 Note importante :</p>
                Le paiement se fait avant la prise de rendez-vous. Une fois le paiement effectué, vous recevrez un e-mail pour convenir de votre créneau.
              </div>

              <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full h-14 text-lg rounded-xl font-bold bg-[#ffc439] hover:bg-[#ffc439]/90 text-slate-900 shadow-lg shadow-orange-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <FaPaypal className="mr-2 text-xl" />
                    Payer ma séance (80 €)
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-center">Merci pour votre confiance 🙏</DialogTitle>
                    <DialogDescription className="text-center text-base pt-2">
                      Votre règlement est la première étape vers votre mieux-être.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-6 space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg flex items-start gap-3 border border-green-100">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <p className="text-sm text-green-800">
                        Vous allez être redirigé vers PayPal pour sécuriser votre paiement de 80€.
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 text-center">
                      Après le paiement, contactez-moi par e-mail à <a href="mailto:fniddam@gmail.com" className="text-primary font-medium hover:underline">fniddam@gmail.com</a> pour convenir du rendez-vous.
                    </p>
                  </div>

                  <DialogFooter className="sm:justify-center">
                    <Button 
                      className="w-full sm:w-auto bg-[#003087] hover:bg-[#003087]/90 text-white font-bold h-12 px-8 rounded-full"
                      onClick={() => {
                        window.open("https://paypal.me/FREDERICNIDDAM26/80", "_blank");
                        setPaymentDialogOpen(false);
                      }}
                    >
                      Continuer vers PayPal
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-4">
              <h4 className="text-2xl font-display font-bold text-white">Coach Santé Thyroïde</h4>
              <p className="text-slate-400">
                Accompagnement holistique pour retrouver l'équilibre et la santé naturellement.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">Contact</h4>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:fniddam@gmail.com" className="hover:text-accent transition-colors flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    fniddam@gmail.com
                  </a>
                </li>
                <li>
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </span>
                    Consultations sur RDV
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">Communauté</h4>
              <a 
                href="https://t.me/mutile_pas_ma_thyroide" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-all font-medium w-full md:w-auto justify-center"
              >
                <FaTelegramPlane className="text-xl" />
                Rejoindre le canal Telegram
              </a>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>© 2026 Frédéric Niddam. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      <LeadCaptureChat />
    </div>
  );
}
