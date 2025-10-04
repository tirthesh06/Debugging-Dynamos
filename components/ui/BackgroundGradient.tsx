import React from 'react';

export const BackgroundGradient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative w-full h-full">
      <div className="absolute top-0 left-0 w-full h-full bg-gray-900 overflow-hidden">
        <div className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-blob top-[-50px] left-[-50px]"></div>
        <div className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-[-50px] right-[-50px]"></div>
        <div className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-indigo-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-[-50px] left-1/4"></div>
        <div className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-blob bottom-[-50px] right-1/4"></div>
      </div>
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
      <div className="relative z-10">{children}</div>
    </div>
  );
};