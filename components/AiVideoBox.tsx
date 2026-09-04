'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, Volume2, VolumeX, Play, Pause, Radio } from 'lucide-react';

export default function AiVideoBox() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <aside 
      aria-label="AI Real-time Observation" 
      className="hidden lg:block fixed top-4 right-6 md:right-12 z-40 w-[380px] xl:w-[460px] rounded-2xl overflow-hidden border border-white/20 bg-slate-900/85 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.5)] ring-1 ring-cyan-500/30 transition-all duration-300 hover:border-cyan-400/60 hover:shadow-cyan-950/40"
    >
      {/* Header bar / Device Frame Top */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2 text-cyan-300 font-semibold">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="tracking-wide text-xs font-bold">AI Coastal Observer</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-950/80 border border-cyan-800/40 px-2 py-0.5 rounded-full font-mono font-medium">
            <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
            LIVE SATELLITE FEED
          </span>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative aspect-video w-full bg-black/80 overflow-hidden group">
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/Ai-Genreted Video/Style_Photorealistic_cinemat.mp4" type="video/mp4" />
          <source src="/videos/ai-demo.mp4" type="video/mp4" />
        </video>

        {/* Video Overlay Controls (Speaker Mute/Unmute & Play/Pause) */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-3 flex items-center justify-between transition-opacity duration-200">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 backdrop-blur-md transition shadow-md"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={toggleMute}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition shadow-md border ${
                isMuted 
                  ? 'bg-slate-900/80 text-slate-300 border-white/15 hover:bg-slate-800 hover:text-white' 
                  : 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-cyan-500/30'
              }`}
              title={isMuted ? 'Click to Unmute Audio' : 'Click to Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-slate-950" />}
              <span className="text-[11px]">{isMuted ? 'Unmute' : 'Audio On'}</span>
            </button>
          </div>

          <div className="text-right">
            <span className="font-mono text-[9px] tracking-wider text-cyan-300/90 font-medium block">
              ISRO ORCA CORE
            </span>
            <span className="text-[9px] text-slate-400">1080p • 60 FPS</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
