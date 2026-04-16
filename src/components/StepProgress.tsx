type StepProgressProps = {
  currentStepIndex: number;
  totalSteps: number;
  labels: string[];
};

export default function StepProgress({ currentStepIndex, totalSteps, labels }: StepProgressProps) {
  const safeIndex = Math.min(Math.max(currentStepIndex, 0), totalSteps - 1);

  return (
    <div
      className="flex items-center gap-3 text-sm"
      aria-label="Check-in progress"
      aria-live="polite"
    >
      <div className="flex flex-1 items-center gap-2">
        {labels.map((label, index) => {
          const isActive = index === safeIndex;
          const isComplete = index < safeIndex;

          return (
            <div key={label} className="flex flex-1 items-center gap-1">
              <div
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium",
                  isActive
                    ? "border-violet-400 bg-violet-500 text-white"
                    : isComplete
                      ? "border-emerald-400 bg-emerald-500 text-white"
                      : "border-slate-700 bg-slate-900 text-slate-300",
                ].join(" ")}
              >
                {index + 1}
              </div>
              <span
                className={[
                  "text-xs",
                  isActive
                    ? "text-violet-200"
                    : isComplete
                      ? "text-emerald-200"
                      : "text-slate-400",
                ].join(" ")}
              >
                {label}
              </span>
              {index < totalSteps - 1 ? (
                <div className="h-px flex-1 rounded bg-slate-800" aria-hidden="true" />
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="whitespace-nowrap text-xs text-slate-400">
        Step {safeIndex + 1} of {totalSteps}
      </p>
    </div>
  );
}

