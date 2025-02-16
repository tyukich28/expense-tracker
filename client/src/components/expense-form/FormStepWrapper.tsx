interface FormStepWrapperProps {
  children: React.ReactNode;
  show: boolean;
}

export default function FormStepWrapper({ children, show }: FormStepWrapperProps) {
  if (!show) return null;
  return <div className="animate-in fade-in duration-200">{children}</div>;
}