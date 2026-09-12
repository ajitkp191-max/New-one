import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Sparkles, Scale, Clock, Heart, Edit3, Upload, Calendar } from 'lucide-react';
import { PetProfile } from '../../types';
import Realistic3DEmoji from '../Realistic3DEmoji';
import Morphing3DButton from './Morphing3DButton';
import threedPetDog from '../../assets/images/realistic_3d_dog_1789111353728.jpg';
import threedPetCat from '../../assets/images/realistic_3d_cat_1789111372620.jpg';
import threedPetBird from '../../assets/images/threed_pet_bird_1789062504097.jpg';

interface ParallaxPetCardProps {
  pet: PetProfile;
  calculatedAge: string;
  nextCheckup?: string;
  onEditAgeWeight: (pet: PetProfile) => void;
  onUploadPrescription: (pet: PetProfile) => void;
  onBookVisit: (petId: string) => void;
  className?: string;
}

const getPet3DImage = (species: string) => {
  const s = species.toLowerCase();
  if (s.includes('dog')) return threedPetDog;
  if (s.includes('cat')) return threedPetCat;
  if (s.includes('bird') || s.includes('parrot')) return threedPetBird;
  return null;
};

export default function ParallaxPetCard({
  pet,
  calculatedAge,
  nextCheckup = 'Annual Exam Due Soon',
  onEditAgeWeight,
  onUploadPrescription,
  onBookVisit,
  className = ''
}: ParallaxPetCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 26 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Card 3D tilt
  const rotateX = useTransform(smoothY, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], ['-10deg', '10deg']);

  // Parallax layer depths (different z translation for animal vs card vs badges)
  const petTranslateX = useTransform(smoothX, [-0.5, 0.5], ['-8px', '8px']);
  const petTranslateY = useTransform(smoothY, [-0.5, 0.5], ['-8px', '8px']);
  const badgeTranslateX = useTransform(smoothX, [-0.5, 0.5], ['-14px', '14px']);
  const badgeTranslateY = useTransform(smoothY, [-0.5, 0.5], ['-14px', '14px']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const petImg = getPet3DImage(pet.species);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1200,
        transformStyle: 'preserve-3d',
      }}
      className={`relative rounded-[36px] bg-gradient-to-br from-white via-white to-cyan-50/40 p-6 sm:p-8 border border-slate-100 shadow-[0_20px_45px_rgba(0,0,0,0.04)] overflow-hidden ${className}`}
    >
      {/* Background Animated Gradient Glow Orbs */}
      <motion.div
        className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-300/25 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-200/25 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
      >
        {/* Left Column: Parallax 3D Pet Showcase */}
        <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
          <motion.div
            style={{
              x: petTranslateX,
              y: petTranslateY,
              transformStyle: 'preserve-3d',
              translateZ: 30,
            }}
            className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-[32px] overflow-hidden bg-gradient-to-tr from-slate-100 via-cyan-50 to-teal-100 border-4 border-white shadow-[0_18px_36px_rgba(6,182,212,0.22)] group"
          >
            {petImg ? (
              <motion.img
                src={petImg}
                alt={pet.name}
                className="w-full h-full object-cover select-none"
                animate={!isHovered ? {
                  y: [0, -4, 0],
                  scale: [1, 1.02, 1]
                } : undefined}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Realistic3DEmoji emoji="paw" size="xl" />
              </div>
            )}

            {/* Parallax Floating Breed Pill Badge */}
            <motion.div
              style={{
                x: badgeTranslateX,
                y: badgeTranslateY,
                translateZ: 45,
              }}
              className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md rounded-xl py-1.5 px-3 text-white text-center shadow-lg"
            >
              <span className="text-[10px] font-black uppercase tracking-wider">
                {pet.breed || pet.species}
              </span>
            </motion.div>
          </motion.div>

          <div style={{ translateZ: 20 }}>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {pet.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Active & Healthy
              </span>
            </div>
            <p className="text-xs text-slate-400 font-bold mt-0.5">
              Microchip: {pet.microchipNumber || 'Not chipped'} • Sex: {pet.sex.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>

        {/* Middle Column: Biometrics & Morphing Controls */}
        <div className="lg:col-span-8 space-y-5" style={{ translateZ: 25 }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Live Biometrics & Wellness Status
            </span>
            <Morphing3DButton
              variant="cyan"
              size="sm"
              icon={Edit3}
              onClick={() => onEditAgeWeight(pet)}
            >
              Edit Age & Weight
            </Morphing3DButton>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Age Metric */}
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-500" />
                Calculated Age
              </span>
              <div className="text-xl font-black text-slate-900">
                {calculatedAge}
              </div>
              <span className="text-[10px] text-slate-400 font-semibold block">
                DOB: {pet.dateOfBirth}
              </span>
            </div>

            {/* Weight Metric */}
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Scale className="w-3 h-3 text-emerald-500" />
                Current Weight
              </span>
              <div className="text-xl font-black text-slate-900 flex items-baseline gap-1">
                {pet.weight}
                <span className="text-xs text-slate-400 font-bold">kg</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">
                Optimal Body Score
              </span>
            </div>

            {/* Next Checkup Metric */}
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-500" />
                Next Checkup
              </span>
              <div className="text-sm font-black text-slate-800 truncate">
                {nextCheckup}
              </div>
              <span className="text-[10px] text-cyan-600 font-bold block">
                Preventative Radar
              </span>
            </div>
          </div>

          {/* Quick Actions Row with 3D Tactile Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Morphing3DButton
              variant="emerald"
              size="md"
              icon={Upload}
              onClick={() => onUploadPrescription(pet)}
              className="flex-1"
            >
              Upload Rx Slip
            </Morphing3DButton>

            <Morphing3DButton
              variant="slate"
              size="md"
              icon={Calendar}
              onClick={() => onBookVisit(pet.petId)}
              className="flex-1"
            >
              Book Clinical Slot
            </Morphing3DButton>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
