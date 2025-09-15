import React, { useState, useCallback, useEffect } from 'react';
import { GameState, DrawnCard, TarotInterpretation, ReadingType } from './types';
import { TAROT_DECK } from './constants';
import { getTarotReading, getDailyReading } from './services/geminiService';
import TarotCardComponent from './components/TarotCard';
import LoadingSpinner from './components/LoadingSpinner';
import UnlockScreen from './components/LoginScreen';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [readingType, setReadingType] = useState<ReadingType | null>(null);
  const [deck, setDeck] = useState([...TAROT_DECK]);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [interpretation, setInterpretation] = useState<TarotInterpretation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullReadingUnlocked, setIsFullReadingUnlocked] = useState(false);
  const [showUnlockForm, setShowUnlockForm] = useState(false);
  
  useEffect(() => {
    const unlocked = localStorage.getItem('mystic-oracle-full-unlocked');
    if (unlocked === 'true') {
      setIsFullReadingUnlocked(true);
    }
  }, []);

  const handleUnlockSubmit = (code: string): boolean => {
    const validCoupon = process.env.COUPON_KEY;
    if (validCoupon && code.trim() === validCoupon) {
      localStorage.setItem('mystic-oracle-full-unlocked', 'true');
      setIsFullReadingUnlocked(true);
      setShowUnlockForm(false);
      return true;
    }
    return false;
  };

  const shuffleDeck = () => {
    let shuffled = [...TAROT_DECK];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  const resetGame = () => {
    setGameState('welcome');
    setReadingType(null);
    setError(null);
    setInterpretation(null);
    setDrawnCards([]);
    setShowUnlockForm(false);
  };

  const startGame = (type: ReadingType) => {
    setReadingType(type);
    setError(null);
    setInterpretation(null);
    setDrawnCards([]);
    setDeck(shuffleDeck());
    setGameState('drawing');
    setShowUnlockForm(false);
  };

  const startNewReadingSameType = () => {
    if (readingType) {
      startGame(readingType);
    }
  };

  const drawCard = useCallback(() => {
    if (!readingType || deck.length === 0) return;

    const maxCards = readingType === 'three-card' ? 3 : 1;
    if (drawnCards.length >= maxCards) return;

    const positions: Array<'Past' | 'Present' | 'Future' | 'Daily'> = 
        readingType === 'three-card' ? ['Past', 'Present', 'Future'] : ['Daily'];
        
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
  }, [deck, drawnCards, readingType]);
  
  useEffect(() => {
    if (!readingType) return;
    const maxCards = readingType === 'three-card' ? 3 : 1;
    if(drawnCards.length === maxCards) {
      setGameState('reading');
    }
  }, [drawnCards.length, readingType]);

  const handleFlipCard = (cardId: number) => {
    setDrawnCards(prevDrawnCards =>
      prevDrawnCards.map(c =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    );
  };

  const fetchThreeCardInterpretation = useCallback(async (cards: DrawnCard[]) => {
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
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setIsLoading(false);
        setGameState('finished');
      }
  }, []);
  
  const fetchDailyInterpretation = useCallback(async (card: DrawnCard) => {
      setGameState('interpreting');
      setIsLoading(true);
      setError(null);
      try {
        const result = await getDailyReading(card);
        setDrawnCards(prevCards => prevCards.map(c => 
            c.id === card.id ? { ...c, interpretation: result } : c
        ));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setIsLoading(false);
        setGameState('finished');
      }
  }, []);

  useEffect(() => {
    if (gameState !== 'reading' || !readingType) return;
    
    const allFlipped = drawnCards.length > 0 && drawnCards.every(card => card.isFlipped);

    if (allFlipped) {
      if (readingType === 'one-card') {
        fetchDailyInterpretation(drawnCards[0]);
      } else if (readingType === 'three-card') {
        fetchThreeCardInterpretation(drawnCards);
      }
    }
  }, [drawnCards, gameState, readingType, fetchDailyInterpretation, fetchThreeCardInterpretation]);

  const truncateText = (text: string | undefined, length: number = 70): string => {
    if (!text) return 'The vision is clouding...';
    if (text.length <= length) return text;
    return text.substring(0, text.lastIndexOf(' ', length)) + '...';
  };

  const renderGameState = () => {
    switch (gameState) {
      case 'welcome':
        return (
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-amber-200 mb-4">Таро хөзрийн тайлалч</h1>
            <p className="text-lg md:text-xl text-amber-100/80 mb-8 max-w-2xl mx-auto">
              Та ямар тайлал асуухаа сонгоно уу.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => startGame('three-card')}
                className="bg-amber-400 text-indigo-900 font-bold py-3 px-8 rounded-full shadow-lg shadow-amber-500/20 hover:bg-amber-300 transition-all duration-300 transform hover:scale-105"
              >
                Гурван хөзрийн тайлал (Өнгөрсөн, Одоо, Ирээдүй)
              </button>
              <button
                onClick={() => startGame('one-card')}
                className="bg-purple-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-purple-500/20 hover:bg-purple-400 transition-all duration-300 transform hover:scale-105"
              >
                Өдөр тутмын тайлал (Нэг хөзөр)
              </button>
            </div>
          </div>
        );
      
      case 'drawing':
        const maxCards = readingType === 'three-card' ? 3 : 1;
        const placeholders = readingType === 'three-card' 
            ? ['Past', 'Present', 'Future'] 
            : ['Daily'];
        return (
          <div className="flex flex-col items-center animate-fade-in">
             <h2 className="text-3xl text-amber-200 mb-2">Таныг хүлээж байна</h2>
             <p className="text-amber-100/80 mb-8">
                {readingType === 'three-card' 
                    ? 'Хөзрийн багцыг гурав товшоод, заяа төөргөө тайл.'
                    : 'Хөзрийн багцыг товшоод, өдрийн өнгөө тодорхойл.'
                }
             </p>
             <div className="flex flex-wrap items-center justify-center gap-4 mb-8 h-80 md:h-96">
                {drawnCards.map((card, index) => (
                    <div key={card.id} className="w-48 h-80 md:w-60 md:h-96 border-2 border-dashed border-amber-300/30 rounded-xl flex items-center justify-center animate-fade-in">
                       <p className="text-amber-200/50">{placeholders[index]}</p>
                    </div>
                ))}
                {Array(maxCards - drawnCards.length).fill(0).map((_, index) => (
                     <div key={index} className="w-48 h-80 md:w-60 md:h-96 border-2 border-dashed border-amber-300/30 rounded-xl flex items-center justify-center">
                         <p className="text-amber-200/50">{placeholders[drawnCards.length + index]}</p>
                     </div>
                ))}
             </div>
             <div onClick={drawCard} className="relative w-48 h-80 md:w-60 md:h-96 cursor-pointer group">
                <div className="absolute w-full h-full rounded-xl bg-indigo-900 border-2 border-amber-300/50 -translate-x-2 -translate-y-2 transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0"></div>
                <div className="absolute w-full h-full rounded-xl bg-indigo-900 border-2 border-amber-300/50 -translate-x-1 -translate-y-1 transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0"></div>
                 <div className="relative w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 border-2 border-amber-300/70 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                     <p className="text-amber-200 font-bold">Хөзрийн багцыг товших</p>
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
                {gameState === 'reading' && 'Хөзрөө нээнэ үү!'}
                {gameState === 'interpreting' && 'Түр хүлээнэ үү...'}
                {gameState === 'finished' && 'Таны тайлал бэлэн боллоо'}
              </h2>
               <p className="text-amber-100/80 mb-8 h-6">
                {gameState === 'reading' && 'Хөзөр дээр товшиж нээнэ үү.'}
                {gameState === 'interpreting' && 'Хөзрүүдийг тайлж байна...'}
                {gameState === 'finished' && !error && (isFullReadingUnlocked ? 'Доорх тайллыг уншина уу.' : 'Бүрэн тайллыг нээж уншина уу.')}
               </p>
               <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-8 mb-8">
                {drawnCards.map(card => {
                  const cardInterpretation = (gameState === 'finished' && !isFullReadingUnlocked)
                    ? truncateText(card.interpretation)
                    : card.interpretation;
                  return (
                    <TarotCardComponent 
                      key={card.id} 
                      card={{...card, interpretation: cardInterpretation}} 
                      onFlip={() => handleFlipCard(card.id)} 
                      canFlip={gameState === 'reading'} 
                    />
                  );
                })}
               </div>
               
               {isLoading && <LoadingSpinner />}
               
               {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
               
               {gameState === 'finished' && !error && (
                  isFullReadingUnlocked ? (
                    <div className="max-w-3xl w-full text-center p-6 rounded-xl animate-fade-in">
                        {readingType === 'three-card' && interpretation && (
                            <div className="bg-black/30 p-6 rounded-xl mb-6">
                              <h3 className="text-2xl text-amber-300 mb-4">Товч дүгнэлт</h3>
                              <p className="text-amber-100/90 whitespace-pre-wrap">{interpretation.summary}</p>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <button
                            onClick={startNewReadingSameType}
                            className="bg-amber-400 text-indigo-900 font-bold py-2 px-6 rounded-full shadow-lg shadow-amber-500/20 hover:bg-amber-300 transition-all duration-300 transform hover:scale-105"
                          >
                            {readingType === 'one-card' ? 'Дахин өдрийн зурхай' : 'Дахин гурван хөзрийн тайлал'}
                          </button>
                          <button
                            onClick={resetGame}
                            className="bg-purple-500 text-white font-bold py-2 px-6 rounded-full shadow-lg shadow-purple-500/20 hover:bg-purple-400 transition-all duration-300 transform hover:scale-105"
                          >
                            Нүүр хуудасруу буцах
                          </button>
                        </div>
                    </div>
                  ) : (
                    <div className="max-w-3xl w-full text-center p-6 rounded-xl animate-fade-in">
                      {showUnlockForm ? (
                        <UnlockScreen onUnlock={handleUnlockSubmit} />
                      ) : (
                        <div className="animate-fade-in">
                          <h3 className="text-2xl text-amber-300 mb-4">Тайллын үргэлжлэлийг үзэх...</h3>
                          <p className="text-amber-100/80 mb-6">Нууц кодоо оруулж, хувь заяаныхаа бүрэн тайллыг нээнэ үү.</p>
                          <button
                            onClick={() => setShowUnlockForm(true)}
                            className="bg-amber-400 text-indigo-900 font-bold py-3 px-8 rounded-full shadow-lg shadow-amber-500/20 hover:bg-amber-300 transition-all duration-300 transform hover:scale-105"
                          >
                            Бүрэн тайллыг нээх
                          </button>
                        </div>
                      )}
                    </div>
                  )
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
