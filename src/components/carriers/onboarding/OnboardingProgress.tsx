
import { Progress } from "@/components/ui/progress";

interface OnboardingProgressProps {
  currentStep: 'profile' | 'documents';
  isCompleted: boolean;
}

export function OnboardingProgress({ currentStep, isCompleted }: OnboardingProgressProps) {
  const getProgress = () => {
    if (isCompleted) return 100;
    return currentStep === 'profile' ? 50 : 75;
  };

  return (
    <div className="mb-8">
      <Progress value={getProgress()} className="h-2" />
      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
        <span>Profile Information</span>
        <span>Document Upload</span>
        <span>Complete</span>
      </div>
    </div>
  );
}
