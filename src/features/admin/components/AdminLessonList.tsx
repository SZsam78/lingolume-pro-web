import { ArrowLeft, BookOpenCheck } from 'lucide-react';

interface AdminLessonListProps {
    moduleId: string;
    onSelect: (lessonNumber: number) => void;
    onBack: () => void;
}

export function AdminLessonList({ moduleId, onSelect, onBack }: AdminLessonListProps) {
    // Fixed hierarchy: Exactly 12 lessons per module
    const lessons = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className="p-8 max-w-5xl mx-auto w-full">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Zurück zur Modul-Übersicht
            </button>

            <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    Modul {moduleId}
                </h2>
                <p className="text-slate-500">Wählen Sie eine der 12 Lektionen zur Bearbeitung aus.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {lessons.map((lessonNum) => (
                    <button
                        key={lessonNum}
                        onClick={() => onSelect(lessonNum)}
                        className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all text-left group"
                    >
                        <div className="bg-slate-100 p-3 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                            <BookOpenCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Lektion</span>
                            <span className="text-xl font-black font-heading">{lessonNum}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
