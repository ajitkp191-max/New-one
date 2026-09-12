import { useEffect, useRef, useState } from 'react';
import { Play, Sparkles, Activity, Info, Pause, Eye, Heart, Camera, Radio } from 'lucide-react';
import { PerformanceMode } from '../types';

interface ThreeDSceneProps {
  performanceMode: PerformanceMode;
  setPerformanceMode: (mode: PerformanceMode) => void;
}

type CameraPreset = 'clinic' | 'vitals' | 'patient';

export default function ThreeDScene({ performanceMode, setPerformanceMode }: ThreeDSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [interactionMsg, setInteractionMsg] = useState<string | null>("Hover or move cursor to tilt 3D clinic environment");
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('clinic');
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const cameraZoomRef = useRef({ zoom: 1, panX: 0, panY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || performanceMode === 'disabled') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    let frame = 0;
    const particles: { x: number; y: number; size: number; speed: number; angle: number; opacity: number; color: string }[] = [];
    const particleCount = performanceMode === 'low-perf' ? 12 : 40;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 1,
        speed: Math.random() * 0.4 + 0.15,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.6 + 0.2,
        color: i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#2dd4bf' : '#ffffff',
      });
    }

    const render = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const isReduced = performanceMode === 'reduced-motion';
      if (isPlaying && !isReduced) {
        frame += 1;
      } else if (isReduced) {
        frame += 0.1;
      }

      // Smooth camera interpolation towards active preset
      let targetZoom = 1;
      let targetPanX = 0;
      let targetPanY = 0;
      if (cameraPreset === 'vitals') {
        targetZoom = 1.35;
        targetPanX = -width * 0.05;
        targetPanY = height * 0.12;
      } else if (cameraPreset === 'patient') {
        targetZoom = 1.25;
        targetPanX = -width * 0.08;
        targetPanY = -height * 0.04;
      }

      cameraZoomRef.current.zoom += (targetZoom - cameraZoomRef.current.zoom) * 0.06;
      cameraZoomRef.current.panX += (targetPanX - cameraZoomRef.current.panX) * 0.06;
      cameraZoomRef.current.panY += (targetPanY - cameraZoomRef.current.panY) * 0.06;

      // Smooth mouse parallax lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;
      const tiltX = mouseRef.current.x * 25 + cameraZoomRef.current.panX;
      const tiltY = mouseRef.current.y * 15 + cameraZoomRef.current.panY;

      // 1. Studio Clinical Ambient Lighting & Soft Horizon Gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2 + tiltX * 0.5,
        height * 0.35 + tiltY * 0.5,
        40,
        width / 2,
        height * 0.5,
        Math.max(width, height)
      );
      bgGrad.addColorStop(0, '#f0fdff');
      bgGrad.addColorStop(0.4, '#e6f7f9');
      bgGrad.addColorStop(0.85, '#dbecee');
      bgGrad.addColorStop(1, '#c5dfe3');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Floor Reflection line & Horizon Perspective
      const horizonY = height * 0.68 + tiltY * 0.3;
      const floorGrad = ctx.createLinearGradient(0, horizonY - 20, 0, height);
      floorGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      floorGrad.addColorStop(0.1, 'rgba(203, 213, 225, 0.45)');
      floorGrad.addColorStop(1, 'rgba(148, 163, 184, 0.5)');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // Perspective Grid Lines on Floor
      ctx.strokeStyle = 'rgba(13, 148, 136, 0.1)';
      ctx.lineWidth = 1;
      for (let x = -width; x < width * 2; x += 55) {
        ctx.beginPath();
        ctx.moveTo(x + tiltX * 0.8, horizonY);
        ctx.lineTo(x * 1.8 + tiltX * 1.6, height);
        ctx.stroke();
      }

      // Overhead Volumetric Surgical Luminaire Light Cones
      const lampX1 = width * 0.38 + tiltX * 0.4;
      const lampX2 = width * 0.62 + tiltX * 0.4;
      const lampY = 24;

      // Surgical Light Cone 1
      const coneGrad1 = ctx.createLinearGradient(lampX1, lampY, lampX1 - 30, horizonY);
      coneGrad1.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      coneGrad1.addColorStop(0.4, 'rgba(56, 189, 248, 0.08)');
      coneGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = coneGrad1;
      ctx.beginPath();
      ctx.moveTo(lampX1 - 25, lampY + 8);
      ctx.lineTo(lampX1 + 25, lampY + 8);
      ctx.lineTo(lampX1 + 110, horizonY + 20);
      ctx.lineTo(lampX1 - 110, horizonY + 20);
      ctx.closePath();
      ctx.fill();

      // Surgical Light Cone 2
      const coneGrad2 = ctx.createLinearGradient(lampX2, lampY, lampX2 + 30, horizonY);
      coneGrad2.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      coneGrad2.addColorStop(0.4, 'rgba(45, 212, 191, 0.08)');
      coneGrad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = coneGrad2;
      ctx.beginPath();
      ctx.moveTo(lampX2 - 25, lampY + 8);
      ctx.lineTo(lampX2 + 25, lampY + 8);
      ctx.lineTo(lampX2 + 110, horizonY + 20);
      ctx.lineTo(lampX2 - 110, horizonY + 20);
      ctx.closePath();
      ctx.fill();

      // Surgical Luminaire Pods
      [lampX1, lampX2].forEach((lx) => {
        // Arm
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, lampY);
        ctx.stroke();

        // Round LED Pod
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(lx, lampY + 4, 30, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Luminous Core
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(lx, lampY + 6, 24, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Wall-Mounted 3D Digital Telemetry Monitor
      const monitorX = width * 0.16 + tiltX * 0.35;
      const monitorY = height * 0.28 + tiltY * 0.35;
      const monitorW = 110;
      const monitorH = 75;

      // Monitor Casing with shadow
      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.25)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(monitorX, monitorY, monitorW, monitorH, 8);
      ctx.fill();
      ctx.restore();

      // Screen Glass & Cyan Vitals Display
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.roundRect(monitorX + 4, monitorY + 4, monitorW - 8, monitorH - 8, 6);
      ctx.fill();

      // Screen Live ECG Line on Monitor
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let mx = 0; mx < monitorW - 14; mx += 3) {
        const my = monitorY + 24 + Math.sin((mx + frame * 3) * 0.2) * (mx % 30 > 10 && mx % 30 < 18 ? 9 : 2);
        if (mx === 0) ctx.moveTo(monitorX + 7 + mx, my);
        else ctx.lineTo(monitorX + 7 + mx, my);
      }
      ctx.stroke();

      // Text stats on monitor screen
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('HR: 76 BPM', monitorX + 8, monitorY + 48);
      ctx.fillStyle = '#34d399';
      ctx.fillText('SpO2: 99%', monitorX + 8, monitorY + 60);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('TEMP: 38.5°C', monitorX + 62, monitorY + 60);

      // 3. Examination Table with Metallic Specular Highlights & Ambient Occlusion
      const tableCenter = { x: width * 0.52 + tiltX, y: height * 0.65 + tiltY };
      const tableWidth = Math.min(width * 0.58, 430);
      const tableHeight = 36;

      // Realistic Soft Contact Shadows (layered for ambient occlusion)
      const shadowGrad = ctx.createRadialGradient(
        tableCenter.x, tableCenter.y + 18, 10,
        tableCenter.x, tableCenter.y + 18, tableWidth * 0.6
      );
      shadowGrad.addColorStop(0, 'rgba(15, 23, 42, 0.32)');
      shadowGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.14)');
      shadowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(tableCenter.x, tableCenter.y + 20, tableWidth * 0.55, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Table Stainless Steel Heavy Columns
      const leftLegX = tableCenter.x - tableWidth * 0.28;
      const rightLegX = tableCenter.x + tableWidth * 0.28;

      const legGrad = ctx.createLinearGradient(leftLegX - 7, 0, leftLegX + 7, 0);
      legGrad.addColorStop(0, '#64748b');
      legGrad.addColorStop(0.35, '#f8fafc');
      legGrad.addColorStop(0.65, '#cbd5e1');
      legGrad.addColorStop(1, '#475569');

      ctx.fillStyle = legGrad;
      ctx.fillRect(leftLegX - 7, tableCenter.y, 14, height - tableCenter.y - 12);
      ctx.fillRect(rightLegX - 7, tableCenter.y, 14, height - tableCenter.y - 12);

      // Metallic Cast Base Pod
      const baseGrad = ctx.createLinearGradient(0, height - 20, 0, height);
      baseGrad.addColorStop(0, '#94a3b8');
      baseGrad.addColorStop(0.5, '#475569');
      baseGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.roundRect(tableCenter.x - tableWidth * 0.35, height - 18, tableWidth * 0.7, 16, 8);
      ctx.fill();

      // Modern Glass-Polymer Table Top (Rounded Chamfer & Cyan Luminescent Core)
      ctx.save();
      ctx.shadowColor = 'rgba(6, 182, 212, 0.4)';
      ctx.shadowBlur = 20;
      
      const tableSurfaceGrad = ctx.createLinearGradient(0, tableCenter.y - 14, 0, tableCenter.y + tableHeight);
      tableSurfaceGrad.addColorStop(0, '#ffffff');
      tableSurfaceGrad.addColorStop(0.4, '#f8fafc');
      tableSurfaceGrad.addColorStop(0.8, '#e2e8f0');
      tableSurfaceGrad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = tableSurfaceGrad;
      ctx.beginPath();
      ctx.roundRect(tableCenter.x - tableWidth / 2, tableCenter.y - 14, tableWidth, tableHeight, 14);
      ctx.fill();
      ctx.restore();

      // Metallic Rim Glow & Cyan LED accent strip
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(tableCenter.x - tableWidth / 2 + 2, tableCenter.y - 12, tableWidth - 4, tableHeight - 4, 12);
      ctx.stroke();

      // 4. Realistic 3D Doctor Figure (Anatomical depth & volumetric shading)
      const vetPos = { x: tableCenter.x - tableWidth * 0.32, y: tableCenter.y - 14 };
      const vetBreatheY = Math.sin(frame * 0.04) * 2.5;

      // Doctor's Soft Shadow on Table
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
      ctx.beginPath();
      ctx.ellipse(vetPos.x, vetPos.y + 4, 30, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Vet Torso (Medical Scrubs + White Lab Coat with Realistic Depth)
      const coatGrad = ctx.createLinearGradient(vetPos.x - 30, 0, vetPos.x + 30, 0);
      coatGrad.addColorStop(0, '#e2e8f0');
      coatGrad.addColorStop(0.3, '#ffffff');
      coatGrad.addColorStop(0.7, '#f8fafc');
      coatGrad.addColorStop(1, '#cbd5e1');

      ctx.fillStyle = coatGrad;
      ctx.beginPath();
      ctx.moveTo(vetPos.x - 32, vetPos.y);
      ctx.lineTo(vetPos.x - 22, vetPos.y - 115 + vetBreatheY);
      ctx.lineTo(vetPos.x + 22, vetPos.y - 115 + vetBreatheY);
      ctx.lineTo(vetPos.x + 32, vetPos.y);
      ctx.closePath();
      ctx.fill();

      // Cyan V-Neck Scrub inside coat
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(vetPos.x - 14, vetPos.y - 108 + vetBreatheY);
      ctx.lineTo(vetPos.x, vetPos.y - 65 + vetBreatheY);
      ctx.lineTo(vetPos.x + 14, vetPos.y - 108 + vetBreatheY);
      ctx.closePath();
      ctx.fill();

      // Stethoscope (Realistic chrome arch + cyan tubing)
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(vetPos.x, vetPos.y - 94 + vetBreatheY, 15, 0, Math.PI, false);
      ctx.stroke();

      // Chrome Bell & Earpieces
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(vetPos.x - 15, vetPos.y - 94 + vetBreatheY, 3.5, 0, Math.PI * 2);
      ctx.arc(vetPos.x + 15, vetPos.y - 94 + vetBreatheY, 3.5, 0, Math.PI * 2);
      ctx.arc(vetPos.x + 4, vetPos.y - 58 + vetBreatheY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Doctor's Medical Chart / Tablet in Hand
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(vetPos.x + 18, vetPos.y - 68 + vetBreatheY, 20, 28, 3);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(vetPos.x + 20, vetPos.y - 65 + vetBreatheY, 16, 20);

      // Doctor Head & Hair (Warm Studio lighting)
      const faceGrad = ctx.createRadialGradient(
        vetPos.x - 5, vetPos.y - 138 + vetBreatheY, 4,
        vetPos.x, vetPos.y - 135 + vetBreatheY, 22
      );
      faceGrad.addColorStop(0, '#ffedd5');
      faceGrad.addColorStop(0.8, '#fed7aa');
      faceGrad.addColorStop(1, '#fba779');
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.arc(vetPos.x, vetPos.y - 135 + vetBreatheY, 20, 0, Math.PI * 2);
      ctx.fill();

      // Professional Trimmed Hair
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(vetPos.x, vetPos.y - 146 + vetBreatheY, 21, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();

      // 5. Realistic 3D Dog Companion (Golden Retriever with Soft Shading & Tail Physics)
      const dogPos = { x: tableCenter.x + 10, y: tableCenter.y - 14 };
      const dogBreath = Math.sin(frame * 0.05) * 3;
      const dogTailAngle = Math.sin(frame * 0.1) * 0.35;

      // Contact shadow under dog
      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.beginPath();
      ctx.ellipse(dogPos.x + 10, dogPos.y + 4, 46, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tail with wagging animation
      ctx.save();
      ctx.translate(dogPos.x + 55, dogPos.y - 25);
      ctx.rotate(dogTailAngle);
      const tailGrad = ctx.createLinearGradient(0, 0, 30, -10);
      tailGrad.addColorStop(0, '#d97706');
      tailGrad.addColorStop(1, '#fde68a');
      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      ctx.ellipse(18, -6, 24, 9, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Dog Torso (Volumetric Golden Fur Grad)
      const dogBodyGrad = ctx.createRadialGradient(
        dogPos.x - 5, dogPos.y - 35 + dogBreath, 10,
        dogPos.x, dogPos.y - 25 + dogBreath, 48
      );
      dogBodyGrad.addColorStop(0, '#fef3c7');
      dogBodyGrad.addColorStop(0.5, '#f59e0b');
      dogBodyGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = dogBodyGrad;
      ctx.beginPath();
      ctx.ellipse(dogPos.x, dogPos.y - 28 + dogBreath, 46, 26 + dogBreath, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fluffy Chest highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(dogPos.x - 18, dogPos.y - 22 + dogBreath, 20, 18, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Collar with Cyan Medical Tag
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(dogPos.x - 22, dogPos.y - 42, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(dogPos.x - 22, dogPos.y - 32, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Head & Neck
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(dogPos.x - 28, dogPos.y - 52, 18, 22, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Muzzle & Snout
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.ellipse(dogPos.x - 45, dogPos.y - 58, 14, 11, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Shiny 3D Black Nose
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(dogPos.x - 56, dogPos.y - 60, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(dogPos.x - 57, dogPos.y - 61, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Realistic Golden Retriever Floppy Ear with gentle twitch
      const earTwitch = Math.sin(frame * 0.08) * 0.1;
      ctx.save();
      ctx.translate(dogPos.x - 18, dogPos.y - 52);
      ctx.rotate(0.4 + earTwitch);
      const earGrad = ctx.createLinearGradient(0, -18, 0, 18);
      earGrad.addColorStop(0, '#b45309');
      earGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = earGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Dog Eye (Warm brown with bright specular dot)
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(dogPos.x - 36, dogPos.y - 63, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(dogPos.x - 37, dogPos.y - 64, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 6. Realistic 3D Cat Companion (Calm Sitting Cat with Amber Eyes & Whisker details)
      const catPos = { x: tableCenter.x + 118, y: tableCenter.y - 14 };
      const catBlink = frame % 160 < 6;
      const catTailWag = Math.sin(frame * 0.05) * 0.25;

      // Contact shadow under cat
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
      ctx.beginPath();
      ctx.ellipse(catPos.x, catPos.y + 4, 30, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cat Tail swaying gently
      ctx.save();
      ctx.translate(catPos.x + 22, catPos.y - 10);
      ctx.rotate(catTailWag);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(15, -15, 20, -30);
      ctx.stroke();
      ctx.restore();

      // Cat Body (Soft Shorthair Gradient)
      const catGrad = ctx.createRadialGradient(
        catPos.x - 5, catPos.y - 25, 6,
        catPos.x, catPos.y - 18, 30
      );
      catGrad.addColorStop(0, '#f8fafc');
      catGrad.addColorStop(0.5, '#cbd5e1');
      catGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = catGrad;
      ctx.beginPath();
      ctx.ellipse(catPos.x, catPos.y - 20, 24, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cat Head
      ctx.beginPath();
      ctx.arc(catPos.x - 12, catPos.y - 44, 16, 0, Math.PI * 2);
      ctx.fill();

      // Cat Ears with Pink Inner
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(catPos.x - 24, catPos.y - 50);
      ctx.lineTo(catPos.x - 28, catPos.y - 66);
      ctx.lineTo(catPos.x - 14, catPos.y - 54);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.moveTo(catPos.x - 22, catPos.y - 52);
      ctx.lineTo(catPos.x - 25, catPos.y - 63);
      ctx.lineTo(catPos.x - 16, catPos.y - 55);
      ctx.closePath();
      ctx.fill();

      // Amber Cat Eyes
      if (catBlink) {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(catPos.x - 19, catPos.y - 46);
        ctx.lineTo(catPos.x - 13, catPos.y - 46);
        ctx.stroke();
      } else {
        const eyeGrad = ctx.createRadialGradient(catPos.x - 16, catPos.y - 46, 1, catPos.x - 16, catPos.y - 46, 4);
        eyeGrad.addColorStop(0, '#fef08a');
        eyeGrad.addColorStop(0.7, '#f59e0b');
        eyeGrad.addColorStop(1, '#b45309');
        ctx.fillStyle = eyeGrad;
        ctx.beginPath();
        ctx.arc(catPos.x - 16, catPos.y - 46, 3.5, 0, Math.PI * 2);
        ctx.fill();
        // Slit pupil
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(catPos.x - 16.5, catPos.y - 48.5, 1, 5);
      }

      // Whiskers
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(catPos.x - 20, catPos.y - 42);
      ctx.lineTo(catPos.x - 34, catPos.y - 44);
      ctx.moveTo(catPos.x - 20, catPos.y - 40);
      ctx.lineTo(catPos.x - 33, catPos.y - 38);
      ctx.stroke();

      // 7. Holographic 3D Floating Telemetry Sphere & Multi-Axis Gyroscope Rings
      const holoCenter = {
        x: tableCenter.x,
        y: tableCenter.y - 150 + Math.sin(frame * 0.04) * 8,
      };

      ctx.save();
      // Outer Rotating 3D Gyroscopic Ring (Cyan)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(holoCenter.x, holoCenter.y, 42, 16, frame * 0.02, 0, Math.PI * 2);
      ctx.stroke();

      // Mid Counter-Rotating Ring (Rose/Amber)
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(holoCenter.x, holoCenter.y, 48, 18, -frame * 0.015, 0, Math.PI * 2);
      ctx.stroke();

      // Third Pitch Gyro Ring (Emerald)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(holoCenter.x, holoCenter.y, 36, 36, frame * 0.01, 0, Math.PI * 2);
      ctx.stroke();

      // Glowing Center Sphere with volumetric falloff
      const holoGrad = ctx.createRadialGradient(
        holoCenter.x - 4, holoCenter.y - 4, 2,
        holoCenter.x, holoCenter.y, 22
      );
      holoGrad.addColorStop(0, '#ffffff');
      holoGrad.addColorStop(0.3, '#38bdf8');
      holoGrad.addColorStop(0.8, '#0284c7');
      holoGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = holoGrad;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(holoCenter.x, holoCenter.y, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Beating Cross / Heart inside Holo
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(holoCenter.x - 7, holoCenter.y);
      ctx.lineTo(holoCenter.x + 7, holoCenter.y);
      ctx.moveTo(holoCenter.x, holoCenter.y - 7);
      ctx.lineTo(holoCenter.x, holoCenter.y + 7);
      ctx.stroke();

      // Floating ECG Sine Wave below Holo
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const waveStartX = holoCenter.x - 45;
      for (let i = 0; i < 90; i += 4) {
        const wx = waveStartX + i;
        const wy = holoCenter.y + 30 + Math.sin((i + frame * 4) * 0.15) * (i > 35 && i < 55 ? 9 : 2);
        if (i === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
      ctx.restore();

      // 8. Render Floating Clinical Sterile Particles
      if (performanceMode !== 'low-perf') {
        particles.forEach((p) => {
          if (!isReduced) {
            p.y -= p.speed;
            p.x += Math.sin(frame * 0.01 + p.angle) * 0.3;
            if (p.y < 0) p.y = height;
          }
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    // Mouse movement interactive 3D parallax tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;

      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const tableW = Math.min(width * 0.58, 430);
      const tc = { x: width * 0.52, y: height * 0.65 };

      if (px > tc.x - tableW * 0.45 && px < tc.x - tableW * 0.15 && py > tc.y - 160 && py < tc.y) {
        setHoveredObject('Lead Clinical Veterinarian');
        setInteractionMsg('Dr. Sarah Jenkins, DVM — Reviewing real-time patient biometrics & records.');
      } else if (px > tc.x - tableW * 0.1 && px < tc.x + tableW * 0.2 && py > tc.y - 100 && py < tc.y) {
        setHoveredObject('Golden Retriever Companion');
        setInteractionMsg('Buddy (Golden Retriever) — Healthy resting heart rate: 72 bpm, temp normal.');
      } else if (px > tc.x + tableW * 0.2 && px < tc.x + tableW * 0.45 && py > tc.y - 80 && py < tc.y) {
        setHoveredObject('British Shorthair Companion');
        setInteractionMsg('Milo (Shorthair) — Calm demeanor, excellent hydration metrics & clear breathing.');
      } else if (px > tc.x - 50 && px < tc.x + 50 && py > tc.y - 200 && py < tc.y - 100) {
        setHoveredObject('VetPulse Telemetry Hologram');
        setInteractionMsg('Live 3D telemetry node — multi-axis gyroscopic biometric synchronization.');
      } else if (px > width * 0.15 && px < width * 0.15 + 110 && py > height * 0.25 && py < height * 0.25 + 80) {
        setHoveredObject('Clinical Wall Monitor');
        setInteractionMsg('Live Patient Vitals Screen — Continuous Lead II ECG, SpO2 & Temperature stream.');
      } else {
        setHoveredObject(null);
        setInteractionMsg('Hover or move cursor to tilt 3D clinic environment');
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      setHoveredObject(null);
      setInteractionMsg('Hover or move cursor to tilt 3D clinic environment');
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [performanceMode, isPlaying, cameraPreset]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[340px] md:h-[440px] bg-slate-900 rounded-[32px] overflow-hidden border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.12)] select-none"
    >
      {/* Canvas */}
      {performanceMode !== 'disabled' ? (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block cursor-grab active:cursor-grabbing" id="canvas-3d" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white text-slate-500 p-6 text-center">
          <Info className="h-10 w-10 text-cyan-600 mb-2" />
          <p className="font-black text-slate-800 text-lg">3D Realistic Environment Paused</p>
          <p className="text-sm max-w-sm mt-1 text-slate-500">
            Select Full-Performance mode below to activate the realistic procedural 3D hospital clinic.
          </p>
        </div>
      )}

      {/* Top HUD Controls */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap justify-between items-center gap-2 pointer-events-none z-20">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900/80 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 flex items-center gap-2.5 pointer-events-auto shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <Activity className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-black text-white tracking-wider uppercase">VetPulse 3D Live Engine</span>
          </div>

          {/* 3D Camera Preset View Switcher */}
          <div className="hidden sm:flex items-center bg-slate-900/80 backdrop-blur-xl p-1 rounded-full border border-white/20 pointer-events-auto shadow-lg">
            {(['clinic', 'patient', 'vitals'] as CameraPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => setCameraPreset(preset)}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
                  cameraPreset === preset
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title={`Switch to 3D ${preset} camera angle`}
              >
                {preset === 'clinic' ? 'Wide Clinic' : preset === 'patient' ? 'Patient' : 'Vitals'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {performanceMode !== 'disabled' && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-slate-200 text-slate-800 hover:bg-white transition hover:scale-105 active:scale-95"
              title={isPlaying ? "Pause Scene Animation" : "Resume Scene Animation"}
              id="pause-animation-btn"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            </button>
          )}

          <div className="bg-white/90 backdrop-blur-md shadow-md border border-slate-200 p-1.5 rounded-2xl flex gap-1 text-xs">
            {(['full', 'reduced-motion', 'low-perf', 'disabled'] as PerformanceMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setPerformanceMode(mode)}
                className={`px-3 py-1.5 rounded-xl font-black transition text-[10px] uppercase ${
                  performanceMode === mode
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                id={`perf-${mode}-btn`}
              >
                {mode === 'reduced-motion' ? 'Reduced' : mode === 'low-perf' ? 'Low' : mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Interactive HUD Status Bar */}
      <div className="absolute bottom-4 left-4 right-4 bg-slate-900/85 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/15 text-center shadow-2xl transition duration-300 pointer-events-none z-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 animate-pulse" />
          <p className="text-xs font-bold text-slate-100">{interactionMsg}</p>
        </div>
        {hoveredObject && (
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-cyan-500/30 text-cyan-300 rounded-full border border-cyan-400/30">
            {hoveredObject}
          </span>
        )}
      </div>
    </div>
  );
}
