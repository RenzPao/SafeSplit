'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Shield, Sparkles, AlertTriangle, Lock, CheckCircle2, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';

export type VaultMode = 'locked' | 'disbursed' | 'disputed';

interface ThreeVaultCanvasProps {
  onModeChange?: (mode: VaultMode) => void;
}

export default function ThreeVaultCanvas({ onModeChange }: ThreeVaultCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState<VaultMode>('locked');
  const [isInteracting, setIsInteracting] = useState(false);

  const modeRef = useRef<VaultMode>('locked');
  modeRef.current = activeMode;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. Scene, Camera, Renderer Setup ────────────────────────────
    const scene = new THREE.Scene();
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // On mobile, position camera further back so the vault isn't cut off
    camera.position.z = width < 640 ? 9.2 : 7.5;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    // ── 2. Materials & Color Themes ─────────────────────────────────
    const colorThemes = {
      locked: {
        core: new THREE.Color(0xa855f7),
        outer: new THREE.Color(0x38bdf8),
        rings: new THREE.Color(0x818cf8),
        particles: new THREE.Color(0xc084fc),
        speed: 1.0,
      },
      disbursed: {
        core: new THREE.Color(0x10b981),
        outer: new THREE.Color(0x34d399),
        rings: new THREE.Color(0xfacc15),
        particles: new THREE.Color(0x6ee7b7),
        speed: 2.2,
      },
      disputed: {
        core: new THREE.Color(0xf59e0b),
        outer: new THREE.Color(0xf43f5e),
        rings: new THREE.Color(0xfb7185),
        particles: new THREE.Color(0xfbbf24),
        speed: 0.7,
      },
    };

    // ── 3. Vault Core Geometries ────────────────────────────────────
    const vaultGroup = new THREE.Group();
    scene.add(vaultGroup);

    // Inner Icosahedron
    const innerGeo = new THREE.IcosahedronGeometry(1.3, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: colorThemes.locked.core,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8,
      emissive: colorThemes.locked.core,
      emissiveIntensity: 0.4,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    vaultGroup.add(innerMesh);

    // Outer Dodecahedron Cage
    const outerGeo = new THREE.DodecahedronGeometry(1.85, 0);
    const outerMat = new THREE.MeshBasicMaterial({
      color: colorThemes.locked.outer,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    vaultGroup.add(outerMesh);

    // Multi-Sig Orbital Rings
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: colorThemes.locked.rings,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const ringMat2 = ringMat1.clone();
    ringMat2.opacity = 0.4;

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.02, 16, 100), ringMat1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.015, 16, 100), ringMat2);
    ring1.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 4;
    vaultGroup.add(ring1);
    vaultGroup.add(ring2);

    // ── 4. Cosmic Particle Constellation ────────────────────────────
    const particleCount = width < 640 ? 400 : 700;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 3.0 + Math.random() * 4.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = radius * Math.cos(phi);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: colorThemes.locked.particles,
      size: width < 640 ? 0.05 : 0.04,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // ── 5. Lighting ────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xa855f7, 4, 20);
    pointLight.position.set(3, 4, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x38bdf8, 3, 20);
    pointLight2.position.set(-3, -4, 4);
    scene.add(pointLight2);

    // ── 6. Cursor & Touch Dynamics ──────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const rect = container.getBoundingClientRect();
      mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const deltaX = clientX - previousPointerX;
        const deltaY = clientY - previousPointerY;
        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;
        previousPointerX = clientX;
        previousPointerY = clientY;
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      setIsInteracting(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousPointerX = clientX;
      previousPointerY = clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('mousedown', handlePointerDown);
    container.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // ── 7. Animation Loop ───────────────────────────────────────────
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentTheme = colorThemes[modeRef.current];

      innerMat.color.lerp(currentTheme.core, 0.05);
      innerMat.emissive.lerp(currentTheme.core, 0.05);
      outerMat.color.lerp(currentTheme.outer, 0.05);
      ringMat1.color.lerp(currentTheme.rings, 0.05);
      ringMat2.color.lerp(currentTheme.rings, 0.05);
      particleMat.color.lerp(currentTheme.particles, 0.05);

      const speed = currentTheme.speed;
      innerMesh.rotation.x += 0.008 * speed;
      innerMesh.rotation.y += 0.012 * speed;

      outerMesh.rotation.x -= 0.005 * speed;
      outerMesh.rotation.y -= 0.007 * speed;

      ring1.rotation.z += 0.01 * speed;
      ring2.rotation.z -= 0.008 * speed;

      vaultGroup.rotation.y += (targetRotationY + mouseX * 0.3 - vaultGroup.rotation.y) * 0.05;
      vaultGroup.rotation.x += (targetRotationX - mouseY * 0.3 - vaultGroup.rotation.x) * 0.05;

      particleSystem.rotation.y = elapsedTime * 0.025 * speed;

      renderer.render(scene, camera);
    };

    animate();

    // ── 8. Resize Observer ──────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.position.z = newWidth < 640 ? 9.2 : 7.5;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // ── 9. Cleanup ──────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('mousedown', handlePointerDown);
      container.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      innerGeo.dispose();
      innerMat.dispose();
      outerGeo.dispose();
      outerMat.dispose();
      ring1.geometry.dispose();
      ring2.geometry.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  const switchMode = (mode: VaultMode) => {
    setActiveMode(mode);
    onModeChange?.(mode);
  };

  return (
    <div className="relative w-full h-[280px] sm:h-[380px] lg:h-[480px] flex items-center justify-center select-none group">
      {/* 3D WebGL Canvas with touch-action safe scroll */}
      <div
        ref={containerRef}
        style={{ touchAction: 'pan-y' }}
        className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
        title="Swipe or drag to orbit the Soroban Cryptographic Vault in 3D"
      />

      {/* Interactive Visual Mode Switcher Pills */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-[#0b0d17]/90 border border-white/[0.1] backdrop-blur-xl shadow-lg max-w-[95%] overflow-x-auto">
        <button
          onClick={() => switchMode('locked')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap ${
            activeMode === 'locked'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" />
          <span>Locked</span>
        </button>

        <button
          onClick={() => switchMode('disbursed')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap ${
            activeMode === 'disbursed'
              ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
          <span>Atomic Release</span>
        </button>

        <button
          onClick={() => switchMode('disputed')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap ${
            activeMode === 'disputed'
              ? 'bg-amber-600/30 text-amber-200 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
          <span>Arbiter Split</span>
        </button>
      </div>

      {/* Floating 3D Interaction Hint */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-zinc-400 backdrop-blur-md pointer-events-none">
        <RotateCw className="w-3 h-3 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
        <span>3D Soroban WebGL Core</span>
      </div>
    </div>
  );
}
