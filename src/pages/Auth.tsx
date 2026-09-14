import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Auth: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-8 relative overflow-hidden"
      style={{
        background: `url('/assets/lunara-moon-bg.webp') center/cover no-repeat, linear-gradient(180deg, #0B1020 0%, #121A2E 50%, #0B1020 100%)`
      }}
    >
      <div className="absolute inset-0 bg-lunara-primary/40" />

      <div className="max-w-2xl mx-auto text-center space-y-10 animate-fade-in relative z-10">

        <div className="relative mb-8">
          <div className="mb-4">
            <span className="text-3xl sm:text-4xl tracking-[0.4em] font-garamond font-light text-pearl-mist">LUNARA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-garamond font-medium text-pearl-mist leading-tight mb-4">
            Begin Your Reflection
          </h1>
          <p className="text-lg font-garamond italic text-muted-stardust max-w-xl mx-auto">
            "Under the moonlight, we find ourselves. Every thought deserves a home, every moment a memory."
          </p>
        </div>

        <div className="lunara-glass-card p-8 sm:p-10 rounded-2xl">

          <div className="ornamental-divider mb-8"></div>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
            <Button
              size="lg"
              className="lunara-button font-garamond text-xl px-12 py-5 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden group"
              onClick={() => navigate('/login')}
            >
              <span className="relative z-10">Login</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="lunara-button-outline font-garamond text-xl px-12 py-5 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </div>

          <div className="text-center">
            <p className="text-base font-garamond italic text-muted-stardust/80">
              Your thoughts. Your story. Your moonlit sanctuary.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Auth;
