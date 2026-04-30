"use client";

import { DollarSign, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { createSalaryStructure } from "../actions";

export function SalaryStructureForm({
  staff,
  existingStructure,
}: Readonly<{
  staff: any;
  existingStructure?: any;
}>) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [basePay, setBasePay] = useState(
    existingStructure?.basePay?.toString() || "0",
  );
  const [validFrom, setValidFrom] = useState(
    existingStructure
      ? new Date(existingStructure.validFrom).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  );
  const [components, setComponents] = useState<any[]>(
    existingStructure?.components?.map((c: any) => ({
      id: Math.random().toString(36).substring(7),
      label: c.label,
      amount: c.amount.toString(),
      type: c.type,
    })) || [],
  );

  const addComponent = () => {
    setComponents([
      ...components,
      {
        id: Math.random().toString(36).substring(7),
        label: "",
        amount: "0",
        type: "ALLOWANCE",
      },
    ]);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id));
  };

  const updateComponent = (index: number, field: string, value: string) => {
    const newComponents = [...components];
    newComponents[index][field] = value;
    setComponents(newComponents);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const result = await createSalaryStructure(staff.id, {
      basePay: Number.parseFloat(basePay),
      validFrom: new Date(validFrom),
      components: components.map((c) => ({
        label: c.label,
        amount: Number.parseFloat(c.amount),
        type: c.type,
      })),
    });

    setIsPending(false);

    if (result.success) {
      toast.success("Salary structure updated");
      router.push(`/staff/${staff.id}`);
      router.refresh();
    } else {
      toast.error(result.message || "Failed to save");
    }
  };

  const totalAllowances = components
    .filter((c) => c.type === "ALLOWANCE")
    .reduce((sum, c) => sum + (Number.parseFloat(c.amount) || 0), 0);

  const totalDeductions = components
    .filter((c) => c.type === "DEDUCTION")
    .reduce((sum, c) => sum + (Number.parseFloat(c.amount) || 0), 0);

  const netPay = Number.parseFloat(basePay) + totalAllowances - totalDeductions;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-sm glass">
          <CardHeader>
            <CardTitle>Core Details</CardTitle>
            <CardDescription>
              Define base pay and its validity period.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePay">Base Salary (Monthly)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="basePay"
                    type="number"
                    className="pl-10 bg-slate-50 dark:bg-slate-900 border-none"
                    value={basePay}
                    onChange={(e) => setBasePay(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  className="bg-slate-50 dark:bg-slate-900 border-none"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="salaryComponents"
                  className="text-base font-bold"
                >
                  Salary Components
                </Label>
                <Button
                  type="button"
                  id="salaryComponents"
                  variant="outline"
                  size="sm"
                  onClick={addComponent}
                  className="h-8 border-dashed"
                >
                  <Plus className="mr-2 h-3 w-3" />
                  Add Component
                </Button>
              </div>

              <div className="space-y-3">
                {components.map((comp, index) => (
                  <div
                    key={comp.id}
                    className="flex gap-3 items-end group animate-in slide-in-from-left-2 duration-200"
                  >
                    <div className="flex-1 space-y-1.5">
                      <Label
                        htmlFor={`salaryComponents-${index}`}
                        className="text-[10px] uppercase font-bold text-slate-400"
                      >
                        Label
                      </Label>
                      <Input
                        id={`salaryComponents-${index}`}
                        placeholder="e.g. House Rent"
                        className="bg-slate-50 dark:bg-slate-900 border-none"
                        value={comp.label}
                        onChange={(e) =>
                          updateComponent(index, "label", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="w-32 space-y-1.5">
                      <Label
                        htmlFor={`salaryComponents-${index}-type`}
                        className="text-[10px] uppercase font-bold text-slate-400"
                      >
                        Type
                      </Label>
                      <Select
                        id={`salaryComponents-${index}-type`}
                        value={comp.type}
                        onValueChange={(val) =>
                          updateComponent(index, "type", val)
                        }
                      >
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALLOWANCE">Allowance</SelectItem>
                          <SelectItem value="DEDUCTION">Deduction</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32 space-y-1.5">
                      <Label
                        htmlFor={`salaryComponents-${index}-amount`}
                        className="text-[10px] uppercase font-bold text-slate-400"
                      >
                        Amount
                      </Label>
                      <Input
                        id={`salaryComponents-${index}-amount`}
                        type="number"
                        className="bg-slate-50 dark:bg-slate-900 border-none"
                        value={comp.amount}
                        onChange={(e) =>
                          updateComponent(index, "amount", e.target.value)
                        }
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeComponent(comp.id)}
                      className="text-slate-400 hover:text-rose-600 mb-0.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {components.length === 0 && (
                  <p className="text-sm text-slate-400 italic py-4 text-center border-2 border-dashed rounded-xl">
                    No allowances or deductions added.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm glass h-fit sticky top-24">
          <CardHeader>
            <CardTitle>Calculation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Base Salary</span>
              <span className="font-medium">
                Rs {Number.parseFloat(basePay).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Allowances</span>
              <span className="font-medium text-emerald-600">
                +Rs {totalAllowances.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Deductions</span>
              <span className="font-medium text-rose-600">
                -Rs {totalDeductions.toLocaleString()}
              </span>
            </div>
            <div className="pt-4 border-t flex justify-between items-end">
              <span className="font-bold">Net Monthly Pay</span>
              <span className="text-2xl font-black text-primary">
                Rs {netPay.toLocaleString()}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full gradient-primary h-12 rounded-xl shadow-lg"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Structure
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
