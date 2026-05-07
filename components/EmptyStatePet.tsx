"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type PetState = "idle" | "walk" | "react";

const EMOJIS = ["🐱", "🐶", "🐰", "🐼", "🦊", "🐸"];

const CAT_PALETTE = {
  d: "#2D2D2D",
  p: "#FFB5B5",
  o: "#D4845A",
  e: "#4ECDC4",
  n: "#FF8C8C",
  w: "#FFF5E6",
  b: "#FFB0B0",
};

// 8 wide x 10 tall pixel cat
const PIXEL_CAT = [
  ["_", "d", "d", "_", "_", "d", "d", "_"],
  ["d", "p", "d", "d", "d", "d", "p", "d"],
  ["d", "o", "o", "o", "o", "o", "o", "d"],
  ["d", "o", "o", "o", "o", "o", "o", "d"],
  ["d", "o", "e", "o", "o", "e", "o", "d"],
  ["d", "o", "o", "o", "o", "o", "o", "d"],
  ["d", "o", "o", "n", "o", "o", "o", "d"],
  ["d", "d", "o", "o", "o", "d", "d", "_"],
  ["_", "d", "d", "w", "w", "d", "d", "_"],
  ["_", "_", "d", "d", "d", "d", "_", "_"],
];

// ---- Geometric Cat (SVG) ----

function GeometricCat({ isReact, state }: { isReact: boolean; state: PetState }) {
  const anim = isReact ? "animate-spring" : state === "walk" ? "animate-bob" : "animate-float";

  return (
    <div className={`select-none ${anim}`}>
      <svg width="80" height="90" viewBox="0 0 80 90" fill="none">
        <polygon points="15,35 5,5 25,20" fill="#D4845A" />
        <polygon points="16,30 10,14 22,22" fill="#FFB5B5" />
        <polygon points="65,35 75,5 55,20" fill="#D4845A" />
        <polygon points="64,30 70,14 58,22" fill="#FFB5B5" />
        <ellipse cx="40" cy="50" rx="32" ry="30" fill="#D4845A" />
        <ellipse cx="40" cy="55" rx="22" ry="20" fill="#FFF5E6" />
        <ellipse cx="28" cy="45" rx="6" ry="7" fill="white" />
        <ellipse cx="52" cy="45" rx="6" ry="7" fill="white" />
        <ellipse cx="28" cy="45" rx="3" ry="3.5" fill="#2D2D2D">
          <animate attributeName="ry" dur="4s" repeatCount="indefinite"
            values="3.5;3.5;3.5;0.5;3.5;3.5" keyTimes="0;0.85;0.92;0.95;0.97;1" />
        </ellipse>
        <ellipse cx="52" cy="45" rx="3" ry="3.5" fill="#2D2D2D">
          <animate attributeName="ry" dur="4s" repeatCount="indefinite"
            values="3.5;3.5;3.5;0.5;3.5;3.5" keyTimes="0;0.85;0.92;0.95;0.97;1" />
        </ellipse>
        <ellipse cx="40" cy="53" rx="3" ry="2" fill="#FF8C8C" />
        <path d="M34,58 Q40,64 46,58" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="26" y1="52" x2="8" y2="48" stroke="#2D2D2D" strokeWidth="0.8" opacity="0.25" />
        <line x1="26" y1="55" x2="6" y2="55" stroke="#2D2D2D" strokeWidth="0.8" opacity="0.25" />
        <line x1="26" y1="58" x2="8" y2="62" stroke="#2D2D2D" strokeWidth="0.8" opacity="0.25" />
        <line x1="54" y1="52" x2="72" y2="48" stroke="#2D2D2D" strokeWidth="0.8" opacity="0.25" />
        <line x1="54" y1="55" x2="74" y2="55" stroke="#2D2D2D" strokeWidth="0.8" opacity="0.25" />
        <line x1="54" y1="58" x2="72" y2="62" stroke="#2D2D2D" strokeWidth="0.8" opacity="0.25" />
        <circle cx="16" cy="55" r="5" fill="#FFB0B0" opacity="0.35" />
        <circle cx="64" cy="55" r="5" fill="#FFB0B0" opacity="0.35" />
      </svg>
    </div>
  );
}

// ---- Blob Pet (SVG morphing) ----

