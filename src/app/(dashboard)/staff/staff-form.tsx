"use client";

import { Loader2, ChevronRight, ChevronLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { scrollToError } from "@/lib/utils";
import { createStaff, updateStaff } from "./actions";

import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import {
  FormWizardProgress,
  StepPersonalInfo,
  StepProfessionalDetails,
  StepPortalPay,
} from "@/components/dashboard/staff/form";

interface StaffFormInitialData {
  id?: string;
  fullName?: string;
  staffNumber?: string;
  designation?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string | Date;
  joiningDate?: string | Date;
  qualification?: string;
  experience?: string;
  employmentType?: string;
  baseSalary?: number | string;
  department?: string;
}

export function StaffForm({ initialData }: Readonly<{ initialData?: StaffFormInitialData }>) {
  const [step, setStep] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useUnsavedChanges(isDirty);

  const totalSteps = 3;

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step === 1) {
      const form = formRef.current;
      if (form) {
        const fullName = (form.elements.namedItem("fullName") as HTMLInputElement)?.value;
        if (!fullName) {
          toast.error("Full name is required");
          return;
        }
      }
    }
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const result = initialData ? await updateStaff(initialData.id!, data) : await createStaff(data);

    setIsPending(false);

    if (result.success) {
      setIsDirty(false);
      toast.success(
        initialData ? "Staff record updated" : "Staff registered and user account created",
      );
      router.push("/staff");
      router.refresh();
    } else if (result.errors) {
      setErrors(result.errors);
      // Determine which step has errors
      if (result.errors.fullName || result.errors.gender || result.errors.dateOfBirth) setStep(1);
      else if (result.errors.staffNumber || result.errors.designation || result.errors.department)
        setStep(2);
      else setStep(3);

      scrollToError();
    } else {
      toast.error(result.message || "Something went wrong");
    }
  };

  let buttonLabel;
  if (isPending) {
    buttonLabel = (
      <>
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Processing...
      </>
    );
  } else if (initialData) {
    buttonLabel = "Update Staff Member";
  } else {
    buttonLabel = "Register Staff Member";
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onChange={() => setIsDirty(true)}
      className="space-y-8 pb-12 max-w-4xl mx-auto"
    >
      <FormWizardProgress step={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {step === 1 && <StepPersonalInfo initialData={initialData} errors={errors} />}

          {step === 2 && <StepProfessionalDetails initialData={initialData} errors={errors} />}

          {step === 3 && <StepPortalPay initialData={initialData} errors={errors} />}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between gap-4 pt-4">
        <div className="flex gap-3">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="h-12 px-6 rounded-xl border-none bg-slate-100 dark:bg-slate-800"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="h-12 px-6 rounded-xl"
          >
            Cancel
          </Button>
        </div>

        {step < totalSteps ? (
          <Button
            type="button"
            onClick={handleNext}
            className="gradient-primary h-12 px-8 rounded-xl shadow-lg shadow-blue-500/20"
          >
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            className="gradient-primary h-12 px-8 rounded-xl shadow-lg shadow-blue-500/20"
            disabled={isPending}
          >
            {buttonLabel}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
