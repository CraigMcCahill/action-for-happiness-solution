import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCheckInSession } from "../hooks/useCheckInSession";
import StepProgress from "./StepProgress";
import type { CheckInResponses } from "../types/checkIn";

const TOTAL_STEPS = 4;

type BreatheStepProps = {
  completed: boolean;
  onComplete: () => void;
  onNext: () => void;
};

type ReflectStepProps = {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
};

type GratitudeStepProps = {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

type IntentionStepProps = {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  submitError: string | null;
};

export default function CheckInPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const safeToken = token ?? "";

  const { session, loading, error, submit } = useCheckInSession(safeToken);

  const [step, setStep] = useState<number>(0);
  const [breatheCompleted, setBreatheCompleted] = useState<boolean>(false);
  const [reflect, setReflect] = useState<string>("");
  const [gratitude, setGratitude] = useState<string>("");
  const [intention, setIntention] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.responses) {
      setBreatheCompleted(session.responses.breatheCompleted);
      setReflect(session.responses.reflect);
      setGratitude(session.responses.gratitude);
      setIntention(session.responses.intention);
    }
  }, [session?.responses]);

  const completed = session?.status === "completed";
  const stepLabels = useMemo(() => ["Breathe", "Reflect", "Gratitude", "Intention"], []);

  const onSubmit = async () => {
    if (!breatheCompleted) {
      return;
    }
    if (reflect.trim().length === 0) {
      return;
    }
    if (gratitude.trim().length === 0) {
      return;
    }
    if (intention.trim().length === 0) {
      return;
    }

    setSubmitError(null);
    const responses: CheckInResponses = {
      breatheCompleted,
      reflect: reflect.trim(),
      gratitude: gratitude.trim(),
      intention: intention.trim(),
      submittedAt: new Date().toISOString(),
    };

    try {
      await submit(responses);
      setStep(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed";
      setSubmitError(message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Daily Check-In</h1>
          <p className="text-sm text-slate-400">
            {completed ? "You completed today's check-in." : "Follow the steps below at your own pace."}
          </p>
        </header>

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-slate-600"
          >
            Back to sign up
          </button>

          {!completed ? (
            <StepProgress
              currentStepIndex={step}
              totalSteps={TOTAL_STEPS}
              labels={stepLabels}
            />
          ) : null}
        </div>

        {loading ? <p className="text-sm text-slate-300">Loading check-in...</p> : null}
        {error ? (
          <section className="rounded-xl border border-red-900 bg-red-950/20 p-4">
            <p className="text-sm text-red-200">{error}</p>
          </section>
        ) : null}

        {!loading && !error ? (
          completed ? (
            <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-lg font-semibold">Thank you</h2>
              {session?.responses ? (
                <div className="space-y-3 text-sm text-slate-200">
                  <p>
                    <span className="font-medium">Breathe:</span>{" "}
                    {session.responses.breatheCompleted ? "Completed" : "Not completed"}
                  </p>
                  <p>
                    <span className="font-medium">Reflect:</span> {session.responses.reflect}
                  </p>
                  <p>
                    <span className="font-medium">Gratitude:</span> {session.responses.gratitude}
                  </p>
                  <p>
                    <span className="font-medium">Intention:</span> {session.responses.intention}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-300">This check-in was completed.</p>
              )}
            </section>
          ) : (
            <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
              {step === 0 ? (
                <BreatheStep
                  completed={breatheCompleted}
                  onComplete={() => setBreatheCompleted(true)}
                  onNext={() => setStep(1)}
                />
              ) : null}

              {step === 1 ? (
                <ReflectStep
                  value={reflect}
                  onChange={(value) => setReflect(value)}
                  onNext={() => setStep(2)}
                />
              ) : null}

              {step === 2 ? (
                <GratitudeStep
                  value={gratitude}
                  onChange={(value) => setGratitude(value)}
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              ) : null}

              {step === 3 ? (
                <IntentionStep
                  value={intention}
                  onChange={(value) => setIntention(value)}
                  onBack={() => setStep(2)}
                  onSubmit={onSubmit}
                  canSubmit={
                    breatheCompleted &&
                    reflect.trim().length > 0 &&
                    gratitude.trim().length > 0 &&
                    intention.trim().length > 0
                  }
                  submitError={submitError}
                />
              ) : null}
            </section>
          )
        ) : null}
      </div>
    </main>
  );
}

function BreatheStep({ completed, onComplete, onNext }: BreatheStepProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Breathe</h2>
      <p className="text-sm text-slate-300">
        Take a few calm, deep breaths. When you're ready, press the button below to continue.
      </p>

      <button
        type="button"
        onClick={onComplete}
        disabled={completed}
        className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {completed ? "Breathing complete" : "I've taken a few deep breaths"}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!completed}
        className="w-full rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Continue to Reflect
      </button>
    </div>
  );
}

function ReflectStep({ value, onChange, onNext }: ReflectStepProps) {
  const trimmed = value.trim();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Reflect</h2>
      <div className="space-y-2">
        <label htmlFor="reflect" className="block text-sm font-medium text-slate-200">
          How are you feeling right now?
        </label>
        <textarea
          id="reflect"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none transition focus:border-violet-400"
          placeholder="Check in with yourself, without judgement..."
        />
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={trimmed.length === 0}
        className="w-full rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Continue to Gratitude
      </button>
    </div>
  );
}

function GratitudeStep({ value, onChange, onBack, onNext }: GratitudeStepProps) {
  const trimmed = value.trim();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Gratitude</h2>
      <div className="space-y-2">
        <label htmlFor="gratitude" className="block text-sm font-medium text-slate-200">
          What are you grateful for today?
        </label>
        <textarea
          id="gratitude"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none transition focus:border-violet-400"
          placeholder="However small it may feel..."
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={trimmed.length === 0}
          className="flex-1 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue to Intention
        </button>
      </div>
    </div>
  );
}

function IntentionStep({
  value,
  onChange,
  onBack,
  onSubmit,
  canSubmit,
  submitError,
}: IntentionStepProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Intention</h2>
      <div className="space-y-2">
        <label htmlFor="intention" className="block text-sm font-medium text-slate-200">
          What one thing would help you make positive progress today?
        </label>
        <textarea
          id="intention"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none transition focus:border-violet-400"
          placeholder="Choose something small and doable..."
        />
      </div>

      {submitError ? (
        <p role="alert" className="text-sm text-red-300">
          {submitError}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex-1 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Submit check-in
        </button>
      </div>
    </div>
  );
}


