export default function SecurityPage() {
  const securityFeatures = [
    {
      title: "End-to-End Encryption",
      description:
        "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.",
      icon: "🔒",
      details: [
        "TLS 1.3 for all communications",
        "AES-256 encryption at rest",
        "Perfect forward secrecy",
      ],
    },
    {
      title: "Access Controls",
      description:
        "Granular permissions and role-based access control ensure users only see what they need.",
      icon: "🛡️",
      details: [
        "Role-based access control",
        "Granular permissions",
        "Multi-factor authentication",
      ],
    },
    {
      title: "Audit Logging",
      description:
        "Comprehensive audit trails track all user activities and system events for compliance.",
      icon: "📋",
      details: [
        "Complete activity logs",
        "Real-time monitoring",
        "Compliance reporting",
      ],
    },
    {
      title: "Data Backup",
      description:
        "Automated backups with geographic redundancy ensure your data is always safe.",
      icon: "💾",
      details: [
        "Daily automated backups",
        "Geographic redundancy",
        "Point-in-time recovery",
      ],
    },
    {
      title: "Threat Detection",
      description:
        "Advanced threat detection and prevention systems protect against malicious activities.",
      icon: "🛡️",
      details: [
        "Real-time threat detection",
        "DDoS protection",
        "Intrusion prevention",
      ],
    },
    {
      title: "Compliance",
      description:
        "We maintain compliance with major security standards and regulations.",
      icon: "📜",
      details: [
        "SOC 2 Type II certified",
        "GDPR compliant",
        "ISO 27001 certified",
      ],
    },
  ];

  const certifications = [
    {
      name: "SOC 2 Type II",
      description:
        "Service Organization Control 2 compliance for security and availability",
      status: "Certified",
      icon: "🏆",
    },
    {
      name: "ISO 27001",
      description:
        "International standard for information security management systems",
      status: "Certified",
      icon: "🌐",
    },
    {
      name: "GDPR",
      description:
        "General Data Protection Regulation compliance for EU data protection",
      status: "Compliant",
      icon: "🇪🇺",
    },
    {
      name: "CCPA",
      description:
        "California Consumer Privacy Act compliance for California residents",
      status: "Compliant",
      icon: "🌴",
    },
  ];

  const securityMetrics = [
    {
      label: "Uptime SLA",
      value: "99.9%",
      description: "Guaranteed availability",
    },
    {
      label: "Response Time",
      value: "< 200ms",
      description: "Average API response",
    },
    {
      label: "Threat Detection",
      value: "24/7",
      description: "Continuous monitoring",
    },
    {
      label: "Backup Frequency",
      value: "Daily",
      description: "Automated backups",
    },
  ];

  return (
    <div className="min-h-screen bg-[--color-bg] text-[--color-text-primary]">
      {/* Hero Section */}
      <div className="border-b border-[--color-border] bg-[--color-surface]">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Security &{" "}
              <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">
                Compliance
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-[--color-text-muted]">
              Enterprise-grade security with comprehensive compliance. Your data
              is protected by industry-leading security measures and regular
              audits.
            </p>
          </div>
        </div>
      </div>

      {/* Security Metrics */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Security by the Numbers
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {securityMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-6 text-center"
                >
                  <div className="text-3xl font-bold text-[--color-primary]">
                    {metric.value}
                  </div>
                  <div className="mt-2 text-sm font-medium">{metric.label}</div>
                  <div className="mt-1 text-xs text-[--color-text-muted]">
                    {metric.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="border-b border-[--color-border] bg-[--color-surface] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Security Features
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {securityFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[--color-border] bg-[--color-bg] p-8"
                >
                  <div className="mb-4 text-4xl">{feature.icon}</div>
                  <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                  <p className="mb-6 text-[--color-text-muted]">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li
                        key={detailIndex}
                        className="flex items-center gap-2 text-sm text-[--color-text-muted]"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-[--color-primary]"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Certifications & Compliance
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-2xl border border-[--color-border] bg-[--color-surface] p-6"
                >
                  <div className="text-3xl">{cert.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{cert.name}</h3>
                    <p className="text-sm text-[--color-text-muted]">
                      {cert.description}
                    </p>
                  </div>
                  <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {cert.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="border-b border-[--color-border] bg-[--color-surface] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Security Practices
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-xl font-semibold">
                  Infrastructure Security
                </h3>
                <ul className="space-y-3 text-[--color-text-muted]">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <span>
                      Regular security assessments and penetration testing
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <span>Network segmentation and firewall protection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <span>
                      Secure API design with rate limiting and authentication
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <span>
                      Regular dependency updates and vulnerability scanning
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 text-xl font-semibold">Data Protection</h3>
                <ul className="space-y-3 text-[--color-text-muted]">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <span>Data encryption at rest and in transit</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <span>
                      Automatic data backup with geographic redundancy
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <span>Secure data deletion and retention policies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <span>Regular privacy and security audits</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-r from-sky-500 to-cyan-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Security Concerns?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            Have questions about our security practices or need to report a
            security issue? Our security team is here to help.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/contact"
              className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[--color-primary] transition-all duration-200 hover:bg-gray-100"
            >
              Contact Security Team
            </a>
            <a
              href="mailto:security@prompttopdf.com"
              className="rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/20"
            >
              Report Vulnerability
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
