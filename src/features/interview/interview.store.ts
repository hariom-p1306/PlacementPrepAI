import { create } from "zustand";
import { persist } from "zustand/middleware";
import { questions } from "@/data/questions";

interface Feedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvement_tips: string[];
  ideal_answer: string;
}

interface InterviewStore {
  currentIndex: number;
  answers: string[];
  scores: number[];
  feedbacks: Feedback[];

  interviewType: string;
  setInterviewType: (type: string) => void;

  nextQuestion: (answer: string) => "NEXT" | "COMPLETED";
  addFeedback: (feedback: Feedback) => void;
  reset: () => void;

  // 🔥 hydration fix
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set, get) => ({
      currentIndex: 0,
      answers: [],
      scores: [],
      feedbacks: [],

      interviewType: "HR",

      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setInterviewType: (type) => set({ interviewType: type }),

      nextQuestion: (answer) => {
        const { currentIndex, answers } = get();

        const updatedAnswers = [...answers, answer];

        if (currentIndex < questions.length - 1) {
          set({
            answers: updatedAnswers,
            currentIndex: currentIndex + 1,
          });
          return "NEXT";
        } else {
          set({ answers: updatedAnswers });
          return "COMPLETED";
        }
      },

      addFeedback: (feedback) => {
        set((state) => ({
          feedbacks: [...state.feedbacks, feedback],
          scores: [...state.scores, feedback.score],
        }));
      },

      reset: () => {
        set({
          currentIndex: 0,
          answers: [],
          scores: [],
          feedbacks: [],
          interviewType: "HR",
        });
      },
    }),
    {
      name: "interview-storage",

      // 🔥 hydration fix
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);