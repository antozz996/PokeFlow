"use client";

// Genera un suono di campanella (bell/ding) usando la Web Audio API senza bisogno di file esterni
export const playNotificationSound = () => {
  if (typeof window === "undefined") return;
  
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Tipo di onda (sine = morbido/campanella)
    osc.type = "sine";
    
    // Frequenza (nota musicale) - 880Hz è un A5, suono tipico da notifica
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    // Fa un rapido "glissando" verso l'alto per renderlo più vivace
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
    
    // Inviluppo del volume (fade out per sembrare un tocco di campanella)
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05); // Attacco rapido
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0); // Rilascio lungo
    
    // Avvia e ferma
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.0);
    
    // Cleanup
    setTimeout(() => {
      ctx.close();
    }, 1200);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};
