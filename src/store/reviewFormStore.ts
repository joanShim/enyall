"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ReviewFormSchema } from "@/schemas/reviewForm";

type ReviewFormState = Partial<ReviewFormSchema> & {
  selectedScheduleId?: string;
  setData: (
    data: Partial<ReviewFormSchema> & { selectedScheduleId?: string },
  ) => void;
  reset: () => void;
  currentStep: number;
  setStep: (step: number) => void;
  reviewImages: string[];
};

export const useReviewFormStore = create<ReviewFormState>()(
  persist(
    (set) => ({
      currentStep: 1,
      reviewImages: [],
      setStep: (step) => set({ currentStep: step }),
      setData: (data) => set((state) => ({ ...state, ...data })),
      reset: () =>
        set({
          currentStep: 1,
          concertId: undefined,
          reviewContent: undefined,
          reviewImages: [],
          selectedScheduleId: undefined,
        }),
    }),
    {
      name: "review-form-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
