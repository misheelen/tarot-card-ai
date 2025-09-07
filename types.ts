
export interface TarotCard {
  name: string;
}

export interface DrawnCard extends TarotCard {
  id: number;
  isFlipped: boolean;
  position: 'Past' | 'Present' | 'Future';
  interpretation?: string;
}

export type GameState = 'welcome' | 'drawing' | 'reading' | 'interpreting' | 'finished';

export interface TarotInterpretation {
  past: string;
  present: string;
  future: string;
  summary: string;
}
