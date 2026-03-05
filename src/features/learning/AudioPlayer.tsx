import React from 'react';
import { cn } from '@/lib/utils';

export const getDriveIframeUrl = (url?: string) => {
    if (!url) return null;
    try {
        if (url.includes('drive.google.com/file/d/')) {
            const match = url.match(/\/d\/(.*?)\//);
            if (match && match[1]) {
                // Return the embedded preview player format
                return `https://drive.google.com/file/d/${match[1]}/preview`;
            }
        }
        return url;
    } catch {
        return url;
    }
};

export const AudioPlayer = ({ url, transparent = false }: { url: string, transparent?: boolean }) => {
    const iframeUrl = getDriveIframeUrl(url);
    if (!iframeUrl) return null;
    return (
        <div className={cn(
            "my-4 mb-6 rounded-2xl overflow-hidden border transition-all duration-300",
            transparent
                ? "bg-transparent border-transparent"
                : "bg-white dark:bg-surface-dark border-slate-200 dark:border-surface-darker shadow-sm"
        )}>
            {iframeUrl.includes('drive.google.com') ? (
                <iframe
                    src={iframeUrl}
                    className="w-full h-20 border-none outline-none"
                    allow="autoplay"
                />
            ) : (
                <div className="p-3">
                    <audio
                        controls
                        src={iframeUrl}
                        className="w-full h-10 outline-none"
                        controlsList="nodownload"
                    />
                </div>
            )}
        </div>
    );
};

