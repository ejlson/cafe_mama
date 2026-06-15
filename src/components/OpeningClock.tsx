"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// Soft studio environment → realistic reflections on the metal parts.
function Env() {
  const { scene, gl } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    // eslint-disable-next-line react-hooks/immutability -- standard R3F idiom
    scene.environment = env;
    return () => {
      env.dispose();
      pmrem.dispose();
      scene.environment = null;
    };
  }, [scene, gl]);
  return null;
}

/**
 * 3D opening-hours watch (three.js / react-three-fiber), styled after the
 * yellow-gold Audemars Piguet × Swatch Royal Oak: an octagonal gold bezel with
 * eight screws, a deep-navy dial with applied baton markers and a "CM&S ×
 * ROLOX" co-brand. You can grab and spin it (drag, with throw inertia); the
 * caseback reads "AUTHENTIC ROLOX — 1 OF 1". The hands track real local time.
 * A pill reads OPEN / CLOSED (green / red) — the second hand matches.
 *
 * Hours mirror the Location widget: Mon–Fri 8:00–18:00, Sat & Sun 9:00–17:00.
 * Keep these in sync with HOURS in Location.tsx.
 */
const OPEN_COLOR = "#1f9d57";
const CLOSED_COLOR = "#e11414";
const GOLD = "#f4c33c";
const GOLD_DARK = "#bd8e22";
const NAVY = "#16233f";
const SILVER = "#dcd7c6";
const ENGRAVE = "#3a2c0a";

type Ctrl = {
  dragging: boolean;
  px: number;
  py: number;
  rotY: number;
  rotX: number;
  velY: number;
};

function hoursFor(day: number): [number, number] {
  if (day === 0 || day === 6) return [9, 17];
  return [8, 18];
}
function isOpenNow(d: Date) {
  const [open, close] = hoursFor(d.getDay());
  const t = d.getHours() + d.getMinutes() / 60;
  return t >= open && t < close;
}

// Draw centred text lines onto a transparent canvas → texture. With `engrave`,
// a lit lower-right edge is drawn under the dark fill so the text reads as cut
// into the metal.
function textTexture(
  lines: { text: string; size: number; y: number }[],
  color: string,
  engrave = false,
) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const l of lines) {
      ctx.font = `900 ${l.size}px 'Arial Black', Arial, sans-serif`;
      if (engrave) {
        // lit bottom edge of the groove (light comes from top-left)
        ctx.fillStyle = "rgba(255,240,196,0.6)";
        ctx.fillText(l.text, 256 + 1.6, l.y + 1.8);
      }
      ctx.fillStyle = color;
      ctx.fillText(l.text, 256, l.y);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

// An octagon with softly rounded corners, as a THREE.Shape (flat edge up).
function roundedOctagonShape(radius: number, round: number) {
  const n = 8;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.PI / 8;
    pts.push(new THREE.Vector2(Math.cos(a) * radius, Math.sin(a) * radius));
  }
  const shape = new THREE.Shape();
  for (let i = 0; i < n; i++) {
    const curr = pts[i];
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    const dirIn = curr.clone().sub(prev).normalize();
    const dirOut = next.clone().sub(curr).normalize();
    const p1 = curr.clone().addScaledVector(dirIn, -round);
    const p2 = curr.clone().addScaledVector(dirOut, round);
    if (i === 0) shape.moveTo(p1.x, p1.y);
    else shape.lineTo(p1.x, p1.y);
    shape.quadraticCurveTo(curr.x, curr.y, p2.x, p2.y);
  }
  shape.closePath();
  return shape;
}

