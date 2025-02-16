import { motion, AnimatePresence } from "framer-motion";

interface FormStepWrapperProps {
  children: React.ReactNode;
  show: boolean;
}

export default function FormStepWrapper({ children, show }: FormStepWrapperProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
          }}
          exit={{ 
            opacity: 0, 
            y: -20,
          }}
          transition={{
            duration: 0.4,
            ease: "easeInOut",
          }}
          style={{
            willChange: "opacity, transform"
          }}
          className="space-y-4"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}