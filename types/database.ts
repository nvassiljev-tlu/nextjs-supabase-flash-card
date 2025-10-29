export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Card {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
  statistics?: Statistics[];
}

export interface Statistics {
  id: string;
  card_id: string;
  correct_count: number;
  wrong_count: number;
  last_attempt: string | null;
  attempt_date: string;
  created_at: string;
  cards?: {
    question: string;
    answer: string;
    categories?: {
      name: string;
    };
  };
}
