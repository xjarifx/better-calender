"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const PX = 6;
const SHIP_W = 10;
const SHIP_H = 8;

type GameState = "playing" | "gameover";

interface Asteroid {
  id: number;
  x: number;
  y: number;
  r: number;
  speed: number;
  rot: number;
}

interface Laser {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
}

const SHIP_SPRITE: (string | null)[][] = [
  [null, null, null, null, "b", "b", null, null, null, null],
  [null, null, null, "b", null, null, "b", null, null, null],
  [null, null, "b", null, "y", "y", null, "b", null, null],
  [null, "b", null, null, null, null, null, null, "b", null],
  ["b", null, null, null, null, null, null, null, null, "b"],
  [null, "b", null, null, null, null, null, null, "b", null],
  [null, null, "b", null, null, null, null, "b", null, null],
  [null, null, null, "b", null, null, "b", null, null, null],
];

const SHIP_COLORS: Record<string, string> = {
  b: "#4A90D9",
  y: "#FFD700",
};

const ASTEROID_COLORS = ["#8B8B8B", "#7A7A7A", "#9A9A9A", "#6B6B6B"];

let nextId = 1;

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

function drawShip(ctx: CanvasRenderingContext2D, x: number, y: number) {
  for (let row = 0; row < SHIP_H; row++) {
    for (let col = 0; col < SHIP_W; col++) {
      const ch = SHIP_SPRITE[row][col];
      if (!ch) continue;
      ctx.fillStyle = SHIP_COLORS[ch];
      ctx.fillRect(x + col * PX, y + row * PX, PX, PX);
    }
  }
}

