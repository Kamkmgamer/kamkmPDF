import { api, HydrateClient } from "~/trpc/server";
import Hero from "./_components/Hero";
import Features from "./_components/Features";
import Pricing from "./_components/Pricing";
import Footer from "./_components/Footer";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="min-h-screen text-slate-800">
        <Hero />

        <section className="bg-gradient-to-b from-white to-slate-50">
          <Features />
          <Pricing />
        </section>

        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            {hello ? hello.greeting : "Loading tRPC query..."}
          </p>
        </div>

        <Footer />
      </main>
    </HydrateClient>
  );
}
