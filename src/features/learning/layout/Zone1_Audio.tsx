import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Turtle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Zone1AudioProps {
    audioUrl?: string;
}

export function Zone1Audio({ audioUrl }: Zone1AudioProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSlow, setIsSlow] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = isSlow ? 0.6 : 1.0;
        }
    }, [isSlow]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const restart = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
    };

    if (!audioUrl) return (
        <div className="h-full w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center p-4">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center">Kein Audio verfügbar</p>
        </div>
    );

    return (
        <div className="h-full w-full bg-white dark:bg-surface-dark rounded-2xl border-2 border-slate-100 dark:border-surface-darker shadow-sm p-4 flex flex-col gap-3 group transition-all hover:shadow-md">
            <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-sm">headphones</span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Audio-Player</p>
            </div>

            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={togglePlay}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                    {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsSlow(!isSlow)}
                        title="Schildkröten-Modus (Langsam)"
                        className={cn(
                            "w-10 h-10 flex items-center justify-center rounded-xl transition-all",
                            isSlow
                                ? "bg-amber-100 text-amber-600 border-2 border-amber-200"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                        )}
                    >
                        <Turtle size={20} className={cn(isSlow && "animate-pulse")} />
                    </button>
                    <button
                        onClick={restart}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-all"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
            />
        </div>
    );
}
