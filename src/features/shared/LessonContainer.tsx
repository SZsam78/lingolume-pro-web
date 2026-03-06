import { LessonPlayer } from '../learning/LessonPlayer';
import { ArrowLeft } from 'lucide-react';
// import { LessonEditor } from '../editor/LessonEditor';
import { cn } from '@/lib/utils';

interface LessonContainerProps {
    lessonId: string;
    onBack: () => void;
    onNextLesson?: (lessonId: string, moduleId?: string) => void;
}

export function LessonContainer({ lessonId, onBack, onNextLesson }: LessonContainerProps) {

    return (
        <div className="relative w-full h-[100dvh]">
            <LessonPlayer
                lessonId={lessonId}
                onBack={onBack}
                onNextLesson={onNextLesson}
            />
        </div>
    );
}
