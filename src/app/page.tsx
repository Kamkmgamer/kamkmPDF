import { HydrateClient } from "~/trpc/server";
import Hero from "./_components/Hero";
import Features from "./_components/Features";
import Pricing from "./_components/Pricing";
import Footer from "./_components/Footer";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="min-h-screen bg-[--color-bg] text-[--color-text-primary]">
        <Hero />

        <section className="bg-[--color-surface]">
          <Features />
          <Pricing />
        </section>

        <Footer />
      </main>
    </HydrateClient>
  );
}