function drawAsteroid(ctx: CanvasRenderingContext2D, a: Asteroid) {
  const sides = 8 + Math.floor(a.r / 4);
  const wobble = (t: number) => (Math.sin(t * 3 + a.id) * 0.15 + 1);
  ctx.fillStyle = ASTEROID_COLORS[a.id % ASTEROID_COLORS.length];
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + a.rot;
    const rad = a.r * wobble(angle);
    const px = a.x + Math.cos(angle) * rad;
    const py = a.y + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

export default function EmptyStatePet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GameState>("playing");
  const shipXRef = useRef(150);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const invulnRef = useRef(0);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const lasersRef = useRef<Laser[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const spawnTimerRef = useRef(0);
  const shootTimerRef = useRef(0);
  const mouseXRef = useRef(150);
  const shootingRef = useRef(false);
  const dimsRef = useRef({ w: 368, h: 400 });

  const [gameState, setGameState] = useState<GameState>("playing");

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  // Resize + init
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      canvas.width = w;
      canvas.height = h;
      dimsRef.current = { w, h };
      shipXRef.current = w / 2 - (SHIP_W * PX) / 2;
      mouseXRef.current = shipXRef.current;

      // Init stars
      const stars: Star[] = [];
      for (let i = 0; i < 60; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          speed: 0.3 + Math.random() * 0.8,
          size: 0.5 + Math.random() * 1.5,
        });
      }
      starsRef.current = stars;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      const { w, h } = dimsRef.current;
      if (w <= 0 || h <= 0) return;

      if (stateRef.current === "playing") {
        // Stars
        for (const s of starsRef.current) {
          s.y += s.speed;
          if (s.y > h) { s.y = -2; s.x = Math.random() * w; }
        }

        // Spawn asteroids
        spawnTimerRef.current += 1;
        const interval = Math.max(300, 800 - Math.min(scoreRef.current, 400));
        if (spawnTimerRef.current > interval) {
          spawnTimerRef.current = 0;
          const r = randInt(12, 24);
          asteroidsRef.current.push({
            id: nextId++,
            x: rand(r, w - r),
            y: -r,
            r,
            speed: rand(0.5, 1.5 + scoreRef.current * 0.002),
            rot: rand(0, Math.PI * 2),
          });
        }

        // Move asteroids
        for (const a of asteroidsRef.current) {
          a.y += a.speed;
          a.rot += 0.02;
        }

        // Move lasers
        for (const l of lasersRef.current) {
          l.y -= 5;
        }

        // Shooting
        if (shootingRef.current) {
          shootTimerRef.current += 1;
          if (shootTimerRef.current > 5) {
            shootTimerRef.current = 0;
            lasersRef.current.push({
              x: shipXRef.current + (SHIP_W * PX) / 2 - 2,
              y: h - SHIP_H * PX - 30,
            });
          }
        }

        // Laser-asteroid collisions
        const newAsteroids: Asteroid[] = [];
        const destroyedLasers = new Set<number>();

        for (let ai = 0; ai < asteroidsRef.current.length; ai++) {
          const a = asteroidsRef.current[ai];
          let hit = false;
          for (let li = 0; li < lasersRef.current.length; li++) {
            const l = lasersRef.current[li];
            const dx = l.x - a.x;
            const dy = l.y - a.y;
            if (dx * dx + dy * dy < a.r * a.r) {
              hit = true;
              destroyedLasers.add(li);
              break;
            }
          }
          if (hit) {
            // Explosion particles
            for (let i = 0; i < 12; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = rand(1, 4);
              particlesRef.current.push({
                x: a.x,
                y: a.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color: ASTEROID_COLORS[a.id % ASTEROID_COLORS.length],
              });
            }
            if (a.r > 14) {
              const r1 = randInt(6, a.r * 0.7);
              const r2 = randInt(6, a.r * 0.7);
              newAsteroids.push({ ...a, id: nextId++, r: r1, speed: rand(0.8, 2) });
              newAsteroids.push({ ...a, id: nextId++, r: r2, speed: rand(0.8, 2) });
              scoreRef.current += 25;
            } else if (a.r > 8) {
              const r1 = randInt(4, 7);
              const r2 = randInt(4, 7);
              newAsteroids.push({ ...a, id: nextId++, r: r1, speed: rand(1, 3) });
              newAsteroids.push({ ...a, id: nextId++, r: r2, speed: rand(1, 3) });
              scoreRef.current += 50;
            } else {
              scoreRef.current += 100;
            }
          } else {
            newAsteroids.push(a);
          }
        }

        // Remove hit lasers
        lasersRef.current = lasersRef.current.filter((_, i) => !destroyedLasers.has(i));

        // Apply split asteroids
        asteroidsRef.current = newAsteroids;

        // Ship-asteroid collision
        if (invulnRef.current <= 0) {
          const cx = shipXRef.current + (SHIP_W * PX) / 2;
          const cy = dimsRef.current.h - (SHIP_H * PX) / 2 - 30;
          for (let ai = asteroidsRef.current.length - 1; ai >= 0; ai--) {
            const a = asteroidsRef.current[ai];
            const dx = cx - a.x;
            const dy = cy - a.y;
            if (dx * dx + dy * dy < (a.r + 12) * (a.r + 12)) {
              livesRef.current -= 1;
              invulnRef.current = 90;
              // Ship explosion
              for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = rand(2, 6);
                particlesRef.current.push({
                  x: cx,
                  y: cy,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  life: 1,
                  color: ["#4A90D9", "#FFD700", "#FFF"][i % 3],
                });
              }
              if (livesRef.current <= 0) {
                setGameState("gameover");
              }
              break;
            }
          }
        } else {
          invulnRef.current -= 1;
        }

        // Update particles
        for (const p of particlesRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.025;
        }

        // Clean off-screen objects
        asteroidsRef.current = asteroidsRef.current.filter((a) => a.y < h + a.r + 10);
        lasersRef.current = lasersRef.current.filter((l) => l.y > -10);
        particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      }

      // === RENDER ===
      ctx.clearRect(0, 0, w, h);

      // Dark space background
      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, w, h);

      // Stars
      for (const s of starsRef.current) {
        ctx.fillStyle = `rgba(255,255,255,${0.3 + s.size * 0.3})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (stateRef.current === "playing") {
        // Asteroids
        for (const a of asteroidsRef.current) {
          drawAsteroid(ctx, a);
        }

        // Lasers
        for (const l of lasersRef.current) {
          ctx.fillStyle = "#FF4444";
          ctx.shadowColor = "#FF4444";
          ctx.shadowBlur = 4;
          ctx.fillRect(l.x, l.y, 3, 12);
          ctx.shadowBlur = 0;
        }

        // Ship
        const shipY = h - SHIP_H * PX - 30;
        if (invulnRef.current <= 0 || Math.floor(invulnRef.current / 5) % 2 === 0) {
          drawShip(ctx, shipXRef.current, shipY);
        }

        // Particles
        for (const p of particlesRef.current) {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        }
        ctx.globalAlpha = 1;
      }

      // HUD
      ctx.fillStyle = "#FFF";
      ctx.font = "14px monospace";
      ctx.textAlign = "left";
      ctx.fillText("❤".repeat(Math.max(0, livesRef.current)), 12, 22);
      ctx.textAlign = "right";
      ctx.fillText(`Score: ${scoreRef.current}`, w - 12, 22);

      // Game over
      if (stateRef.current === "gameover") {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = "#FF4444";
        ctx.font = "bold 28px monospace";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", w / 2, h / 2 - 30);

        ctx.fillStyle = "#FFF";
        ctx.font = "18px monospace";
        ctx.fillText(`Score: ${scoreRef.current}`, w / 2, h / 2 + 10);

        ctx.font = "12px monospace";
        ctx.fillStyle = "#888";
        ctx.fillText("click to restart", w / 2, h / 2 + 45);
      }

      requestAnimationFrame(loop);
    };

    const raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { w } = dimsRef.current;
    let mx = e.clientX - rect.left - (SHIP_W * PX) / 2;
    mx = Math.max(0, Math.min(mx, w - SHIP_W * PX));
    shipXRef.current = mx;
    mouseXRef.current = mx;
  }, []);

  const handleMouseDown = useCallback(() => {
    if (stateRef.current === "playing") {
      shootingRef.current = true;
      shootTimerRef.current = 10;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    shootingRef.current = false;
    shootTimerRef.current = 0;
  }, []);

  const handleClick = useCallback(() => {
    if (stateRef.current === "gameover") {
      // Reset
      scoreRef.current = 0;
      livesRef.current = 3;
      invulnRef.current = 0;
      asteroidsRef.current = [];
      lasersRef.current = [];
      particlesRef.current = [];
      spawnTimerRef.current = 0;
      shootingRef.current = false;
      setGameState("playing");
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[300px] overflow-hidden cursor-none select-none"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
