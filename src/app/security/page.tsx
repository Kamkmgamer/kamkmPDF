// app/security/page.tsx
"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SecurityPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0, duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="text-5xl font-bold tracking-tight"
        >
          Security at <span className="text-primary">kamkmPDF</span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.15, duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          Your documents are safe with us. We take security seriously and
          implement enterprise-grade practices to protect your data.
        </motion.p>
      </section>

      {/* Core Principles */}
      <section className="container mx-auto grid gap-12 px-6 py-20 md:grid-cols-3">
        {[
          {
            title: "End-to-End Encryption",
            desc: "All files are encrypted in transit (TLS 1.3) and at rest with AES-256.",
          },
          {
            title: "Privacy First",
            desc: "Documents are never stored longer than necessary — you stay in control.",
          },
          {
            title: "Regular Audits",
            desc: "We follow best practices and undergo continuous monitoring and testing.",
          },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: i * 0.15, duration: 0.6, ease: [0, 0, 0.2, 1] }}
            className="rounded-2xl bg-card p-8 shadow-lg transition hover:scale-[1.02]"
          >
            <h3 className="text-xl font-semibold text-primary">{item.title}</h3>
            <p className="mt-3 text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Security Features */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto grid gap-12 px-6 md:grid-cols-2">
          {[
            {
              heading: "ISO-Standard Encryption",
              text: "All PDF generations and storage rely on industry-standard encryption algorithms that meet ISO 27001 recommendations.",
            },
            {
              heading: "Automatic File Deletion",
              text: "Generated files are automatically purged after processing, ensuring your content is never lingering on our servers.",
            },
            {
              heading: "Secure Authentication",
              text: "We use secure OAuth2 flows and token-based authentication to protect user sessions.",
            },
            {
              heading: "Continuous Monitoring",
              text: "Our systems are monitored 24/7 with alerts for any suspicious activity or anomaly detection.",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.heading}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0, 0, 0.2, 1] }}
              className="rounded-xl bg-background p-6 shadow-md"
            >
              <h4 className="text-lg font-semibold text-primary">
                {feature.heading}
              </h4>
              <p className="mt-2 text-muted-foreground">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Responsible Disclosure */}
      <section className="container mx-auto px-6 py-24 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ delay: 0, duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="mx-auto max-w-2xl"
        >
          <h2 className="text-3xl font-bold">Responsible Disclosure</h2>
          <p className="mt-4 text-muted-foreground">
            If you believe you’ve found a security issue, please contact us at{" "}
            <a
              href="mailto:contact@khalil.mageed.net"
              className="text-primary underline"
            >
              contact@khalil.mageed.net
            </a>{" "}
            so we can address it quickly and responsibly.
          </p>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="bg-card py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ delay: 0, duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="container mx-auto text-center"
        >
          <h2 className="text-3xl font-bold">Your trust matters to us</h2>
          <p className="mt-4 text-muted-foreground">
            That’s why we continuously invest in security and compliance.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="/about"
              className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-lg transition hover:bg-primary/90"
            >
              Learn more about kamkmPDF
            </a>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
