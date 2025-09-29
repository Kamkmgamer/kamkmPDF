export default function StatusPage() {
  const services = [
    {
      name: "API",
      status: "operational",
      uptime: "99.9%",
      responseTime: "120ms",
      lastIncident: "Never",
    },
    {
      name: "Document Generation",
      status: "operational",
      uptime: "99.8%",
      responseTime: "2.3s",
      lastIncident: "2 days ago",
    },
    {
      name: "Template Engine",
      status: "operational",
      uptime: "99.9%",
      responseTime: "85ms",
      lastIncident: "Never",
    },
    {
      name: "File Storage",
      status: "operational",
      uptime: "99.9%",
      responseTime: "45ms",
      lastIncident: "Never",
    },
    {
      name: "Authentication",
      status: "operational",
      uptime: "99.9%",
      responseTime: "90ms",
      lastIncident: "Never",
    },
    {
      name: "CDN",
      status: "operational",
      uptime: "99.9%",
      responseTime: "15ms",
      lastIncident: "Never",
    },
  ];

  const recentIncidents = [
    {
      date: "2024-01-10",
      title: "Brief API slowdown",
      description:
        "API response times were elevated for 15 minutes due to increased traffic.",
      status: "resolved",
      duration: "15 minutes",
    },
    {
      date: "2024-01-08",
      title: "Document generation delay",
      description:
        "Some users experienced delays in document generation due to high server load.",
      status: "resolved",
      duration: "23 minutes",
    },
    {
      date: "2024-01-05",
      title: "Template preview issue",
      description:
        "Template previews were not loading correctly for some users.",
      status: "resolved",
      duration: "8 minutes",
    },
  ];

  const metrics = [
    { label: "Average Response Time", value: "145ms", change: "-5%" },
    { label: "Uptime (30 days)", value: "99.8%", change: "+0.1%" },
    { label: "Error Rate", value: "0.02%", change: "-0.01%" },
    { label: "Active Users", value: "1,247", change: "+12%" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
      case "degraded":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
      case "outage":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30";
    }
  };

  return (
    <div className="min-h-screen bg-[--color-bg] text-[--color-text-primary]">
      {/* Hero Section */}
      <div className="border-b border-[--color-border] bg-[--color-surface]">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              System Status
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-[--color-text-muted]">
              Real-time status of Prompt-to-PDF services and infrastructure. We
              monitor our systems 24/7 to ensure optimal performance.
            </p>
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-green-100 px-6 py-3 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <div className="mr-3 h-3 w-3 rounded-full bg-green-500"></div>
              <span className="font-semibold">All Systems Operational</span>
            </div>
            <p className="text-[--color-text-muted]">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="border-b border-[--color-border] bg-[--color-surface] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Key Metrics
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[--color-border] bg-[--color-bg] p-6 text-center"
                >
                  <div className="text-3xl font-bold text-[--color-primary]">
                    {metric.value}
                  </div>
                  <div className="mt-2 text-sm text-[--color-text-muted]">
                    {metric.label}
                  </div>
                  <div
                    className={`mt-1 text-xs ${metric.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                  >
                    {metric.change}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Status */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Service Status
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{service.name}</h3>
                      <div className="mt-2 flex items-center gap-4 text-sm text-[--color-text-muted]">
                        <span>Uptime: {service.uptime}</span>
                        <span>•</span>
                        <span>Response: {service.responseTime}</span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(service.status)}`}
                    >
                      {service.status}
                    </span>
                  </div>
                  <div className="mt-4 text-xs text-[--color-text-muted]">
                    Last incident: {service.lastIncident}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="border-b border-[--color-border] bg-[--color-surface] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Recent Incidents
            </h2>
            <div className="space-y-6">
              {recentIncidents.map((incident, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[--color-border] bg-[--color-bg] p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {incident.title}
                        </h3>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {incident.status}
                        </span>
                      </div>
                      <p className="mt-2 text-[--color-text-muted]">
                        {incident.description}
                      </p>
                      <div className="mt-4 flex items-center gap-4 text-xs text-[--color-text-muted]">
                        <span>
                          {new Date(incident.date).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>Duration: {incident.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Maintenance Schedule */}
      <section className="border-b border-[--color-border] bg-[--color-bg] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-8 text-3xl font-bold">Scheduled Maintenance</h2>
            <div className="rounded-2xl border border-[--color-border] bg-[--color-surface] p-8">
              <div className="text-green-600">
                <svg
                  className="mx-auto mb-4 h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">
                No Scheduled Maintenance
              </h3>
              <p className="mt-2 text-[--color-text-muted]">
                We don&apos;t have any scheduled maintenance windows planned.
                Our systems are designed to be updated without downtime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-r from-sky-500 to-cyan-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Need to Report an Issue?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            If you&apos;re experiencing issues not shown here, please let us
            know so we can investigate and resolve them quickly.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/contact"
              className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[--color-primary] transition-all duration-200 hover:bg-gray-100"
            >
              Report Issue
            </a>
            <a
              href="/help"
              className="rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/20"
            >
              Get Help
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
