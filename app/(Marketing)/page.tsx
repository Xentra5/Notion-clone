import { Heading } from "./_component/heading";
import { Heroes } from "./_component/heroes";
import { Navbar } from "./_component/navbar";
import { LogoBar } from "./_component/logo-bar";
import { Features } from "./_component/features";
import { Testimonials } from "./_component/testimonials";
import { StatsBar } from "./_component/stats-bar";
import { Footer } from "./_component/footer";

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