"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { cn } from "@/lib/utils";
import type { SectionProps } from "./types";

const FEE_ROWS: { label: string; field: "fees.prePrimaryFee" | "fees.class1to5Fee" | "fees.class6to8Fee" | "fees.class9to10Fee" | "fees.class11to12Fee" }[] = [
  { label: "Pre-Primary (Nursery – UKG)",   field: "fees.prePrimaryFee"   },
  { label: "Class 1 – 5",                   field: "fees.class1to5Fee"    },
  { label: "Class 6 – 8",                   field: "fees.class6to8Fee"    },
  { label: "Class 9 – 10",                  field: "fees.class9to10Fee"   },
  { label: "Class 11 – 12",                 field: "fees.class11to12Fee"  },
];

export default function FeeStructureSection({
  control,
  register,
  watch,
  setValue,
}: SectionProps) {
  const { fields: customFeeHeads, append, remove } = useFieldArray({
    control,
    name: "fees.customFeeHeads",
  });

  const feeMode = watch("fees.feeMode") || "simple";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">Fee Structure</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Annual fee details — simple overview or grade-wise breakdown
        </p>
      </div>

      {/* ── Mode Toggle ───────────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
            Display Mode
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {(["simple", "detailed"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setValue("fees.feeMode", mode)}
                className={`p-3 rounded-xl border-2 text-center transition-colors font-heading text-label capitalize ${
                  feeMode === mode
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-100 bg-gray-50 text-gray-500 hover:border-blue-200 hover:bg-blue-50/50"
                }`}
              >
                {mode === "simple" ? "Simple" : "Grade-wise"}
              </button>
            ))}
          </div>
          <p className="font-body text-meta text-gray-400">
            {feeMode === "simple"
              ? "Show one average annual fee — best for most schools."
              : "Show fee range broken down by class group."}
          </p>
        </CardContent>
      </Card>

      {/* ── Simple Mode ───────────────────────────────────── */}
      {feeMode === "simple" && (
        <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
          <CardContent className="p-6 space-y-5">
            <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
              Average Annual Fee
            </p>

            <FormField label="Annual Fee (₹)" className="max-w-xs">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-body text-gray-400">
                  ₹
                </span>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 45000"
                  className={cn(inputClass, "pl-7")}
                  {...register("fees.averageAnnualFee")}
                />
              </div>
              <p className="font-body text-meta text-gray-400 mt-1">
                Approximate average across all classes
              </p>
            </FormField>
          </CardContent>
        </Card>
      )}

      {/* ── Detailed Mode ─────────────────────────────────── */}
      {feeMode === "detailed" && (
        <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
          <CardContent className="p-6 space-y-5">
            <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
              Grade-wise Annual Fee (₹)
            </p>

            <div className="space-y-3">
              {FEE_ROWS.map(({ label, field }) => (
                <div key={field} className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3">
                  <p className="font-heading text-label text-gray-700">{label}</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-body text-gray-400">
                      ₹
                    </span>
                    <Input
                      type="number"
                      min={0}
                      placeholder="e.g. 40000"
                      className={cn(inputClass, "pl-7")}
                      {...register(field)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Custom Fee Heads ──────────────────────────────── */}
      <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
                Additional Fee Heads
              </p>
              <p className="font-body text-meta text-gray-400 mt-0.5">
                Transport, hostel, uniform, books, etc.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ label: "", value: "", fieldType: "text" })}
              className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 font-heading text-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add fee head
            </Button>
          </div>

          {customFeeHeads.length === 0 && (
            <p className="font-body text-meta text-gray-400 text-center py-3">
              No additional fee heads. Add items like transport fee, hostel fee, uniform charges, etc.
            </p>
          )}

          <div className="space-y-3">
            {customFeeHeads.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <Input
                  placeholder="Fee head (e.g. Transport Fee)"
                  className={cn(inputClass, "flex-1")}
                  {...register(`fees.customFeeHeads.${index}.label`)}
                />
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-body text-gray-400">
                    ₹
                  </span>
                  <Input
                    placeholder="Amount"
                    className={cn(inputClass, "pl-7")}
                    {...register(`fees.customFeeHeads.${index}.value`)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}