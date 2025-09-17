export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      bullets: ["10 PDFs/month", "Basic templates"],
    },
    {
      name: "Pro",
      price: "$15/mo",
      bullets: ["Unlimited PDFs", "Custom branding"],
    },
    {
      name: "Teams",
      price: "$99/mo",
      bullets: ["SSO & teams", "Priority support"],
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-center text-2xl font-bold">Pricing</h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-sm opacity-90">
        Simple pricing to scale with your usage. Upgrade or cancel anytime.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className="rounded-lg border border-[--color-border] bg-[--color-surface] p-6 text-center"
          >
            <div className="text-sm font-semibold">{p.name}</div>
            <div className="mt-4 text-3xl font-bold">{p.price}</div>
            <ul className="mt-4 space-y-2 text-sm">
              {p.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <button className="mt-6 rounded-full bg-[--color-primary] px-6 py-2 text-[--color-bg]">
              Get {p.name}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
