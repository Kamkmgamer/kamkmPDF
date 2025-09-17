import { HydrateClient } from "~/trpc/server";
import Hero from "./_components/Hero";
import Features from "./_components/Features";
import Pricing from "./_components/Pricing";
import Footer from "./_components/Footer";

export default async function Home() {
  

  return (
    <HydrateClient>
      <main className="min-h-screen text-slate-800">
        <Hero />

        <section className="bg-gradient-to-b from-white to-slate-50">
          <Features />
          <Pricing />
        </section>

        

        <Footer />
      </main>
    </HydrateClient>
  );
}
