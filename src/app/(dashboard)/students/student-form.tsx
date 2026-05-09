"use client";

import { Loader2, User, GraduationCap, MapPin, ChevronRight, ChevronLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, scrollToError } from "@/lib/utils";
import { createStudent, enrollStudent, updateStudent } from "./actions";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

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
  const [errors, setErrors] = useState<any>({});
  const [selectedClass, setSelectedClass] = useState<string>(
    initialData?.enrollments?.[0]?.classId || "",
  );
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useUnsavedChanges(isDirty);

  const totalSteps = initialData ? 2 : 3; // Enrollment details hidden for update
  const sections = classes.find((c) => c.id === selectedClass)?.sections || [];

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    // Simple validation before next step
    if (step === 1) {
      const form = formRef.current;
      if (form) {
        const fullName = (form.elements.namedItem("fullName") as HTMLInputElement)?.value;
        const admissionNumber = (form.elements.namedItem("admissionNumber") as HTMLInputElement)?.value;
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
            toast.warning(
              "Student created but enrollment failed. Please enroll manually.",
            );
            router.push(`/students/${result.studentId}`);
            return;
          }
        }
      }

      if (result.success) {
        setIsDirty(false);
        toast.success(
          initialData ? "Student updated" : "Student registered and enrolled",
        );
        router.push("/students");
        router.refresh();
      } else if (result.errors) {
        setErrors(result.errors);
        // Find which step has errors
        if (result.errors.fullName || result.errors.admissionNumber || result.errors.dateOfBirth) setStep(1);
        else if (!initialData && (result.errors.classId || result.errors.academicYearId)) setStep(2);
        else setStep(totalSteps);
        
        scrollToError();
      } else {
        toast.error(result.message || "Something went wrong");
      }
    } catch (_error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  const steps = [
    { id: 1, title: "Personal", icon: User },
    ...(initialData ? [] : [{ id: 2, title: "Enrollment", icon: GraduationCap }]),
    { id: initialData ? 2 : 3, title: "Contact", icon: MapPin },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-10 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
        <div className="relative z-10 flex justify-between">
          {steps.map((s, i) => (
            <div key={s.id} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                  step >= s.id
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                    : "bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800",
                )}
              >
                <s.icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "mt-2 text-[10px] font-black uppercase tracking-widest",
                  step >= s.id ? "text-primary" : "text-slate-400",
                )}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
        <motion.div
           className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0"
           initial={{ width: "0%" }}
           animate={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
           transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <form ref={formRef} onSubmit={handleSubmit} onChange={() => setIsDirty(true)} className="space-y-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-none shadow-premium dark-card-border overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 p-8 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-2xl font-black font-outfit">Personal Information</CardTitle>
                  <CardDescription className="font-medium">Basic details about the student.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="fullName" className="font-bold text-xs uppercase tracking-widest text-slate-500">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        defaultValue={initialData?.fullName}
                        required
                        placeholder="e.g. John Doe"
                        className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl"
                      />
                      {errors.fullName && <p className="text-xs text-rose-500">{errors.fullName[0]}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="admissionNumber" className="font-bold text-xs uppercase tracking-widest text-slate-500">Admission #</Label>
                      <Input
                        id="admissionNumber"
                        name="admissionNumber"
                        defaultValue={initialData?.admissionNumber}
                        required
                        placeholder="ADM-001"
                        className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl"
                      />
                      {errors.admissionNumber && <p className="text-xs text-rose-500">{errors.admissionNumber[0]}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="dateOfBirth" className="font-bold text-xs uppercase tracking-widest text-slate-500">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        defaultValue={initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split("T")[0] : ""}
                        required
                        className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gender" className="font-bold text-xs uppercase tracking-widest text-slate-500">Gender</Label>
                      <Select name="gender" defaultValue={initialData?.gender || "UNSPECIFIED"}>
                        <SelectTrigger className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                          <SelectItem value="UNSPECIFIED">Unspecified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="admissionDate" className="font-bold text-xs uppercase tracking-widest text-slate-500">Admission Date</Label>
                      <Input
                        id="admissionDate"
                        name="admissionDate"
                        type="date"
                        defaultValue={initialData?.admissionDate ? new Date(initialData.admissionDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}
                        required
                        className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && !initialData && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-none shadow-premium dark-card-border overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 p-8 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-2xl font-black font-outfit">Enrollment Details</CardTitle>
                  <CardDescription className="font-medium">Assign the student to a class.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 grid md:grid-cols-3 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="academicYearId" className="font-bold text-xs uppercase tracking-widest text-slate-500">Academic Year</Label>
                    <Select name="academicYearId" defaultValue={academicYears.find((y) => y.isActive)?.id}>
                      <SelectTrigger className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name} {year.isActive && "(Active)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="classId" className="font-bold text-xs uppercase tracking-widest text-slate-500">Class</Label>
                    <Select name="classId" onValueChange={(val: string | null) => setSelectedClass(val ?? "")}>
                      <SelectTrigger className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sectionId" className="font-bold text-xs uppercase tracking-widest text-slate-500">Section</Label>
                    <Select name="sectionId" disabled={!selectedClass}>
                      <SelectTrigger className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl">
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === totalSteps && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-none shadow-premium dark-card-border overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 p-8 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-2xl font-black font-outfit">Contact Information</CardTitle>
                  <CardDescription className="font-medium">Optional contact details.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest text-slate-500">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={initialData?.email || ""}
                        placeholder="student@example.com"
                        className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phoneNumber" className="font-bold text-xs uppercase tracking-widest text-slate-500">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        defaultValue={initialData?.phoneNumber || ""}
                        placeholder="+1 (555) 000-0000"
                        className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address" className="font-bold text-xs uppercase tracking-widest text-slate-500">Residential Address</Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={initialData?.address || ""}
                      placeholder="e.g. 123 Main St, City"
                      className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>
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
            {step === 1 ? "Cancel" : <><ChevronLeft className="mr-2 h-4 w-4" /> Previous</>}
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
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> {initialData ? "Update Student" : "Complete Registration"}</>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
