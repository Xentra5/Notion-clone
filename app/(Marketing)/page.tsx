import { Heading } from "./_components/heading";
import { Heroes } from "./_components/heroes";
import { Navbar } from "./_components/navbar";
import { LogoBar } from "./_components/logo-bar";
import { Features } from "./_components/features";
import { Testimonials } from "./_components/testimonials";
import { StatsBar } from "./_components/stats-bar";
import { Footer } from "./_components/footer";

const MarketingPage = () => {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white text-black">
      <Navbar />
      <div className="relative w-full pb-16">
        <Heroes />
        <Heading />
      </div>
      <LogoBar />
      <Features />
      <Testimonials />
      <StatsBar />
      <Footer />
    </main>
  );
};

export default MarketingPage;