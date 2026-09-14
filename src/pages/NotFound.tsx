
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{
        background: `url('/assets/lunara-moon-bg.webp') center/cover no-repeat, linear-gradient(180deg, #0B1020 0%, #121A2E 50%, #0B1020 100%)`
      }}
    >
      <div className="absolute inset-0 bg-lunara-primary/40" />

      <div className="lunara-glass-card w-full max-w-md mx-auto p-6 sm:p-8 md:p-12 rounded-2xl relative z-10">

        <div className="mt-6 sm:mt-8 text-center space-y-6 sm:space-y-8">
          <div className="flex justify-center">
            <BookOpen size={48} className="text-muted-stardust sm:w-16 sm:h-16" />
          </div>

          <div className="space-y-3 sm:space-y-4">
           <h1 className="text-6xl sm:text-7xl md:text-8xl font-garamond font-medium text-pearl-mist">
             404
           </h1>
           <div className="ornamental-divider"></div>
         </div>

         <div className="space-y-4 sm:space-y-6">
           <h2 className="text-xl sm:text-2xl md:text-3xl font-garamond font-medium text-pearl-mist">
             Page Not Found
           </h2>
           <p className="text-base sm:text-lg font-garamond italic text-muted-stardust leading-relaxed px-2">
             "The page you're looking for seems to have wandered into the shadows..."
           </p>
         </div>

          <div className="pt-4 sm:pt-6">
            <Button
              onClick={() => window.location.href = '/'}
              className="lunara-button font-garamond text-base sm:text-lg py-3 sm:py-4 px-6 sm:px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden w-full sm:w-auto"
            >
              <Home className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="relative z-10">Return Home</span>
            </Button>
          </div>

          <p className="text-xs sm:text-sm text-muted-stardust/70 font-garamond italic px-4">
            "Every journey has its detours"
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
