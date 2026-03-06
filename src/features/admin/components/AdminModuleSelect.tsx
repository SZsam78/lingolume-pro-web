import { BookOpen } from 'lucide-react';
import { MODULES } from '@/lib/db'; // Make sure this exports the module list or adapt accordingly

// If MODULES isn't directly available in a simple array, we can define the standard ones:
const STANDARD_MODULES = [
    { id: 'A1.1', title: 'Grundlagen', level: 'A1' },
    { id: 'A1.2', title: 'Alltag', level: 'A1' },
    { id: 'A2.1', title: 'Erweitert', level: 'A2' },
    { id: 'A2.2', title: 'Kommunikation', level: 'A2' },
    { id: 'B1.1', title: 'Selbstständig', level: 'B1' },
    { id: 'B1.2', title: 'Beruf & Gesellschaft', level: 'B1' },
    { id: 'B2.1', title: 'Fließend', level: 'B2' },
    { id: 'B2.2', title: 'Verhandlungssicher', level: 'B2' },
];

interface AdminModuleSelectProps {
    onSelect: (moduleId: string) => void;
}

export function AdminModuleSelect({ onSelect }: AdminModuleSelectProps) {
    return (
        <div className="p-8 max-w-5xl mx-auto w-full">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Modul auswählen</h2>
                <p className="text-slate-500">Wählen Sie ein Modul, um die 12 Lektionen zu verwalten.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {STANDARD_MODULES.map((mod) => (
                    <button
                        key={mod.id}
                        onClick={() => onSelect(mod.id)}
                        className="flex flex-col items-start p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all text-left group"
                    >
                        <div className="bg-slate-100 p-3 rounded-xl mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold font-heading mb-1">{mod.id}</h3>
                        <p className="text-sm text-slate-500">{mod.title}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
