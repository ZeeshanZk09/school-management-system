"use client";

import { 
  Loader2, 
  ShieldCheck, 
  User, 
  Briefcase, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Wallet
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn, scrollToError } from "@/lib/utils";
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
import { createStaff, updateStaff } from "./actions";

import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

export function StaffForm({ initialData }: Readonly<{ initialData?: any }>) {
  const [step, setStep] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<any>({});
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

    const result = initialData
      ? await updateStaff(initialData.id, data)
      : await createStaff(data);

    setIsPending(false);

    if (result.success) {
      setIsDirty(false);
      toast.success(
        initialData
          ? "Staff record updated"
          : "Staff registered and user account created",
      );
      router.push("/staff");
      router.refresh();
    } else if (result.errors) {
      setErrors(result.errors);
      // Determine which step has errors
      if (result.errors.fullName || result.errors.gender || result.errors.dateOfBirth) setStep(1);
      else if (result.errors.staffNumber || result.errors.designation || result.errors.department) setStep(2);
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
    <form ref={formRef} onSubmit={handleSubmit} onChange={() => setIsDirty(true)} className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Wizard Progress */}
      <div className="flex items-center justify-between mb-8 px-4">
        {[
          { id: 1, label: "Personal", icon: User },
          { id: 2, label: "Professional", icon: Briefcase },
          { id: 3, label: "Portal & Pay", icon: Wallet },
        ].map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
                  step === s.id
                    ? "bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-lg scale-110"
                    : step > s.id
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                )}
              >
                <s.icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-[10px] uppercase font-bold tracking-widest transition-colors",
                step === s.id ? "text-blue-600" : "text-slate-400"
              )}>
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div className="h-[2px] flex-1 mx-4 bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: step > s.id ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {step === 1 && (
            <Card className="border-none shadow-premium glass">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Basic personal details and identity.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={initialData?.fullName}
                  required
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
                {errors.fullName && (
                  <p className="text-xs text-rose-500">{errors.fullName[0]}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staffNumber">Staff ID / Employee #</Label>
                <Input
                  id="staffNumber"
                  name="staffNumber"
                  defaultValue={initialData?.staffNumber}
                  required
                  placeholder="e.g. EMP001"
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none uppercase"
                />
                {errors.staffNumber && (
                  <p className="text-xs text-rose-500">
                    {errors.staffNumber[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  name="designation"
                  defaultValue={initialData?.designation}
                  required
                  placeholder="e.g. Senior Teacher"
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
                {errors.designation && (
                  <p className="text-xs text-rose-500">
                    {errors.designation[0]}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  defaultValue={initialData?.department}
                  required
                  placeholder="e.g. Science"
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
                {errors.department && (
                  <p className="text-xs text-rose-500">
                    {errors.department[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  name="gender"
                  defaultValue={initialData?.gender || "UNSPECIFIED"}
                >
                  <SelectTrigger
                    id="gender"
                    className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                  >
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                    <SelectItem value="UNSPECIFIED">Unspecified</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-xs text-rose-500">{errors.gender[0]}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  defaultValue={
                    initialData?.dateOfBirth
                      ? new Date(initialData.dateOfBirth)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  required
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
                {errors.dateOfBirth && (
                  <p className="text-xs text-rose-500">
                    {errors.dateOfBirth[0]}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="joiningDate">Joining Date</Label>
                <Input
                  id="joiningDate"
                  name="joiningDate"
                  type="date"
                  defaultValue={
                    initialData?.joiningDate
                      ? new Date(initialData.joiningDate)
                          .toISOString()
                          .split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  }
                  required
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
                {errors.joiningDate && (
                  <p className="text-xs text-rose-500">
                    {errors.joiningDate[0]}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-none shadow-premium glass">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-emerald-500" />
              Professional Details
            </CardTitle>
            <CardDescription>
              Employment ID, designation, and department.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="staffNumber">Staff ID / Employee #</Label>
                <Input
                  id="staffNumber"
                  name="staffNumber"
                  defaultValue={initialData?.staffNumber}
                  required
                  placeholder="e.g. EMP001"
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none uppercase"
                />
                {errors.staffNumber && (
                  <p className="text-xs text-rose-500">
                    {errors.staffNumber[0]}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  name="designation"
                  defaultValue={initialData?.designation}
                  required
                  placeholder="e.g. Senior Teacher"
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
                {errors.designation && (
                  <p className="text-xs text-rose-500">
                    {errors.designation[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  defaultValue={initialData?.department}
                  required
                  placeholder="e.g. Science"
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
                {errors.department && (
                  <p className="text-xs text-rose-500">
                    {errors.department[0]}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="joiningDate">Joining Date</Label>
                <Input
                  id="joiningDate"
                  name="joiningDate"
                  type="date"
                  defaultValue={
                    initialData?.joiningDate
                      ? new Date(initialData.joiningDate)
                          .toISOString()
                          .split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  }
                  required
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
                {errors.joiningDate && (
                  <p className="text-xs text-rose-500">
                    {errors.joiningDate[0]}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <div className="grid gap-6">
          <Card className="border-none shadow-premium glass">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Wallet className="h-5 w-5 text-indigo-500" />
                Portal & Financial
              </CardTitle>
              <CardDescription>
                Credentials and payroll details.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
            {!initialData && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                    Account Auto-Creation
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    A user account will be created automatically. The default
                    password will be the Staff ID.
                  </p>
                </div>
              </div>
            )}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={initialData?.email}
                    required
                    placeholder="employee@school.com"
                    className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    defaultValue={initialData?.phoneNumber}
                    placeholder="+1 (555) 000-0000"
                    className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-premium glass">
            <CardContent className="pt-6 grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select
                    name="employmentType"
                    defaultValue={initialData?.employmentType || "PERMANENT"}
                  >
                    <SelectTrigger
                      id="employmentType"
                      className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                    >
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERMANENT">Permanent</SelectItem>
                      <SelectItem value="CONTRACT">Contract</SelectItem>
                      <SelectItem value="PART_TIME">Part Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="baseSalary">Monthly Base Salary</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      $
                    </span>
                    <Input
                      id="baseSalary"
                      name="baseSalary"
                      type="number"
                      defaultValue={initialData?.baseSalary || 0}
                      className="pl-7 bg-slate-50/50 dark:bg-slate-900/50 border-none"
                    />
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="qualification">Qualifications</Label>
                  <Input
                    id="qualification"
                    name="qualification"
                    defaultValue={initialData?.qualification}
                    placeholder="e.g. M.Ed, B.Sc"
                    className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="experience">Previous Experience</Label>
                  <Input
                    id="experience"
                    name="experience"
                    defaultValue={initialData?.experience}
                    placeholder="e.g. 5 years in high school"
                    className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
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
