import { motion } from "framer-motion";

interface FormStepWrapperProps {
  children: React.ReactNode;
  show: boolean;
}

export default function FormStepWrapper({ children, show }: FormStepWrapperProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-4"
    >
      {children}
    </motion.div>
  );
}