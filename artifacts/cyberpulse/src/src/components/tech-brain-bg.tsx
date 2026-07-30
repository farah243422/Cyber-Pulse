import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  pulse: number;
  pulseSpeed: number;
}

interface Packet {
  from: number;
  to: number;
  t: number;       // 0..1 progress
  speed: number;
}

const NODE_COUNT = 52;
const MAX_LINK_DIST = 160;
const PACKET_SPAWN_RATE = 0.018; // per frame per edge

/** Pseudo-brain layout: two lobes + stem */
function generateNodes(w: number, h: number): Node[] {
  const cx = w / 2;
  const cy = h / 2;
  const nodes: Node[] = [];

  // Left lobe
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 140 + 20;
    nodes.push({
      x: cx - 110 + Math.cos(angle) * r * 0.7,
      y: cy - 30  + Math.sin(angle) * r * 0.55,
      r: Math.random() * 2.5 + 1.5,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.008,
    });
  }

  // Right lobe
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 140 + 20;
    nodes.push({
      x: cx + 110 + Math.cos(angle) * r * 0.7,
      y: cy - 30  + Math.sin(angle) * r * 0.55,
      r: Math.random() * 2.5 + 1.5,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.008,
    });
  }

  // Stem / brainstem
  for (let i = 0; i < 8; i++) {
    nodes.push({
      x: cx + (Math.random() - 0.5) * 60,
      y: cy + 90 + i * 18,
      r: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.015 + 0.006,
    });
  }

  // Scattered circuit-trace nodes on edges
  for (let i = 0; i < 4; i++) {
    nodes.push({
      x: Math.random() * w * 0.2 + 10,
      y: Math.random() * h,
      r: 1.2,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01,
    });
    nodes.push({
      x: w - Math.random() * w * 0.2 - 10,
      y: Math.random() * h,
      r: 1.2,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01,
    });
  }

  return nodes;
}

export function TechBrainBg({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let nodes: Node[] = [];
    let packets: Packet[] = [];

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      nodes = generateNodes(canvas.width, canvas.height);
      packets = [];
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const PURPLE = "rgba(139,92,246,";   // primary
    const CYAN   = "rgba(6,182,212,";    // secondary

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // ── build edges ──────────────────────────────────────────────
      const edges: Array<[number, number, number]> = []; // [i, j, dist]
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_LINK_DIST) edges.push([i, j, d]);
        }
      }

      // ── draw edges ───────────────────────────────────────────────
      for (const [i, j, d] of edges) {
        const alpha = (1 - d / MAX_LINK_DIST) * 0.35;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = PURPLE + alpha + ")";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // ── spawn data packets ───────────────────────────────────────
      for (const [i, j] of edges) {
        if (Math.random() < PACKET_SPAWN_RATE * 0.05) {
          packets.push({ from: i, to: j, t: 0, speed: Math.random() * 0.012 + 0.006 });
        }
      }

      // ── draw & advance packets ───────────────────────────────────
      packets = packets.filter(p => {
        p.t += p.speed;
        if (p.t > 1) return false;

        const a = nodes[p.from];
        const b = nodes[p.to];
        const px = a.x + (b.x - a.x) * p.t;
        const py = a.y + (b.y - a.y) * p.t;

        const g = ctx.createRadialGradient(px, py, 0, px, py, 5);
        g.addColorStop(0, CYAN + "0.9)");
        g.addColorStop(1, CYAN + "0)");
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // trail
        const tx = a.x + (b.x - a.x) * Math.max(0, p.t - 0.12);
        const ty = a.y + (b.y - a.y) * Math.max(0, p.t - 0.12);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.strokeStyle = CYAN + "0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        return true;
      });

      // ── draw nodes ───────────────────────────────────────────────
      for (const n of nodes) {
        n.pulse += n.pulseSpeed;
        const glow = 0.55 + Math.sin(n.pulse) * 0.45;

        // outer glow
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        g.addColorStop(0, PURPLE + (glow * 0.6) + ")");
        g.addColorStop(1, PURPLE + "0)");
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // core
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = glow > 0.7 ? CYAN + "0.95)" : PURPLE + "0.9)";
        ctx.fill();
      }

      // ── move nodes (slow drift, bounce off walls) ─────────────────
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
