import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0">
        <img
          src="/Chess4.jpeg"
          alt="Chess Background"
          className="w-full h-full object-cover lg:block hidden "
        />
        <img
          src="/Chess3.jpeg"
          className="w-full h-full object-cover lg:hidden"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8  text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-5xl lg:text-7xl font-bold">
            <span className="text-white">Master Chess with</span>

            <span className="bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
              AI
            </span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/game")}
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-200 to-blue-500 rounded-lg text-black font-semibold text-lg transition-all duration-300 hover:bg-green-500 hover:scale-105 backdrop-blur-sm"
            >
              Challenge AI
              <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
};

export default Landing;
