
import Hero from "@/components/Hero";
import AboutDiary from "@/components/AboutDiary";
import RecentEntries from "@/components/RecentEntries";
import Topics from "@/components/Topics";
import Quotes from "@/components/Quotes";
import AuthorSection from "@/components/AuthorSection";
import Subscribe from "@/components/Subscribe";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0B1020 0%, #121A2E 50%, #0B1020 100%)' }}>
      <Hero />
      <AboutDiary />
      <RecentEntries />
      <Topics />
      <Quotes />
      <AuthorSection />
      <Subscribe />
      <Footer />
    </div>
  );
};

export default Index;
