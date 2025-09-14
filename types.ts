
export interface TarotCard {
  name: string;
}

export interface DrawnCard extends TarotCard {
  id: number;
  isFlipped: boolean;
  position: 'Past' | 'Present' | 'Future' | 'Daily';
  interpretation?: string;
}

export type GameState = 'welcome' | 'drawing' | 'reading' | 'interpreting' | 'finished';

export type ReadingType = 'one-card' | 'three-card';

export interface TarotInterpretation {
  past: string;
  present: string;
  future: string;
  summary: string;
}