function BlobPet({ isReact, state }: { isReact: boolean; state: PetState }) {
  const anim = isReact ? "animate-spring" : state === "walk" ? "animate-bob" : "animate-float";
  const [morph, setMorph] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setMorph((p) => !p), 2500);
    return () => clearInterval(t);
  }, []);

  const path = morph
    ? "M35,8 C52,8 62,18 62,35 C62,52 52,72 35,72 C18,72 8,52 8,35 C8,18 18,8 35,8Z"
    : "M35,5 C50,5 65,15 65,35 C65,55 55,75 35,75 C15,75 5,55 5,35 C5,15 20,5 35,5Z";

  return (
    <div className={`select-none ${anim}`}>
      <svg width="70" height="80" viewBox="0 0 70 80" fill="none">
        <path d={path} fill="#FFB5C2" style={{ transition: "d 0.8s ease-in-out" }} />
        <circle cx="26" cy="32" r="4.5" fill="#2D2D2D" />
        <circle cx="44" cy="32" r="4.5" fill="#2D2D2D" />
        <path d="M28,44 Q35,50 42,44" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="18" cy="40" r="5" fill="#FF8C8C" opacity="0.3" />
        <circle cx="52" cy="40" r="5" fill="#FF8C8C" opacity="0.3" />
      </svg>
    </div>
  );
}

// ---- Emoji Pet ----

function EmojiPet({ isReact, state }: { isReact: boolean; state: PetState }) {
  const [emoji] = useState(() => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
  const anim = isReact ? "animate-spring" : state === "walk" ? "animate-bob" : "animate-float";

  return (
    <div className={`select-none ${anim}`}>
      <span className="block text-center leading-none" style={{ fontSize: "64px" }}>
        {emoji}
      </span>
    </div>
  );
}

// ---- Pixel Cat (grid) ----

function PixelCat({ isReact, state }: { isReact: boolean; state: PetState }) {
  const PX = 6;
  const anim = isReact ? "animate-spring" : state === "walk" ? "animate-bob" : "animate-float";

  return (
    <div className={`select-none ${anim}`}>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(8, ${PX}px)`,
          gridTemplateRows: `repeat(10, ${PX}px)`,
        }}
      >
        {PIXEL_CAT.flatMap((row, y) =>
          row.map((ch, x) => (
            <div
              key={`${y}-${x}`}
              style={{
                width: PX,
                height: PX,
                backgroundColor: ch === "_" ? "transparent" : CAT_PALETTE[ch as keyof typeof CAT_PALETTE],
                borderRadius: ch === "e" ? "50%" : 0,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ---- Main component ----

const PET_COMPONENTS = [GeometricCat, BlobPet, EmojiPet, PixelCat] as const;

export default function EmptyStatePet() {
  const [styleIndex, setStyleIndex] = useState(() => Math.floor(Math.random() * PET_COMPONENTS.length));
  const [state, setState] = useState<PetState>("idle");
  const [x, setX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const reactTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const PetComponent = PET_COMPONENTS[styleIndex];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const maxX = container.clientWidth - 80;
    if (maxX > 0) setX(Math.random() * maxX);
  }, [styleIndex]);

  const walk = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const maxX = container.clientWidth - 80;
    if (maxX <= 0) return;

    let pos = x;
    let dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
    if (pos <= 0) dir = 1;
    if (pos >= maxX) dir = -1;

    const animate = () => {
      pos += dir * 0.7;
      if (pos <= 0) { pos = 0; dir = 1; }
      if (pos >= maxX) { pos = maxX; dir = -1; }
      setX(pos);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [x]);

  useEffect(() => {
    if (state !== "walk") {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    walk();
    return () => cancelAnimationFrame(rafRef.current);
  }, [state, walk]);

  useEffect(() => {
    const transition = () => {
      setState((prev) => {
        if (prev === "react") return prev;
        return Math.random() > 0.45 ? "walk" : "idle";
      });
    };
    const t = setInterval(transition, 2500 + Math.random() * 2000);
    return () => clearInterval(t);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setState("react");
    clearTimeout(reactTimeoutRef.current);
    reactTimeoutRef.current = setTimeout(() => setState("idle"), 2000);
  }, []);

  const handleClick = useCallback(() => {
    setStyleIndex((i) => (i + 1) % PET_COMPONENTS.length);
  }, []);

  useEffect(() => {
    return () => clearTimeout(reactTimeoutRef.current);
  }, []);

  const isReact = state === "react";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[300px] overflow-hidden cursor-pointer select-none"
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      <div
        className="absolute top-1/2"
        style={{
          left: x,
          translate: "0 -50%",
        }}
      >
        <PetComponent isReact={isReact} state={state} />
      </div>
    </div>
  );
}
