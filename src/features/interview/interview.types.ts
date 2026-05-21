export interface Question {
  id: number;
  question: string;
}

export interface InterviewState {
  currentIndex: number;
  answers: string[];
}