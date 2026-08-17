'use client';

import React, { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, className = '' }) => {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { damping: 25, stiffness: 90 });
  const displayVal = useTransform(springVal, (current) => Math.round(current));
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    return displayVal.on('change', (latest) => {
      if (spanRef.current) {
        spanRef.current.textContent = latest.toString();
      }
    });
  }, [displayVal]);

  return <span ref={spanRef} className={className}>0</span>;
};
