// app/status/page.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Loader2, Activity, TrendingUp } from "lucide-react";

type StatusType = "operational" | "degraded" | "outage" | "maintenance";

const services: { name: string; status: StatusType; desc: string }[] = [
  { name: "API", status: "operational", desc: "All systems running smoothly" },
  { name: "File Processing", status: "operational", desc: "Processing documents efficiently" },
  { name: "Database", status: "operational", desc: "Stable connection" },
  { name: "Website", status: "operational", desc: "Fully accessible" },
  { name: "Payments", status: "operational", desc: "All payment systems online" },
];

const getStatusIcon = (status: StatusType) => {
  switch (status) {
    case "operational":
      return <CheckCircle className="text-green-500 w-7 h-7" />;
    case "degraded":
      return <AlertTriangle className="text-yellow-500 w-7 h-7" />;
    case "outage":
      return <XCircle className="text-red-500 w-7 h-7" />;
    case "maintenance":
      return <Loader2 className="text-blue-500 w-7 h-7 animate-spin" />;
  }
};

const getStatusColor = (status: StatusType) => {
  switch (status) {
    case "operational":
      return "from-green-500 to-emerald-500";
    case "degraded":
      return "from-yellow-500 to-orange-500";
    case "outage":
      return "from-red-500 to-teal-500";
    case "maintenance":
      return "from-blue-500 to-cyan-500";
  }
};

const getStatusText = (status: StatusType) => {
  switch (status) {
    case "operational":
      return "Operational";
    case "degraded":
      return "Degraded Performance";
    case "outage":
      return "Outage";
    case "maintenance":
      return "Maintenance";
  }
};

export default function StatusPage() {
  const overallStatus = services.some((s) => s.status === "outage")
    ? "Partial Outage"
    : services.some((s) => s.status === "degraded" || s.status === "maintenance")
    ? "Some Systems Affected"
    : "All Systems Operational";

  const isAllOperational = services.every((s) => s.status === "operational");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-sky-400/10 to-teal-400/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-6 py-32">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            className={`mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              isAllOperational 
                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Activity className="h-4 w-4" />
            <span>Live Status</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl font-black tracking-tight text-slate-900 dark:text-white lg:text-7xl"
          >
            System Status
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`mx-auto mt-6 text-2xl font-bold ${
              isAllOperational
                ? "text-green-600 dark:text-green-400"
                : "text-yellow-600 dark:text-yellow-400"
            }`}
          >
            {overallStatus}
          </motion.p>
        </div>

        {/* Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-20">
          {services.map((service, idx) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="group relative"
              whileHover={{ y: -4 }}
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${getStatusColor(service.status)} rounded-3xl opacity-0 blur transition duration-300 group-hover:opacity-20`} />
              <div className="relative rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${getStatusColor(service.status)} shadow-lg`}>
                      {getStatusIcon(service.status)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{service.name}</h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">{getStatusText(service.status)}</span> — {service.desc}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Uptime Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-12 text-center">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
            </div>
            
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 text-white/90">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Uptime Statistics</span>
              </div>
              <h2 className="text-5xl font-black text-white mb-3">99.97%</h2>
              <p className="text-xl text-white/90 font-medium">
                Last 90 days uptime
              </p>
              <p className="text-sm text-white/70 mt-4" suppressHydrationWarning>
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
