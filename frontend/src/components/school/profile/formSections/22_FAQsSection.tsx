"use client";

import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Plus, Trash2, ChevronDown, HelpCircle } from "lucide-react";
import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import type { SectionProps } from "./types";

const textareaClass =
  "min-h-[80px] rounded-xl border border-gray-100 bg-gray-50 font-body text-body text-gray-800 placeholder:text-gray-400 focus-visible:ring-blue-400 focus:bg-white transition-colors resize-none";

const STARTER_FAQS = [
  { question: "What is the admission process?",      answer: "" },
  { question: "What are the school timings?",        answer: "" },
  { question: "Does the school provide transport?",  answer: "" },
  { question: "What is the fee structure?",          answer: "" },
];

export default function FAQsSection({
  control, register, watch,
}: SectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "faqs.list",
  });

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  function addFaq(question = "") {
    append({ question, answer: "" });
    setExpandedIndex(fields.length);
  }

  function addStarterFaqs() {
    STARTER_FAQS.forEach((faq) => append(faq));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-h2 font-bold text-blue-800">FAQs</h2>
        <p className="font-body text-body text-gray-400 mt-1">
          Answer common questions parents ask about your school
        </p>
      </div>

      {fields.length === 0 && (
        <Card className="border border-gray-100 shadow-card rounded-2xl bg-white">
          <CardContent className="p-6 space-y-3">
            <p className="font-heading text-label font-semibold text-gray-700 uppercase tracking-wide">
              Quick Start
            </p>
            <p className="font-body text-sm text-gray-400">
              Add commonly asked questions in one click, then fill in your answers.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={addStarterFaqs}
              className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 font-heading text-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add common FAQs
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
            <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="font-body text-sm text-gray-400">No FAQs added yet.</p>
          </div>
        ) : (
          fields.map((field, index) => {
            const isOpen = expandedIndex === index;
            const question = watch(`faqs.list.${index}.question`);

            return (
              <Card
                key={field.id}
                className="border border-gray-100 shadow-card rounded-2xl bg-white overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <p className="font-heading text-label font-semibold text-gray-700 flex-1 pr-4 truncate">
                    {question || `FAQ #${index + 1}`}
                  </p>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <CardContent className="px-5 pb-5 pt-0 space-y-4 border-t border-gray-50">
                    <FormField label="Question" className="pt-4">
                      <Input
                        placeholder="e.g. What is the admission process?"
                        className={inputClass}
                        {...register(`faqs.list.${index}.question`)}
                      />
                    </FormField>
                    <FormField label="Answer">
                      <Textarea
                        placeholder="Write a clear, helpful answer…"
                        className={textareaClass}
                        {...register(`faqs.list.${index}.answer`)}
                      />
                    </FormField>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => { remove(index); setExpandedIndex(null); }}
                        className="rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 font-heading text-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() => addFaq()}
          className="w-full rounded-xl border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 font-heading text-sm h-11"
        >
          <Plus className="w-4 h-4 mr-2" /> Add FAQ
        </Button>
      </div>
    </div>
  );
}