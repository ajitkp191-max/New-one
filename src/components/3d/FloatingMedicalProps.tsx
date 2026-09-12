import React from 'react';
import { motion } from 'motion/react';
import propHeart from '../../assets/images/realistic_3d_heart_1789111332698.jpg';
import propStethoscope from '../../assets/images/threed_stethoscope_1789095012554.jpg';
import propPills from '../../assets/images/threed_medical_pills_1789095031340.jpg';
import propClipboard from '../../assets/images/threed_clipboard_1789095043609.jpg';
import Realistic3DEmoji from '../Realistic3DEmoji';

export type FloatingPropType = 'stethoscope' | 'pills' | 'heart' | 'clipboard' | 'syringe' | 'shield' | 'star';

interface FloatingMedicalPropsProps {
  propType: FloatingPropType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  delay?: number;
  duration?: number;
  className?: string;
  glow?: boolean;
}

const propImageMap: Partial<Record<FloatingPropType, string>> = {
  stethoscope: propStethoscope,
  pills: propPills,
  heart: propHeart,
  clipboard: propClipboard,
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-14 h-14',
  lg: 'w-24 h-24',
  xl: 'w-36 h-36'
};

export default function FloatingMedicalProps({
  propType,
  size = 'md',
  delay = 0,
  duration = 4,
  className = '',
  glow = true
}: FloatingMedicalPropsProps) {
  const imageSrc = propImageMap[propType];

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center select-none pointer-events-none ${sizeClasses[size]} ${className}`}
      initial={{ y: 0, rotate: 0 }}
      animate={{
        y: [0, -10, 0, 8, 0],
        rotate: [0, -3, 2, -2, 0],
        scale: [1, 1.04, 0.98, 1.02, 1]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay
      }}
    >
      {/* 3D Soft Ambient Glow */}
      {glow && (
        <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl scale-125" />
      )}

      {imageSrc ? (
        <img
          src={imageSrc}
          alt={propType}
          className="w-full h-full object-contain mix-blend-multiply drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
        />
      ) : (
        <Realistic3DEmoji emoji={propType as any} size={size === 'xl' ? '2xl' : size === 'lg' ? 'xl' : size === 'sm' ? 'sm' : 'lg'} />
      )}
    </motion.div>
  );
}
