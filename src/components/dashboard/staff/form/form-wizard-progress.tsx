"use client";

import * as React from "react";
import { User, Briefcase, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormWizardProgressProps {
  step: number;
}

function getStepClass(step: number, stepId: number): string {
  if (step === stepId) {
    return "bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-lg scale-110";
  }
  if (step > stepId) {
    return "bg-emerald-500 text-white";
  }
  return "bg-slate-100 dark:bg-slate-800 text-slate-400";
}

export function FormWizardProgress({ step }: Readonly<FormWizardProgressProps>) {
  const steps = [
    { id: 1, label: "Personal", icon: User },
    { id: 2, label: "Professional", icon: Briefcase },
    { id: 3, label: "Portal & Pay", icon: Wallet },
  ];

  return (
    <div className="flex items-center justify-between mb-8 px-4">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
                getStepClass(step, s.id),
              )}
            >
              <s.icon className="h-5 w-5" />
            </div>
            <span
              className={cn(
                "text-[10px] uppercase font-bold tracking-widest transition-colors",
                step === s.id ? "text-blue-600" : "text-slate-400",
              )}
            >
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
  );
}
