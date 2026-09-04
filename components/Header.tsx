'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JALSANKET_LANGUAGES } from '@/lib/languages';

export default function Header() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % JALSANKET_LANGUAGES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const currentLang = JALSANKET_LANGUAGES[index];

  return (
    <header className="w-full flex justify-start items-center px-6 md:px-12 pt-5 pb-2 relative z-30 select-none">
      <div className="h-10 flex items-center justify-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLang.id}
            initial={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex items-center gap-2.5"
          >
            <span className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] font-sans">
              {currentLang.native}
            </span>
            <span className="text-[10px] font-semibold tracking-widest uppercase text-cyan-300 px-2 py-0.5 rounded-md bg-slate-900/80 border border-cyan-500/40 backdrop-blur-md self-center shadow-sm">
              {currentLang.name}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </header>
  );
}
