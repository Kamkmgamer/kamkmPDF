import { HydrateClient } from "~/trpc/server";
import Hero from "./_components/Hero";
import Features from "./_components/Features";
import SocialProof from "./_components/SocialProof";
import Pricing from "./_components/Pricing";
import CTASection from "./_components/CTASection";
import Footer from "./_components/Footer";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="min-h-screen bg-[--color-bg] text-[--color-text-primary]">
        <Hero />
        <Features />
        <SocialProof />
        <Pricing />
        <CTASection />
        <Footer />
      </main>
    </HydrateClient>
  );
}
