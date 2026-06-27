"use client";

import * as React from "react";
import { User, GraduationCap, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FormWizardProgressProps {
  step: number;
  totalSteps: number;
  initialData?: Record<string, unknown>;
}

export function FormWizardProgress({
  step,
  totalSteps,
  initialData,
}: Readonly<FormWizardProgressProps>) {
  const steps = [
    { id: 1, title: "Personal", icon: User },
    ...(initialData ? [] : [{ id: 2, title: "Enrollment", icon: GraduationCap }]),
    { id: initialData ? 2 : 3, title: "Contact", icon: MapPin },
  ];

  return (
    <div className="mb-10 relative">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
      <div className="relative z-10 flex justify-between">
        {steps.map((s) => (
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
  );
}
