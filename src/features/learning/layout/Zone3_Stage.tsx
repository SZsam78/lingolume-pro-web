import React from 'react';

interface Zone3StageProps {
    media?: {
        type: 'image' | 'video';
        url: string;
        caption?: string;
    };
    children: React.ReactNode;
}

export function Zone3Stage({ media, children }: Zone3StageProps) {
    return (
        <div className="flex-1 flex flex-col min-h-0 w-full max-w-4xl mx-auto">
            {media && (
                <div className="mb-8 w-full">
                    {media.type === 'video' ? (
                        <div className="aspect-video w-full rounded-3xl overflow-hidden bg-black shadow-2xl relative group border-4 border-white dark:border-surface-darker">
                            <video
                                src={media.url}
                                className="w-full h-full object-cover"
                                controls={false}
                                playsInline
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={(e) => {
                                const video = e.currentTarget.previousSibling as HTMLVideoElement;
                                if (video.paused) video.play();
                                else video.pause();
                            }}>
                                <span className="material-symbols-outlined !text-6xl text-white">play_circle</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full rounded-3xl overflow-hidden shadow-xl border-4 border-white dark:border-surface-darker">
                            <img src={media.url} alt={media.caption || ''} className="w-full object-cover max-h-[300px]" />
                        </div>
                    )}
                    {media.caption && (
                        <p className="mt-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">{media.caption}</p>
                    )}
                </div>
            )}

            <div className="flex-1 min-h-0">
                {children}
            </div>
        </div>
    );
}
