import React, { useState } from 'react';

interface CouponScreenProps {
  onCouponSubmit: (code: string) => boolean;
}

const CouponScreen: React.FC<CouponScreenProps> = ({ onCouponSubmit }) => {
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onCouponSubmit(coupon);
    setError(null);
    if (!success) {
      setError('The stars do not align for this code. Please try again.');
      setCoupon('');
    } else {
      setError(null);
    }
  };

  return (
    <div className="text-center animate-fade-in flex flex-col items-center">
      <h1 className="text-5xl md:text-7xl font-bold text-amber-200 mb-4">Таро хөзрийн тайлалч</h1>
      <p className="text-lg md:text-xl text-amber-100/80 mb-12 max-w-2xl mx-auto">
        Нууц кодоо оруулж, Таро тайллыг ашиглана уу.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center w-full max-w-sm">
        <input
          type="text"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="Нууц кодоо энд бичнэ үү"
          className="bg-indigo-900/50 border-2 border-amber-300/50 rounded-full w-full py-3 px-6 text-center text-amber-200 placeholder-amber-200/40 focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all"
          aria-label="Access Code"
        />
        <button
          type="submit"
          className="bg-amber-400 text-indigo-900 font-bold py-3 px-12 rounded-full shadow-lg shadow-amber-500/20 hover:bg-amber-300 transition-all duration-300 transform hover:scale-105"
        >
          Нээх
        </button>
      </form>
      {error && (
        <p className="text-red-400 mt-4 bg-red-900/30 px-4 py-2 rounded-md">{error}</p>
      )}
      {/* <p className="text-xs text-gray-400 mt-8 max-w-md">
         Энэ бол хувийн уншлага. Таны код танд хиймэл оюун ухаанаар ажилладаг зөнчтэй харьцах боломжийг олгоно.
      </p>*/}
    </div>
  );
};

export default CouponScreen;
