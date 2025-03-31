"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ReviewFormSchema } from "@/schemas/reviewForm";

type ReviewFormState = Partial<ReviewFormSchema> & {
  setData: (data: Partial<ReviewFormSchema>) => void;
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
        }),
    }),
    {
      name: "review-form-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
