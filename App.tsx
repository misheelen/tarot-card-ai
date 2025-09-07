
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, DrawnCard, TarotInterpretation } from './types';
import { TAROT_DECK } from './constants';
import { getTarotReading } from './services/geminiService';
import TarotCardComponent from './components/TarotCard';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [deck, setDeck] = useState([...TAROT_DECK]);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [interpretation, setInterpretation] = useState<TarotInterpretation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shuffleDeck = () => {
    let shuffled = [...TAROT_DECK];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  const startGame = () => {
    setError(null);
    setInterpretation(null);
    setDrawnCards([]);
    setDeck(shuffleDeck());
    setGameState('drawing');
  };

  const drawCard = useCallback(() => {
    if (drawnCards.length >= 3 || deck.length === 0) return;

    const positions: Array<'Past' | 'Present' | 'Future'> = ['Past', 'Present', 'Future'];
    const newCard = deck.pop();
    if (newCard) {
      const drawnCard: DrawnCard = {
        ...newCard,
        id: Date.now() + Math.random(),
        isFlipped: false,
        position: positions[drawnCards.length],
      };
      setDrawnCards(prev => [...prev, drawnCard]);
    }
  }, [deck, drawnCards]);
  
  useEffect(() => {
    if(drawnCards.length === 3) {
      setGameState('reading');
    }
  }, [drawnCards]);

  const handleFlipCard = (cardId: number) => {
    const newDrawnCards = drawnCards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setDrawnCards(newDrawnCards);

    // Check if all cards are now flipped to trigger reading
    if (newDrawnCards.every(c => c.isFlipped)) {
        fetchInterpretation(newDrawnCards);
    }
  };

  const fetchInterpretation = useCallback(async (cards: DrawnCard[]) => {
      setGameState('interpreting');
      setIsLoading(true);
      setError(null);
      try {
        const result = await getTarotReading(cards);
        setInterpretation(result);
        setDrawnCards(prevCards => prevCards.map(card => {
            if (card.position === 'Past') return { ...card, interpretation: result.past };
            if (card.position === 'Present') return { ...card, interpretation: result.present };
            if (card.position === 'Future') return { ...card, interpretation: result.future };
            return card;
        }));
        setGameState('finished');
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setIsLoading(false);
      }
  }, []);

  const renderGameState = () => {
    switch (gameState) {
      case 'welcome':
        return (
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-amber-200 mb-4">Нууцлаг мэргэч</h1>
            <p className="text-lg md:text-xl text-amber-100/80 mb-8 max-w-2xl mx-auto">
              Дижитал огторгуйн мандал руу гүн ширт. Өнгөрснөө тодруул, Одоогоо ухаар, Ирээдүйгээ нээ..
            </p>
            <button
              onClick={startGame}
              className="bg-amber-400 text-indigo-900 font-bold py-3 px-8 rounded-full shadow-lg shadow-amber-500/20 hover:bg-amber-300 transition-all duration-300 transform hover:scale-105"
            >
              Begin Your Reading
            </button>
          </div>
        );
      
      case 'drawing':
        return (
          <div className="flex flex-col items-center animate-fade-in">
             <h2 className="text-3xl text-amber-200 mb-2">Awaiting the Draw</h2>
             <p className="text-amber-100/80 mb-8">Click the deck three times to reveal your fate.</p>
             <div className="flex items-center justify-center space-x-4 mb-8 h-80 md:h-96">
                {drawnCards.map((card, index) => (
                    <div key={card.id} className="w-48 h-80 md:w-60 md:h-96 border-2 border-dashed border-amber-300/30 rounded-xl flex items-center justify-center animate-fade-in">
                       <p className="text-amber-200/50">{['Past', 'Present', 'Future'][index]}</p>
                    </div>
                ))}
                {Array(3 - drawnCards.length).fill(0).map((_, index) => (
                     <div key={index} className="w-48 h-80 md:w-60 md:h-96 border-2 border-dashed border-amber-300/30 rounded-xl flex items-center justify-center">
                         <p className="text-amber-200/50">{['Past', 'Present', 'Future'][drawnCards.length + index]}</p>
                     </div>
                ))}
             </div>
             <div onClick={drawCard} className="relative w-48 h-80 md:w-60 md:h-96 cursor-pointer group">
                <div className="absolute w-full h-full rounded-xl bg-indigo-900 border-2 border-amber-300/50 -translate-x-2 -translate-y-2 transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0"></div>
                <div className="absolute w-full h-full rounded-xl bg-indigo-900 border-2 border-amber-300/50 -translate-x-1 -translate-y-1 transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0"></div>
                 <div className="relative w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 border-2 border-amber-300/70 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                     <p className="text-amber-200 font-bold">Draw a Card</p>
                 </div>
             </div>
          </div>
        );
        
      case 'reading':
      case 'interpreting':
      case 'finished':
        return (
          <div className="flex flex-col items-center w-full animate-fade-in">
              <h2 className="text-3xl text-amber-200 mb-2">
                {gameState === 'reading' && 'Reveal Your Cards'}
                {gameState === 'interpreting' && 'Consulting the Oracle...'}
                {gameState === 'finished' && 'Your Reading is Complete'}
              </h2>
               <p className="text-amber-100/80 mb-8 h-6">
                {gameState === 'reading' && 'Click each card to turn it over.'}
               </p>
               <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
                {drawnCards.map(card => (
                  <TarotCardComponent key={card.id} card={card} onFlip={() => handleFlipCard(card.id)} canFlip={gameState === 'reading'} />
                ))}
               </div>
               
               {isLoading && <LoadingSpinner />}
               
               {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
               
               {gameState === 'finished' && interpretation && (
                  <div className="max-w-3xl text-center bg-black/30 p-6 rounded-xl animate-fade-in">
                      <h3 className="text-2xl text-amber-300 mb-4">Summary</h3>
                      <p className="text-amber-100/90 whitespace-pre-wrap">{interpretation.summary}</p>
                      <button
                        onClick={startGame}
                        className="mt-6 bg-amber-400 text-indigo-900 font-bold py-2 px-6 rounded-full shadow-lg shadow-amber-500/20 hover:bg-amber-300 transition-all duration-300 transform hover:scale-105"
                      >
                       New Reading
                      </button>
                  </div>
               )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center justify-center p-4 overflow-hidden bg-gradient-radial from-indigo-900 via-purple-950 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2032%2032%22%20width=%2232%22%20height=%2232%22%20fill=%22none%22%20stroke=%22%23a78bfa80%22%3E%3Cpath%20d=%22M0%20.5%20L32%20.5%20M.5%200%20L.5%2032%22/%3E%3C/svg%3E')] opacity-10"></div>
      <div className="relative z-10 w-full flex items-center justify-center min-h-screen">
         {renderGameState()}
      </div>
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
        .animate-fade-in { animation: fadeIn 1s ease-in-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .bg-gradient-radial {
            background-image: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </main>
  );
};

export default App;
