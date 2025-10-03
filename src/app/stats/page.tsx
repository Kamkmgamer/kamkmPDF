// app/stats/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, FileText, Globe, Download } from "lucide-react";

const barData = [
  { name: "Jan", uploads: 400 },
  { name: "Feb", uploads: 600 },
  { name: "Mar", uploads: 900 },
  { name: "Apr", uploads: 1200 },
  { name: "May", uploads: 1600 },
  { name: "Jun", uploads: 2200 },
];

const pieData = [
  { name: "PDF", value: 45 },
  { name: "DOCX", value: 25 },
  { name: "Images", value: 20 },
  { name: "Others", value: 10 },
];

const COLORS = ["#6366F1", "#22C55E", "#FACC15", "#EC4899"];

export default function StatsPage() {
  const [counts, setCounts] = useState({ users: 0, docs: 0, downloads: 0, countries: 0 });

  useEffect(() => {
    const target = { users: 12500, docs: 45000, downloads: 87000, countries: 62 };
    const duration = 2000;
    const startTime = performance.now();

    function animate(time: number) {
      const progress = Math.min((time - startTime) / duration, 1);
      setCounts({
        users: Math.floor(progress * target.users),
        docs: Math.floor(progress * target.docs),
        downloads: Math.floor(progress * target.downloads),
        countries: Math.floor(progress * target.countries),
      });
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, []);

  return (
    <div className="min-h-screen bg-[--color-bg] text-[--color-text-primary]">
      <div className="container mx-auto px-6 py-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-center mb-12"
        >
          Platform Stats
        </motion.h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { icon: Users, label: "Active Users", value: counts.users },
            { icon: FileText, label: "Documents Uploaded", value: counts.docs },
            { icon: Download, label: "Downloads", value: counts.downloads },
            { icon: Globe, label: "Countries Reached", value: counts.countries },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-2xl bg-[--color-surface] shadow-lg p-6 text-center"
            >
              <stat.icon className="mx-auto h-10 w-10 text-[--color-accent]" />
              <div className="text-3xl font-bold mt-2">{stat.value.toLocaleString()}</div>
              <p className="text-sm text-[--color-text-secondary]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-[--color-surface] shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Uploads Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="var(--color-text-secondary)" />
                <YAxis stroke="var(--color-text-secondary)" />
                <Tooltip />
                <Bar dataKey="uploads" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-[--color-surface] shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">File Types Uploaded</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
