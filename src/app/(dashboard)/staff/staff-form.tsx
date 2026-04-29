"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { createStaff, updateStaff } from "./actions";

export function StaffForm({ initialData }: { initialData?: any }) {
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();

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
      toast.success(
        initialData
          ? "Staff record updated"
          : "Staff registered and user account created",
      );
      router.push("/staff");
      router.refresh();
    } else {
      if (result.errors) {
        setErrors(result.errors);
      } else {
        toast.error(result.message || "Something went wrong");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      <div className="grid gap-6">
        <Card className="border-none shadow-sm glass">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Employee Information
            </CardTitle>
            <CardDescription>
              Basic professional and personal details.
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
                  <SelectTrigger className="bg-slate-50/50 dark:bg-slate-900/50 border-none">
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

        <Card className="border-none shadow-sm glass">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Portal Access & Contact
            </CardTitle>
            <CardDescription>
              Credentials and contact info for the employee.
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
                <Label htmlFor="email">Email Address (Portal Username)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={initialData?.email}
                  required
                  placeholder="employee@school.com"
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
                {errors.email && (
                  <p className="text-xs text-rose-500">{errors.email[0]}</p>
                )}
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
                {errors.phoneNumber && (
                  <p className="text-xs text-rose-500">
                    {errors.phoneNumber[0]}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm glass">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Employment & Payroll
            </CardTitle>
            <CardDescription>
              Contractual and financial details.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select
                  name="employmentType"
                  defaultValue={initialData?.employmentType || "PERMANENT"}
                >
                  <SelectTrigger className="bg-slate-50/50 dark:bg-slate-900/50 border-none">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERMANENT">Permanent</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                  </SelectContent>
                </Select>
                {errors.employmentType && (
                  <p className="text-xs text-rose-500">
                    {errors.employmentType[0]}
                  </p>
                )}
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
                {errors.baseSalary && (
                  <p className="text-xs text-rose-500">
                    {errors.baseSalary[0]}
                  </p>
                )}
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

      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="gradient-primary px-8 h-12 text-base font-semibold shadow-lg shadow-blue-500/20"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : initialData ? (
            "Update Staff Member"
          ) : (
            "Register Staff Member"
          )}
        </Button>
      </div>
    </form>
  );
}
