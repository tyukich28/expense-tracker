import { motion, AnimatePresence } from "framer-motion";

interface FormStepWrapperProps {
  children: React.ReactNode;
  show: boolean;
}

export default function FormStepWrapper({ children, show }: FormStepWrapperProps) {
  return (
    <div className="min-h-[200px] relative">
      <AnimatePresence mode="wait" initial={false}>
        {show && (
          <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
              layout: { duration: 0.3 },
              opacity: { duration: 0.2 },
              x: { duration: 0.2 }
            }}
            className="absolute inset-0 w-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}