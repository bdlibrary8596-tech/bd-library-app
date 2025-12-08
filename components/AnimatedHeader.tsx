
import React from 'react';

export const AnimatedHeader: React.FC = () => {
  return (
    <div className="relative rounded-xl overflow-hidden p-8 text-white bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 shadow-lg mb-8">
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px) rotate(5deg); opacity: 0.6; }
          100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.3; }
        }
        @keyframes float-reverse {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(15px) translateX(-15px) rotate(-5deg); opacity: 0.7; }
          100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.4; }
        }
        .float-1 { animation: float 8s ease-in-out infinite; }
        .float-2 { animation: float-reverse 10s ease-in-out infinite; }
        .float-3 { animation: float 12s ease-in-out infinite; }
      `}</style>
      
      {/* Floating Icons */}
      <div className="absolute inset-0 z-0">
        <span className="absolute top-1/4 left-1/4 text-4xl float-1">📚</span>
        <span className="absolute top-1/2 right-1/4 text-3xl float-2">💡</span>
        <span className="absolute bottom-1/4 left-1/3 text-5xl float-3">🎓</span>
        <span className="absolute top-10 right-10 text-2xl float-1">📝</span>
        <span className="absolute bottom-10 left-10 text-4xl float-2">🧑‍💻</span>
      </div>
      
      <div className="relative z-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold drop-shadow-md">
          Welcome to the B.D Library Platform
        </h1>
        <p className="mt-2 text-md opacity-90">
          Track fees, study smart, and explore the new student store.
        </p>
      </div>
    </div>
  );
};
