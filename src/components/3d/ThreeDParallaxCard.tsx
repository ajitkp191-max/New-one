import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface ThreeDParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  depth?: number;
  interactive?: boolean;
  onClick?: () => void;
  id?: string;
  key?: React.Key;
}

export default function ThreeDParallaxCard({
  children,
  className = '',
  glowColor = 'rgba(6,182,212,0.35)',
  depth = 18,
  interactive = true,
  onClick,
  id
}: ThreeDParallaxCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for smooth 3D tilting
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Springs for buttery smooth physics response
  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 24 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 24 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${depth}deg`, `-${depth}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${depth}deg`, `${depth}deg`]);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !interactive) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    if (!interactive) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      id={id}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      className={`relative rounded-[32px] transition-shadow duration-500 ${
        isHovered ? 'shadow-[0_24px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.4)]' : 'shadow-[0_12px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.25)]'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <motion.div
        style={{
          rotateX: interactive ? rotateX : 0,
          rotateY: interactive ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full relative"
      >
        {/* Specular Glare / Shine Effect */}
        {interactive && isHovered && (
          <motion.div
            className="absolute inset-0 rounded-[28px] pointer-events-none z-30 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glareX} ${glareY}, ${glowColor}, transparent 70%)`,
              opacity: isHovered ? 0.65 : 0,
            }}
          />
        )}

        {/* Card Content with preserved 3D layer hierarchy */}
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
