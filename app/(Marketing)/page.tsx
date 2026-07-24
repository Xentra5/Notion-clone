import { Heading } from "./_component/heading";
import { Heroes } from "./_component/heroes";
import { Navbar } from "./_component/navbar";

const MarketingPage = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-black">
      <Navbar />
      <Heroes />
      <Heading />
    </main>
  );
};

export default MarketingPage;