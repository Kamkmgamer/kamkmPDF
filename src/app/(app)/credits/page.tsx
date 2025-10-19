import { Zap, Check, Sparkles, ArrowLeft, Infinity, Rocket, DollarSign } from "lucide-react";
import Link from "next/link";
import { creditPackages } from "~/app/_data/creditPackages";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CreditPurchaseButton from "./_components/CreditPurchaseButton";

export const metadata = {
  title: "Purchase Credits | PDF Prompt",
  description: "Buy additional credits for your PDF generation needs",
};

export default async function CreditsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-blue-950 dark:to-cyan-950">
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        {/* Back Button */}
        <Link
          href="/dashboard/usage"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Usage
        </Link>

        {/* Header */}
        <div className="mb-8 text-center sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-white shadow-lg">
            <Zap className="h-6 w-6" />
            <h1 className="text-2xl font-bold sm:text-3xl">Purchase Credits</h1>
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg">
            Get additional credits to continue generating PDFs. Credits never expire and can be used anytime.
          </p>
        </div>

        {/* Credit Packages */}
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative flex flex-col overflow-hidden rounded-3xl border-2 bg-white shadow-xl transition-all hover:shadow-2xl dark:bg-gray-800 ${
                pkg.popular
                  ? "border-blue-500 dark:border-blue-400"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute top-0 right-0">
                  <div className="flex items-center gap-1 rounded-bl-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-bold text-white">
                    <Sparkles className="h-4 w-4" />
                    <span>Best Value</span>
                  </div>
                </div>
              )}

              <div className="flex flex-1 flex-col p-6 sm:p-8">
                {/* Package Name */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  {pkg.name}
                </h3>

                {/* Credits */}
                <div className="mt-6">
                  <div className="flex items-baseline gap-2">
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-5xl font-black text-transparent dark:from-blue-400 dark:to-cyan-400 sm:text-6xl">
                      {pkg.credits}
                    </span>
                    <span className="text-lg text-gray-600 dark:text-gray-400">
                      credits
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                      ${pkg.price}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      one-time
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    ${pkg.pricePerCredit.toFixed(3)} per credit
                  </p>
                </div>

                {/* Features */}
                <ul className="mt-6 flex-1 space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Credits never expire</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Use anytime you need</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Instant activation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>No subscription required</span>
                  </li>
                </ul>

                {/* Savings Badge */}
                {pkg.savings && (
                  <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <Check className="h-4 w-4" />
                    {pkg.savings}
                  </div>
                )}

                {/* Purchase Button */}
                <div className="mt-6">
                  <CreditPurchaseButton packageId={pkg.id} popular={pkg.popular} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mx-auto mt-12 max-w-4xl rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800 sm:p-8">
          <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            How Credits Work
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  One-Time Purchase
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Buy credits once and use them whenever you need. No recurring charges.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                <Infinity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Never Expire
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your credits stay in your account forever. Use them at your own pace.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                <Rocket className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Instant Activation
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Credits are added to your account immediately after purchase.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Best Value
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Larger packages offer better value - save up to 50% per credit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-8 max-w-4xl rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 dark:from-blue-950/30 dark:to-cyan-950/30 sm:p-8">
          <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">
                What happens to my subscription credits?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Purchased credits are separate from your subscription. They&apos;re used after your monthly subscription credits are exhausted.
              </p>
            </div>
            <div>
              <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">
                Can I use credits across different subscription tiers?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes! Credits work with any subscription tier, including the free Starter plan.
              </p>
            </div>
            <div>
              <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">
                What if I cancel my subscription?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your purchased credits remain in your account and can still be used even if you cancel your subscription.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
