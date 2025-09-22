"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { Home, Rocket, Sparkles, Stars, Zap } from "lucide-react";

// A lightweight Next.js App Router 404 inspired by your Vite NotFoundPage.tsx.
// Includes: theme-aware styling, supernova canvas burst, cosmic cursor trail,
// floating particles, typewriter message, and a "Galaxy mode" trigger.

function useSystemTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (isDark: boolean) => {
      const t = isDark ? "dark" : "light";
      setTheme(t);
      document.documentElement.classList.toggle("dark", t === "dark");
    };
    apply(mq.matches);
    const onChange = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return theme;
}

function usePerformanceController() {
  const fpsRef = useRef(60);
  const [visible, setVisible] = useState(
    typeof document === "undefined" ? true : !document.hidden,
  );
  const [lowPerf, setLowPerf] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  useEffect(() => {
    let frames = 0;
    let raf: number | null = null;
    let last = performance.now();
    const loop = (t: number) => {
      frames++;
      if (t - last >= 1000) {
        fpsRef.current = frames;
        const nowLow = frames < 50;
        if (nowLow !== lowPerf) setLowPerf(nowLow);
        if (visible) {
          if (frames < 28 && shouldAnimate) setShouldAnimate(false);
          else if (frames > 35 && !shouldAnimate) setShouldAnimate(true);
        }
        frames = 0;
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onVis = () => {
      const v = !document.hidden;
      setVisible(v);
      setShouldAnimate(v);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [lowPerf, shouldAnimate, visible]);
  const deviceScale = lowPerf ? 0.6 : 1;
  return { fps: fpsRef.current, lowPerf, deviceScale, shouldAnimate };
}

function useSupernovaExplosion({
  enabled = true,
  theme = "dark",
  perfScale = 1,
}: {
  enabled?: boolean;
  theme?: "light" | "dark";
  perfScale?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const afRef = useRef<number | null>(null);

  const supernova = useCallback(
    (x?: number, y?: number, power = 1) => {
      if (!enabled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (afRef.current) cancelAnimationFrame(afRef.current);

      const rect = canvas.getBoundingClientRect();
      const cx = x ?? rect.width / 2;
      const cy = y ?? rect.height / 2;

      // Lower count to reduce overdraw and visual artifacts on some GPUs
      const N = Math.max(60, Math.floor(160 * power * perfScale));
      let active = N;
      const colorLightness = theme === "dark" ? 72 : 58;
      const colorSat = theme === "dark" ? 100 : 95;

      type P = {
        x: number;
        y: number;
        vx: number;
        vy: number;
        r: number;
        life: number;
        ttl: number;
        hue: number;
      };
      const particles: P[] = Array.from({ length: N }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() ** 2 * 10 + 8) * power;
        const life = Math.random() * 70 + 70;
        const hue = Math.floor(Math.random() * 360);
        return {
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: Math.random() * 3 + 2,
          life,
          ttl: life,
          hue,
        };
      });

      const animate = () => {
        if (!ctx || !canvas) return;
        // Clear correctly when a transform is applied for DPR
        const prev = ctx.getTransform();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(prev);
        particles.forEach((p) => {
          if (p.life <= 0) return;
          p.life--;
          if (p.life <= 0) {
            active--;
            return;
          }
          p.vy += 0.1;
          p.x += p.vx;
          p.y += p.vy;
          const fade = p.life / p.ttl;
          ctx.globalAlpha = fade;
          ctx.fillStyle = `hsl(${p.hue} ${colorSat}% ${colorLightness}%)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        if (active > 0) afRef.current = requestAnimationFrame(animate);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
      };
      animate();
    },
    [enabled, perfScale, theme],
  );

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      c.width = c.clientWidth * dpr;
      c.height = c.clientHeight * dpr;
      const ctx = c.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(
    () => () => {
      if (afRef.current) cancelAnimationFrame(afRef.current);
    },
    [],
  );

  return { canvasRef, supernova };
}

function useCosmicCursor({
  enabled = true,
  theme = "dark",
  perfScale = 1,
  active = true,
}: {
  enabled?: boolean;
  theme?: "light" | "dark";
  perfScale?: number;
  active?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled || !active) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const POOL = Math.max(10, Math.floor(28 * perfScale));
    const pool: HTMLDivElement[] = [];
    let idx = 0;
    for (let i = 0; i < POOL; i++) {
      const d = document.createElement("div");
      d.className =
        "pointer-events-none absolute rounded-full will-change-transform";
      d.style.opacity = "0";
      el.appendChild(d);
      pool.push(d);
    }

    const onMove = (e: MouseEvent) => {
      last.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const { x, y } = last.current;
        const dot = pool[idx]!;
        idx = (idx + 1) % POOL;
        const size = Math.random() * 5 + 3;
        const ox = (Math.random() - 0.5) * 18;
        const oy = (Math.random() - 0.5) * 18;
        const color =
          theme === "dark"
            ? `hsl(${200 + Math.random() * 40},100%,80%)`
            : `hsl(${200 + Math.random() * 40},90%,60%)`;
        const filter =
          theme === "dark"
            ? "blur(2px) brightness(1.5)"
            : "blur(1px) brightness(0.95)";
        dot.style.transition = "none";
        dot.style.transform = "translate(-50%,-50%)";
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.left = `${x + ox}px`;
        dot.style.top = `${y + oy}px`;
        dot.style.background = `radial-gradient(circle, ${color} 0%, transparent 80%)`;
        dot.style.filter = filter;
        dot.style.opacity = "1";
        setTimeout(() => {
          const t = 800 + Math.random() * 400;
          dot.style.transition = `transform ${700 + Math.random() * 300}ms ease-out, opacity ${t}ms ease-out`;
          dot.style.transform = `translate(${(Math.random() - 0.5) * 40}px, ${(Math.random() - 0.5) * 40 - 32}px) scale(0)`;
          dot.style.opacity = "0";
        }, 20);
        rafRef.current = null;
      });
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      pool.forEach((d) => d.remove());
    };
  }, [enabled, theme, perfScale, active]);

  return { containerRef };
}

export default function NotFound() {
  const theme = useSystemTheme();
  const { deviceScale, shouldAnimate } = usePerformanceController();
  const [features] = useState({
    supernova: true,
    cosmicCursor: true,
    floatingDust: true,
    typewriter: true,
  });

  const { canvasRef, supernova } = useSupernovaExplosion({
    enabled: features.supernova && shouldAnimate,
    theme,
    perfScale: deviceScale,
  });
  const { containerRef } = useCosmicCursor({
    enabled: features.cosmicCursor,
    theme,
    perfScale: deviceScale,
    active: shouldAnimate,
  });

  const message = useMemo(
    () =>
      "This page hasn't just been lost; it has achieved glorious, explosive transcendence.",
    [],
  );
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || !features.typewriter) {
      setTyped(message);
      return;
    }
    let id: number;
    const tick = () => {
      setTyped(message.slice(0, i) + (Math.random() > 0.95 ? "█" : ""));
      i++;
      if (i > message.length) setTyped(message);
      else id = window.setTimeout(tick, 40);
    };
    tick();
    return () => clearTimeout(id);
  }, [message, features.typewriter]);

  // Initial burst
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!reduced) setTimeout(() => supernova(undefined, undefined, 1.0), 300);
  }, [supernova]);

  // Floating dust
  type Particle = {
    x: number;
    y: number;
    size: number;
    dur: number;
    delay: number;
    hue: number;
  };
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    // Generate particles client-side after mount to avoid SSR/client randomness mismatch
    const margin = 6; // keep particles away from hard edges to avoid clipping/moire
    const count = Math.max(10, Math.floor(24 * deviceScale));
    const rand = (m: number, M: number) => m + Math.random() * (M - m);
    const arr: Particle[] = Array.from({ length: count }, () => ({
      x: rand(margin, 100 - margin),
      y: rand(margin, 100 - margin),
      size: Math.random() * 18 + 8,
      dur: Math.random() * 14 + 14,
      delay: Math.random() * 8,
      hue: Math.floor(Math.random() * 360),
    }));
    setParticles(arr);
  }, [deviceScale]);

  const particleNodes = useMemo(
    () =>
      particles.map((p, i) => (
        <span
          key={i}
          className="gpu absolute rounded-full opacity-25 blur-md"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: `hsl(${p.hue}deg 100% ${theme === "dark" ? "70%" : "60%"})`,
            // Softer filter to avoid color banding/moire
            filter: "saturate(1.2) brightness(1.05)",
            // Use longhand properties to avoid conflicts with animationPlayState
            animationName: "floatY",
            animationDuration: `${p.dur}s`,
            animationTimingFunction: "ease-in-out",
            animationDelay: `${p.delay}s`,
            animationIterationCount: "infinite",
            animationDirection: "alternate",
            animationPlayState: shouldAnimate ? "running" : "paused",
            // Avoid blend-mode artifacts along edges
            mixBlendMode:
              theme === "dark" ? ("screen" as const) : ("normal" as const),
          }}
        />
      )),
    [particles, shouldAnimate, theme],
  );

  const onBurst = useCallback(
    (e: ReactMouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      supernova(e.clientX - rect.left, e.clientY - rect.top, 2.4);
    },
    [supernova],
  );

  return (
    <main
      ref={containerRef}
      className="relative isolate min-h-[100svh] overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 antialiased dark:from-slate-950 dark:via-slate-950 dark:to-black dark:text-slate-100"
    >
      {/* background dust */}
      {features.floatingDust && (
        <div className="absolute inset-0 overflow-hidden">{particleNodes}</div>
      )}
      {/* supernova canvas */}
      <canvas
        ref={canvasRef}
        className="gpu pointer-events-none absolute inset-0 h-full w-full"
      />
      {/* noise overlay (use existing asset) */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.04] dark:opacity-15"
        style={{
          backgroundImage: "url('/noise.svg')",
          backgroundBlendMode: theme === "dark" ? "overlay" : "normal",
        }}
      />

      <section className="relative z-20 mx-auto flex max-w-5xl flex-col items-center px-4 py-16 text-center sm:py-20 md:py-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/60 px-3 py-1 text-xs shadow-sm backdrop-blur dark:bg-white/10">
          <Shield /> 404 &mdash; Lost in the cosmos
        </div>

        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm sm:text-6xl md:text-7xl dark:text-white">
          <span className="inline-flex items-center gap-3">
            <Sparkles className="h-[1em] w-[1em] text-fuchsia-500" />
            Page not found
            <Stars className="h-[1em] w-[1em] text-blue-500" />
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-balance text-slate-600 dark:text-slate-300">
          {typed}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="group border-token relative inline-flex items-center gap-2 rounded-xl border bg-white/80 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:shadow-md dark:bg-white/10 dark:text-white"
          >
            <span
              className="absolute inset-0 -z-10 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(168,85,247,0.25), transparent 40%)",
              }}
            />
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <button
            onMouseMove={(e) => {
              const t = e.currentTarget as HTMLButtonElement;
              const r = t.getBoundingClientRect();
              t.style.setProperty("--x", `${e.clientX - r.left}px`);
              t.style.setProperty("--y", `${e.clientY - r.top}px`);
            }}
            onClick={onBurst}
            className="group relative inline-flex items-center gap-2 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-700 shadow-sm ring-1 ring-fuchsia-500/30 transition ring-inset hover:bg-fuchsia-500/20 dark:text-fuchsia-200"
          >
            <span
              className="absolute inset-0 -z-10 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(217,70,239,0.25), transparent 40%)",
              }}
            />
            <Rocket className="h-4 w-4" />
            Galaxy mode
          </button>
        </div>

        <div className="mt-10 text-xs text-slate-500 dark:text-slate-400">
          Tip: move your mouse and click Galaxy mode for fireworks{" "}
          <Zap className="inline h-3 w-3" />
        </div>
      </section>

      <style jsx global>{`
        @keyframes floatY {
          from {
            transform: translateY(-8px);
          }
          to {
            transform: translateY(8px);
          }
        }
      `}</style>
    </main>
  );
}

function Shield() {
  // small decorative shield/alert for the pill label
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/90 text-[10px] text-white shadow-sm">
      !
    </span>
  );
}
