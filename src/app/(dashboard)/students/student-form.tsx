"use client";

import { Loader2, ChevronRight, ChevronLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { scrollToError } from "@/lib/utils";
import { createStudent, enrollStudent, updateStudent } from "./actions";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import {
  FormWizardProgress,
  StepPersonalInfo,
  StepEnrollmentDetails,
  StepContactInfo,
} from "@/components/dashboard/students/form";

export function StudentForm({
  classes,
  academicYears,
  initialData,
}: Readonly<{
  classes: {
    id: string;
    name: string;
    sections: {
      id: string;
      name: string;
    }[];
  }[];
  academicYears: {
    id: string;
    name: string;
    startDate: Date | string;
    endDate: Date | string;
    isActive: boolean;
    isCurrent?: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
  }[];
  initialData?: {
    id: string;
    fullName: string;
    email?: string | null;
    phoneNumber?: string | null;
    gender: string;
    bloodGroup?: string | null;
    photoUrl?: string | null;
    address?: string | null;
    dateOfBirth?: Date | string | null;
    admissionNumber: string;
    admissionDate?: Date | string | null;
    status: string;
    enrollments: {
      id: string;
      classId: string;
      sectionId: string | null;
      academicYearId: string;
    }[];
    guardians: {
      guardianId: string;
    }[];
  } | null;
}>) {
  const [step, setStep] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [selectedClass, setSelectedClass] = useState<string>(
    initialData?.enrollments?.[0]?.classId || "",
  );
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useUnsavedChanges(isDirty);

  const totalSteps = initialData ? 2 : 3; // Enrollment details hidden for update

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step === 1) {
      const form = formRef.current;
      if (form) {
        const fullName = (form.elements.namedItem("fullName") as HTMLInputElement)?.value;
        const admissionNumber = (form.elements.namedItem("admissionNumber") as HTMLInputElement)
          ?.value;
        if (!fullName || !admissionNumber) {
          toast.error("Please fill in required fields");
          return;
        }
      }
    }
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    function toastMessage(result: {
      success: boolean;
      message?: string;
      errors?: Record<string, string[] | undefined>;
    }) {
      if (result.success) {
        setIsDirty(false);
        toast.success(initialData ? "Student updated" : "Student registered and enrolled");
        router.push("/students");
        router.refresh();
      } else if (result.errors) {
        setErrors(result.errors as Record<string, string[]>);
        // Find which step has errors
        if (result.errors.fullName || result.errors.admissionNumber || result.errors.dateOfBirth)
          setStep(1);
        else if (!initialData && (result.errors.classId || result.errors.academicYearId))
          setStep(2);
        else setStep(totalSteps);

        scrollToError();
      } else {
        toast.error(result.message || "Something went wrong");
      }
    }

    try {
      let result;
      if (initialData) {
        result = await updateStudent(initialData.id, data);
      } else {
        result = await createStudent(data);

        if (result.success && result.studentId) {
          const enrollmentResult = await enrollStudent({
            studentId: result.studentId,
            academicYearId: data.academicYearId as string,
            classId: data.classId as string,
            sectionId: data.sectionId as string,
          });

          if (!enrollmentResult.success) {
            toast.warning("Student created but enrollment failed. Please enroll manually.");
            router.push(`/students/${result.studentId}`);
            return;
          }
        }
      }
      toastMessage(result);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <FormWizardProgress
        step={step}
        totalSteps={totalSteps}
        initialData={initialData ?? undefined}
      />

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onChange={() => setIsDirty(true)}
        className="space-y-8"
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <StepPersonalInfo initialData={initialData ?? undefined} errors={errors} />
            </motion.div>
          )}

          {step === 2 && !initialData && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <StepEnrollmentDetails
                classes={classes}
                academicYears={academicYears}
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
                errors={errors}
              />
            </motion.div>
          )}

          {step === totalSteps && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <StepContactInfo initialData={initialData ?? undefined} errors={errors} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={step === 1 ? () => router.back() : handlePrev}
            className="h-12 px-8 rounded-xl font-bold"
          >
            {step === 1 ? (
              "Cancel"
            ) : (
              <>
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </>
            )}
          </Button>

          <div className="flex gap-4">
            {step < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                className="gradient-primary h-12 px-8 rounded-xl font-bold shadow-lg shadow-blue-500/20"
              >
                Next Step <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="gradient-primary px-8 h-12 text-base font-bold shadow-lg shadow-blue-500/20 rounded-xl"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />{" "}
                    {initialData ? "Update Student" : "Complete Registration"}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
