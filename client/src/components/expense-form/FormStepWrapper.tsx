interface FormStepWrapperProps {
  children: React.ReactNode;
  show: boolean;
}

export default function FormStepWrapper({ children, show }: FormStepWrapperProps) {
  if (!show) return null;
  return (
    <div 
      className={`
        opacity-0 translate-y-4 
        animate-in fade-in slide-in-from-bottom-4 
        duration-300 ease-out 
        data-[state=entered]:opacity-100 
        data-[state=entered]:translate-y-0
      `}
    >
      {children}
    </div>
  );
}