
import React from 'react';
import { DrawnCard } from '../types';

interface TarotCardProps {
  card: DrawnCard;
  onFlip: () => void;
  canFlip: boolean;
}

const TarotCardComponent: React.FC<TarotCardProps> = ({ card, onFlip, canFlip }) => {
  const { name, isFlipped, position, interpretation } = card;

  const handleCardClick = () => {
    if (canFlip && !isFlipped) {
      onFlip();
    }
  };
  
  return (
    <div className="w-48 h-80 md:w-60 md:h-96 perspective-1000 group">
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''} ${canFlip && !isFlipped ? 'cursor-pointer hover:scale-105' : ''}`}
        onClick={handleCardClick}
      >
        {/* Card Back */}
        <div className="absolute w-full h-full backface-hidden rounded-xl shadow-lg shadow-black/50 border-2 border-amber-300/50 bg-indigo-900 flex items-center justify-center p-4 bg-gradient-to-br from-indigo-900 to-purple-900">
          <div className="w-full h-full border-2 border-amber-300/70 rounded-md flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-amber-300/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 01-1.414 1.414L12 6.414l-2.293 2.293a1 1 0 01-1.414-1.414L10 5m0 14l2.293-2.293a1 1 0 011.414 1.414L12 19.586l2.293-2.293a1 1 0 011.414 1.414L14 21m-4-4l-2.293 2.293a1 1 0 01-1.414-1.414L8 15.586l-2.293-2.293a1 1 0 011.414-1.414L9 14m10-4l-2.293-2.293a1 1 0 00-1.414 1.414L16 11.586l-2.293 2.293a1 1 0 001.414 1.414L18 13m-4-4l-2.293-2.293a1 1 0 00-1.414 1.414L12 9.586l2.293 2.293a1 1 0 001.414-1.414L14 9" />
             </svg>
          </div>
        </div>
        
        {/* Card Front */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-lg shadow-black/50 border-2 border-amber-400 bg-gradient-to-br from-indigo-800 via-purple-900 to-slate-900 flex flex-col justify-between p-4">
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-bold text-amber-300">{name}</h3>
            <p className="text-sm text-amber-100/80">{position}</p>
          </div>
          <div className="w-full h-32 md:h-40 bg-slate-900/50 rounded-lg flex items-center justify-center border border-amber-400/30">
            <img src={`https://picsum.photos/seed/${name.replace(/\s/g, '')}/200/300`} alt={name} className="w-full h-full object-cover rounded-lg opacity-60"/>
          </div>
          <div className="text-center text-amber-100/90 text-xs md:text-sm overflow-y-auto h-20 md:h-24 p-1">
             {interpretation ? (
                 <p className="fade-in">{interpretation}</p>
             ) : (
                <p className="italic text-amber-200/50">The vision is clouding...</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarotCardComponent;
