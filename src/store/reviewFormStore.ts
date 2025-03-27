"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ReviewFormSchema } from "@/schemas/reviewForm";

type ReviewFormState = Partial<ReviewFormSchema> & {
  setData: (data: Partial<ReviewFormSchema>) => void;
  reset: () => void;
  currentStep: number;
  setStep: (step: number) => void;
  isPendingConcert: boolean;
  setIsPendingConcert: (isPending: boolean) => void;
};

export const useReviewFormStore = create<ReviewFormState>()(
  persist(
    (set) => ({
      currentStep: 1,
      isPendingConcert: false,
      setStep: (step) => set({ currentStep: step }),
      setData: (data) => set((state) => ({ ...state, ...data })),
      setIsPendingConcert: (isPending) => set({ isPendingConcert: isPending }),
      reset: () =>
        set({
          currentStep: 1,
          concertId: undefined,
          reviewContent: undefined,
          isPendingConcert: false,
        }),
    }),
    {
      name: "review-form-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