function Hand({
  innerRef,
  length,
  width,
  z,
  color,
}: {
  innerRef: React.RefObject<THREE.Group | null>;
  length: number;
  width: number;
  z: number;
  color: string;
}) {
  return (
    <group ref={innerRef}>
      <mesh position={[0, length / 2 - 0.08, z]}>
        <boxGeometry args={[width, length, 0.03]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Watch({ accent }: { accent: string }) {
  const group = useRef<THREE.Group>(null);
  const hourRef = useRef<THREE.Group>(null);
  const minRef = useRef<THREE.Group>(null);
  const secRef = useRef<THREE.Group>(null);
  const ctrl = useRef<Ctrl>({ dragging: false, px: 0, py: 0, rotY: 0, rotX: 0, velY: 0 });
  const { gl } = useThree();

  // Drag-to-spin, attached to the canvas element (so we never mutate a prop).
  useEffect(() => {
    const el = gl.domElement;
    const c = ctrl.current;
    const down = (e: PointerEvent) => {
      c.dragging = true;
      c.px = e.clientX;
      c.py = e.clientY;
      c.velY = 0;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!c.dragging) return;
      const dx = e.clientX - c.px;
      const dy = e.clientY - c.py;
      c.rotY += dx * 0.01;
      c.rotX = Math.max(-0.7, Math.min(0.7, c.rotX + dy * 0.01));
      c.velY = dx * 0.01;
      c.px = e.clientX;
      c.py = e.clientY;
    };
    const up = (e: PointerEvent) => {
      c.dragging = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointerleave", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointerleave", up);
    };
  }, [gl]);

  const brandTex = useMemo(
    () =>
      textTexture(
        [
          { text: "CM&S", size: 96, y: 92 },
          { text: "× ROLOX", size: 54, y: 172 },
        ],
        SILVER,
      ),
    [],
  );
  const backTex = useMemo(
    () =>
      textTexture(
        [
          { text: "AUTHENTIC", size: 46, y: 66 },
          { text: "ROLOX", size: 78, y: 138 },
          { text: "1 OF 1", size: 44, y: 206 },
        ],
        ENGRAVE,
        true,
      ),
    [],
  );
  // rounded-corner octagonal case, extruded with a small edge bevel
  const caseGeo = useMemo(() => {
    const shape = roundedOctagonShape(1.05, 0.16);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.26,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.035,
      bevelSegments: 4,
      curveSegments: 10,
    });
    geo.center();
    return geo;
  }, []);
  useEffect(() => {
    return () => {
      brandTex.dispose();
      backTex.dispose();
      caseGeo.dispose();
    };
  }, [brandTex, backTex, caseGeo]);

  useFrame((state, delta) => {
    const d = new Date();
    const s = d.getSeconds() + d.getMilliseconds() / 1000;
    const m = d.getMinutes() + s / 60;
    const h = (d.getHours() % 12) + m / 60;
    const TAU = Math.PI * 2;
    if (secRef.current) secRef.current.rotation.z = -(s / 60) * TAU;
    if (minRef.current) minRef.current.rotation.z = -(m / 60) * TAU;
    if (hourRef.current) hourRef.current.rotation.z = -(h / 12) * TAU;

    const g = group.current;
    const c = ctrl.current;
    if (!g || !c) return;
    if (c.dragging) {
      g.rotation.y = c.rotY;
      g.rotation.x = c.rotX;
    } else {
      // throw inertia + a slow, constant idle spin; tilt eases back upright
      c.rotY += c.velY;
      c.velY *= 0.95;
      c.rotY += delta * 0.12; // ~50s per revolution
      const targetX = Math.sin(state.clock.elapsedTime * 0.4) * 0.06; // gentle bob
      c.rotX += (targetX - c.rotX) * 0.03;
      g.rotation.y = c.rotY;
      g.rotation.x = c.rotX;
    }
  });

  return (
    <group ref={group}>
      {/* octagonal gold case with softly rounded corners + bevelled edges */}
      <mesh geometry={caseGeo}>
        <meshStandardMaterial color={GOLD} metalness={0.95} roughness={0.26} />
      </mesh>

      {/* caseback engraving — only visible once you spin it round */}
      <mesh position={[0, 0, -0.18]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.4, 0.7]} />
        <meshBasicMaterial map={backTex} transparent toneMapped={false} />
      </mesh>

      {/* eight bezel screws at the octagon corners, each with a slot groove */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        const r = 0.9;
        const slot = i * 1.3; // varied slot orientation per screw
        return (
          <group key={i} position={[Math.cos(a) * r, Math.sin(a) * r, 0.2]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.05, 24]} />
              <meshStandardMaterial color={GOLD_DARK} metalness={0.95} roughness={0.28} />
            </mesh>
            {/* slot groove */}
            <mesh position={[0, 0, 0.027]} rotation={[0, 0, slot]}>
              <boxGeometry args={[0.105, 0.016, 0.02]} />
              <meshStandardMaterial color="#241b08" metalness={0.4} roughness={0.7} />
            </mesh>
          </group>
        );
      })}

      {/* navy dial, recessed so the bezel frames it */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.22]}>
        <cylinderGeometry args={[0.78, 0.78, 0.06, 48]} />
        <meshStandardMaterial color={NAVY} metalness={0.45} roughness={0.45} />
      </mesh>

      {/* applied baton hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r = 0.62;
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * r, Math.cos(a) * r, 0.27]}
            rotation={[0, 0, -a]}
          >
            <boxGeometry args={[0.045, i % 3 === 0 ? 0.16 : 0.11, 0.02]} />
            <meshStandardMaterial color={SILVER} metalness={0.95} roughness={0.18} />
          </mesh>
        );
      })}

      {/* CM&S × ROLOX co-brand, under 12 o'clock */}
      <mesh position={[0, 0.3, 0.27]}>
        <planeGeometry args={[0.78, 0.39]} />
        <meshBasicMaterial map={brandTex} transparent toneMapped={false} />
      </mesh>

      {/* date window at 3 o'clock */}
      <mesh position={[0.46, 0, 0.27]}>
        <boxGeometry args={[0.13, 0.1, 0.02]} />
        <meshStandardMaterial color={SILVER} roughness={0.4} />
      </mesh>

      {/* hands */}
      <Hand innerRef={hourRef} length={0.46} width={0.055} z={0.3} color={SILVER} />
      <Hand innerRef={minRef} length={0.64} width={0.04} z={0.32} color={SILVER} />
      <Hand innerRef={secRef} length={0.68} width={0.018} z={0.34} color={accent} />
      {/* centre hub */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.36]}>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 24]} />
        <meshStandardMaterial color={GOLD} metalness={0.95} roughness={0.22} />
      </mesh>
    </group>
  );
}

export default function OpeningClock({ className = "" }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const t = setInterval(tick, 20000);
    return () => clearInterval(t);
  }, []);

  if (!now) return null;

  const open = isOpenNow(now);
  const accent = open ? OPEN_COLOR : CLOSED_COLOR;

  return (
    <div
      className={`cursor-grab touch-none active:cursor-grabbing ${className}`}
      aria-label={open ? "Open now" : "Closed"}
      title={open ? "Open now — drag to spin" : "Closed — drag to spin"}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 34 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        style={{ background: "transparent", touchAction: "none" }}
      >
        <Env />
        <ambientLight intensity={0.25} />
        <directionalLight position={[2, 4, 5]} intensity={1.3} />
        <directionalLight position={[-3, 1, 2]} intensity={0.4} />
        <Watch accent={accent} />
      </Canvas>

      {/* OPEN / CLOSED pill */}
      <span
        className="font-arialblack pointer-events-none absolute bottom-[10%] left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-[0.6rem] uppercase leading-none tracking-wide text-cream sm:text-xs"
        style={{ backgroundColor: accent }}
      >
        {open ? "Open" : "Closed"}
      </span>
    </div>
  );
}
