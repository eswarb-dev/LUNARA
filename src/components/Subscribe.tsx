

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const Subscribe = () => {
  return (
    <section id="contact" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Card className="lunara-glass-card">
          <CardContent className="p-6 sm:p-8 md:p-12 text-center space-y-4 sm:space-y-6">
             <h2 className="text-xl sm:text-2xl md:text-3xl font-garamond font-medium text-pearl-mist px-4">
               Stay Connected with Lunara
             </h2>

             <p className="text-base sm:text-lg font-garamond text-soft-gray max-w-2xl mx-auto leading-relaxed px-4">
               Get notified when a new entry is added to your journal.
               No noise, no clutter—just gentle reminders for quiet souls.
             </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto px-4">
              <Input
                type="email"
                placeholder="your.email@example.com"
                className="lunara-field font-inter h-12 text-base"
              />
              <Button
                className="lunara-button font-inter font-medium whitespace-nowrap h-12 px-6 min-h-[48px]"
              >
                Subscribe
              </Button>
            </div>

            <p className="text-xs sm:text-sm font-inter text-muted-stardust px-4">
              Or <span className="underline cursor-pointer hover:text-lunara-accent transition-colors min-h-[44px] inline-flex items-center">write to me</span> directly
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Subscribe;
