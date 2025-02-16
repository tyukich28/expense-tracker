import { motion, AnimatePresence } from "framer-motion";

interface FormStepWrapperProps {
  children: React.ReactNode;
  show: boolean;
}

export default function FormStepWrapper({ children, show }: FormStepWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
            opacity: { duration: 0.25 },
            y: { duration: 0.3 }
          }}
          className="space-y-4"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}