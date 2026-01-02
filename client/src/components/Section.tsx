import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  background?: "white" | "muted" | "primary" | "gradient";
}

export function Section({ 
  id, 
  className, 
  children, 
  title, 
  subtitle,
  background = "white" 
}: SectionProps) {
  const bgStyles = {
    white: "bg-white",
    muted: "bg-slate-50",
    primary: "bg-primary text-primary-foreground",
    gradient: "bg-gradient-to-br from-slate-50 to-blue-50/50",
  };

  const isDark = background === "primary";

  return (
    <section 
      id={id} 
      className={cn(
        "py-20 md:py-32 relative overflow-hidden",
        bgStyles[background],
        className
      )}
    >
      <div className="container px-4 md:px-6 max-w-7xl mx-auto relative z-10">
        {(title || subtitle) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-4"
          >
            {title && (
              <h2 className={cn(
                "text-3xl md:text-5xl font-bold tracking-tight",
                isDark ? "text-white" : "text-slate-900"
              )}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={cn(
                "text-lg md:text-xl",
                isDark ? "text-primary-foreground/90" : "text-muted-foreground"
              )}>
                {subtitle}
              </p>
            )}
          </motion.div>
        )}
        {children}
      </div>
      
      {/* Decorative background elements for visual depth */}
      {background === "gradient" && (
        <>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        </>
      )}
    </section>
  );
}
