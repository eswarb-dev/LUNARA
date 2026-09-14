import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden"
      style={{
        background: `url('/assets/lunara-moon-bg.webp') center/cover no-repeat, linear-gradient(180deg, #0B1020 0%, #121A2E 50%, #0B1020 100%)`
      }}
    >
      <div className="absolute inset-0 bg-lunara-primary/40" />

      <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in relative z-10">
        <div className="space-y-6">
          <div className="mb-4">
            <span className="text-3xl sm:text-4xl md:text-5xl tracking-[0.4em] font-garamond font-light text-pearl-mist">LUNARA</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-garamond font-medium text-pearl-mist leading-tight">
            Moonlit Emotional Journal
          </h1>
        </div>

        <div className="ornamental-divider my-8"></div>

        <div className="space-y-8">
          <p className="text-xl font-garamond text-soft-gray max-w-3xl text-center mx-auto leading-relaxed">
            Reflect softly. Heal privately. A calm moonlit space for self-reflection,
            mood awareness, and personal growth.
          </p>

          <Button
            size="lg"
            className="lunara-button font-inter font-medium px-10 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
            onClick={() => {
              navigate('/auth');
            }}
          >
            Write in Lunara
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
