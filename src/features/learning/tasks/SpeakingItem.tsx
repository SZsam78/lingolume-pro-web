import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Play, RefreshCw, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpeakingItemProps {
    item: {
        content: {
            textToSpeak: string;
            phonetics?: string;
        };
    };
    answer?: Blob;
    onAnswer: (val: Blob | null) => void;
    showResults: boolean;
    isCorrect?: boolean;
}

export function SpeakingItem({ item, answer, onAnswer, showResults, isCorrect }: SpeakingItemProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingBlob, setRecordingBlob] = useState<Blob | null>(answer || null);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isError, setIsError] = useState(false);

    // Check validation error
    useEffect(() => {
        if (showResults && isCorrect === false) {
            setIsError(true);
            setTimeout(() => {
                setIsError(false);
                setRecordingBlob(null);
                onAnswer(null);
            }, 800);
        }
    }, [showResults, isCorrect, onAnswer]);

    const startRecording = async () => {
        if (showResults) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            chunks.current = [];

            mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
            mediaRecorder.current.onstop = () => {
                const blob = new Blob(chunks.current, { type: 'audio/webm' });
                setRecordingBlob(blob);
                onAnswer(blob);
                stream.getTracks().forEach(t => t.stop()); // Clean up tracks
            };

            mediaRecorder.current.start();
            setIsRecording(true);

            // Auto-stop after 10s
            timeoutRef.current = setTimeout(() => {
                stopRecording();
            }, 10000);
        } catch (err) {
            console.error("Mic access denied", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
            mediaRecorder.current.stop();
            setIsRecording(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
    };

    const playRecording = () => {
        if (recordingBlob) {
            const url = URL.createObjectURL(recordingBlob);
            const audio = new Audio(url);
            audio.play();
        }
    };

    return (
        <div className="w-full flex flex-col items-center gap-10 max-w-2xl mx-auto">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-slate-800 dark:text-white leading-tight">
                    {item.content.textToSpeak}
                </h2>
                {item.content.phonetics && (
                    <p className="text-lg text-slate-400 font-medium italic">
                        {item.content.phonetics}
                    </p>
                )}
            </div>

            <div className={cn(
                "w-full h-32 rounded-3xl border-2 flex items-center justify-center relative overflow-hidden transition-all",
                !isError && "bg-slate-50 dark:bg-slate-900/50 border-dashed border-slate-200 dark:border-slate-800",
                isError && "bg-red-50 border-red-500 border-solid animate-shake"
            )}>
                {isRecording && (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 bg-red-500/5 pointer-events-none"
                    />
                )}
                {isRecording ? (
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1 items-end h-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ height: [10, 30, 10] }}
                                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                    className="w-1.5 bg-red-500 rounded-full"
                                />
                            ))}
                        </div>
                        <span className="text-red-500 font-bold uppercase tracking-widest text-xs">Aufnahme...</span>
                    </div>
                ) : isError ? (
                    <p className="text-red-600 font-bold text-sm tracking-wide">Bitte den ganzen Satz erneut versuchen.</p>
                ) : (
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Bereit zum Sprechen</p>
                )}
            </div>

            <div className="flex items-center gap-6">
                {!recordingBlob && !isRecording ? (
                    <button
                        onClick={startRecording}
                        disabled={showResults && isCorrect}
                        className={cn(
                            "w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all",
                            showResults && isCorrect ? "bg-slate-300 text-slate-500 cursor-default" : "bg-primary text-white hover:scale-105 active:scale-95"
                        )}
                    >
                        <Mic size={40} strokeWidth={2.5} />
                    </button>
                ) : isRecording ? (
                    <button
                        onClick={stopRecording}
                        className="w-24 h-24 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                        <Square size={32} fill="white" />
                    </button>
                ) : (
                    <div className="flex gap-4">
                        <button
                            onClick={playRecording}
                            className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                            <Play size={32} fill="white" />
                        </button>
                        {!showResults && (
                            <button
                                onClick={() => { setRecordingBlob(null); onAnswer(null); }}
                                className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                <RefreshCw size={28} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                Tippe auf das Mikrofon und lies den Satz laut vor. (Max. 10s)
            </p>
        </div>
    );
}
