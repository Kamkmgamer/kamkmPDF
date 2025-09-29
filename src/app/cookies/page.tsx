export default function CookiesPage() {
  const cookieCategories = [
    {
      name: "Strictly Necessary Cookies",
      required: true,
      description:
        "These cookies are essential for the website to function properly and cannot be disabled.",
      cookies: [
        {
          name: "_session",
          purpose: "Maintains user session across page requests",
          duration: "Session",
          provider: "Prompt-to-PDF",
        },
        {
          name: "_csrf",
          purpose: "Prevents cross-site request forgery attacks",
          duration: "Session",
          provider: "Prompt-to-PDF",
        },
        {
          name: "auth_token",
          purpose: "Authenticates user identity",
          duration: "7 days",
          provider: "Prompt-to-PDF",
        },
      ],
    },
    {
      name: "Analytics Cookies",
      required: false,
      description:
        "Help us understand how visitors interact with our website by collecting and reporting information anonymously.",
      cookies: [
        {
          name: "_ga",
          purpose: "Google Analytics - tracks page views and user behavior",
          duration: "2 years",
          provider: "Google",
        },
        {
          name: "_gid",
          purpose: "Google Analytics - distinguishes users",
          duration: "24 hours",
          provider: "Google",
        },
        {
          name: "mixpanel_distinct_id",
          purpose: "Mixpanel - tracks user interactions",
          duration: "1 year",
          provider: "Mixpanel",
        },
      ],
    },
    {
      name: "Marketing Cookies",
      required: false,
      description:
        "Used to deliver relevant advertisements and track the effectiveness of our marketing campaigns.",
      cookies: [
        {
          name: "fb_pixel",
          purpose: "Facebook Pixel - tracks conversions and retargeting",
          duration: "90 days",
          provider: "Facebook",
        },
        {
          name: "linkedin_insight",
          purpose: "LinkedIn Insight - tracks professional audience",
          duration: "6 months",
          provider: "LinkedIn",
        },
        {
          name: "google_ads",
          purpose: "Google Ads - tracks ad performance",
          duration: "90 days",
          provider: "Google",
        },
      ],
    },
    {
      name: "Functional Cookies",
      required: false,
      description:
        "Enable enhanced functionality and personalization features.",
      cookies: [
        {
          name: "theme_preference",
          purpose: "Remembers user's theme choice (light/dark)",
          duration: "1 year",
          provider: "Prompt-to-PDF",
        },
        {
          name: "language",
          purpose: "Remembers user's language preference",
          duration: "1 year",
          provider: "Prompt-to-PDF",
        },
        {
          name: "feature_tips",
          purpose: "Tracks which feature tips have been shown",
          duration: "30 days",
          provider: "Prompt-to-PDF",
        },
      ],
    },
  ];

  const thirdPartyServices = [
    {
      name: "Google Analytics",
      purpose: "Website analytics and performance monitoring",
      privacyPolicy: "https://policies.google.com/privacy",
      optOut: "https://tools.google.com/dlpage/gaoptout",
    },
    {
      name: "Mixpanel",
      purpose: "Product analytics and user behavior tracking",
      privacyPolicy: "https://mixpanel.com/privacy/",
      optOut: "https://mixpanel.com/optout/",
    },
    {
      name: "Intercom",
      purpose: "Customer support and live chat functionality",
      privacyPolicy: "https://www.intercom.com/privacy",
      optOut: "https://www.intercom.com/privacy",
    },
  ];

  return (
    <div className="min-h-screen bg-[--color-bg] text-[--color-text-primary]">
      {/* Hero Section */}
      <div className="border-b border-[--color-border] bg-[--color-surface]">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Cookie Policy
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-[--color-text-muted]">
              Last updated: January 15, 2024
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <p className="mb-8 text-lg text-[--color-text-muted]">
              This Cookie Policy explains how Prompt-to-PDF (&quot;we,&quot;
              &quot;us,&quot; and &quot;our&quot;) uses cookies and similar
              technologies to recognize you when you visit our website. It
              explains what these technologies are and why we use them, as well
              as your rights to control our use of them.
            </p>
            <p className="text-[--color-text-muted]">
              By continuing to use our website, you consent to our use of
              cookies in accordance with this Cookie Policy.
            </p>
          </div>
        </div>
      </section>

      {/* What are Cookies */}
      <section className="border-b border-[--color-border] bg-[--color-surface] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-3xl font-bold">What are Cookies?</h2>
            <p className="mb-6 text-[--color-text-muted]">
              Cookies are small text files that are used to store small pieces
              of information. They are stored on your device when the website is
              loaded on your browser. These cookies help us make the website
              function properly, make it more secure, provide better user
              experience, and understand how the website performs and to analyze
              what works and where it needs improvement.
            </p>
            <p className="text-[--color-text-muted]">
              Similar technologies such as web beacons, pixels, and flash
              cookies perform the same functions as cookies but store data in
              different ways.
            </p>
          </div>
        </div>
      </section>

      {/* Cookie Categories */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Types of Cookies We Use
            </h2>
            <div className="space-y-8">
              {cookieCategories.map((category, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-8"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        category.required
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {category.required ? "Required" : "Optional"}
                    </span>
                  </div>
                  <p className="mb-6 text-[--color-text-muted]">
                    {category.description}
                  </p>

                  <div className="overflow-hidden rounded-lg border border-[--color-border]">
                    <table className="w-full">
                      <thead className="bg-[--color-bg]">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Cookie Name
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Purpose
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Duration
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Provider
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[--color-border]">
                        {category.cookies.map((cookie, cookieIndex) => (
                          <tr key={cookieIndex}>
                            <td className="px-4 py-3 font-mono text-sm">
                              {cookie.name}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {cookie.purpose}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {cookie.duration}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {cookie.provider}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Third Party Services */}
      <section className="border-b border-[--color-border] bg-[--color-surface] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Third-Party Services
            </h2>
            <p className="mb-8 text-center text-[--color-text-muted]">
              We use third-party services that may set cookies on your device.
              Here&apos;s information about our key partners:
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {thirdPartyServices.map((service, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[--color-border] bg-[--color-bg] p-6"
                >
                  <h3 className="mb-3 text-lg font-semibold">{service.name}</h3>
                  <p className="mb-4 text-sm text-[--color-text-muted]">
                    {service.purpose}
                  </p>
                  <div className="space-y-2">
                    <a
                      href={service.privacyPolicy}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-[--color-primary] hover:underline"
                    >
                      Privacy Policy →
                    </a>
                    <a
                      href={service.optOut}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-[--color-primary] hover:underline"
                    >
                      Opt Out →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Managing Cookies */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Managing Your Cookies
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-8">
                <h3 className="mb-4 text-xl font-semibold">Browser Settings</h3>
                <p className="mb-6 text-[--color-text-muted]">
                  You can control and manage cookies in various ways. Please
                  note that removing or blocking cookies can negatively affect
                  your user experience.
                </p>
                <ul className="space-y-2 text-sm text-[--color-text-muted]">
                  <li>
                    • Click your browser&apos;s help menu for instructions
                  </li>
                  <li>• Look for &quot;cookies&quot; in the search function</li>
                  <li>• Choose your preferred cookie settings</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-8">
                <h3 className="mb-4 text-xl font-semibold">Cookie Consent</h3>
                <p className="mb-6 text-[--color-text-muted]">
                  When you first visit our website, you&apos;ll see a cookie
                  consent banner. You can accept all cookies, reject
                  non-essential cookies, or customize your preferences.
                </p>
                <button className="rounded-lg bg-[--color-primary] px-4 py-2 text-sm font-semibold text-white">
                  Manage Cookie Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-gradient-to-r from-sky-500 to-cyan-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Questions About Cookies?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            If you have any questions about our use of cookies or this Cookie
            Policy, please don&apos;t hesitate to contact us.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/contact"
              className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[--color-primary] transition-all duration-200 hover:bg-gray-100"
            >
              Contact Us
            </a>
            <a
              href="/privacy"
              className="rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/20"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
