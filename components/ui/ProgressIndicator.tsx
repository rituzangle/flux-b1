interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <span className="text-sm text-text-secondary font-medium">
        Step {currentStep} of {totalSteps}
      </span>
      <div className="flex gap-2 ml-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 w-8 rounded-full transition-all duration-300 ${
              index < currentStep
                ? 'bg-brand-primary'
                : index === currentStep - 1
                ? 'bg-brand-primary'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
