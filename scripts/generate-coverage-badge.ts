#!/usr/bin/env tsx
/**
 * Generate Coverage Badge
 *
 * This script reads the coverage summary and can be used to generate
 * a coverage badge or update documentation with coverage stats.
 */

import * as fs from "fs";
import * as path from "path";

interface CoverageSummary {
  total: {
    lines: { pct: number };
    statements: { pct: number };
    functions: { pct: number };
    branches: { pct: number };
  };
}

function getCoverageColor(percentage: number): string {
  if (percentage >= 90) return "brightgreen";
  if (percentage >= 80) return "green";
  if (percentage >= 70) return "yellow";
  if (percentage >= 60) return "orange";
  return "red";
}

async function main() {
  const summaryPath = path.join(
    process.cwd(),
    "coverage",
    "coverage-summary.json",
  );

  if (!fs.existsSync(summaryPath)) {
    console.error("Coverage summary not found. Run tests with coverage first:");
    console.error("  pnpm test:coverage");
    process.exit(1);
  }

  const summary: CoverageSummary = JSON.parse(
    fs.readFileSync(summaryPath, "utf-8"),
  );

  const coverage = {
    lines: summary.total.lines.pct,
    statements: summary.total.statements.pct,
    functions: summary.total.functions.pct,
    branches: summary.total.branches.pct,
  };

  const avgCoverage = (
    (coverage.lines +
      coverage.statements +
      coverage.functions +
      coverage.branches) /
    4
  ).toFixed(2);

  console.log("\n📊 Coverage Summary:\n");
  console.log(`  Lines:      ${coverage.lines.toFixed(2)}%`);
  console.log(`  Statements: ${coverage.statements.toFixed(2)}%`);
  console.log(`  Functions:  ${coverage.functions.toFixed(2)}%`);
  console.log(`  Branches:   ${coverage.branches.toFixed(2)}%`);
  console.log(`\n  Average:    ${avgCoverage}%`);
  console.log(`  Color:      ${getCoverageColor(parseFloat(avgCoverage))}\n`);

  // Generate badge URL (using shields.io)
  const badgeUrl = `https://img.shields.io/badge/coverage-${avgCoverage}%25-${getCoverageColor(parseFloat(avgCoverage))}`;
  console.log(`Badge URL:\n  ${badgeUrl}\n`);

  // Check against thresholds
  const thresholds = {
    lines: 70,
    statements: 70,
    functions: 70,
    branches: 70,
  };

  let hasFailures = false;
  console.log("Threshold Check:");
  for (const [key, value] of Object.entries(coverage)) {
    const threshold = thresholds[key as keyof typeof thresholds];
    const status = value >= threshold ? "✓" : "✗";
    console.log(
      `  ${status} ${key}: ${value.toFixed(2)}% (threshold: ${threshold}%)`,
    );
    if (value < threshold) hasFailures = true;
  }

  if (hasFailures) {
    console.log("\n⚠️  Some coverage metrics are below threshold!");
    process.exit(1);
  } else {
    console.log("\n✓ All coverage thresholds met!");
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
