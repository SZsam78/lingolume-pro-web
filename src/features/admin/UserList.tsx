import { useState, useEffect } from 'react';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ShieldCheck, User, Trash2, ChevronDown, ChevronUp, Lock, Check, X, Plus } from 'lucide-react';
import { DB } from '@/lib/db';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: Record<string, boolean>;
    is_active: boolean;
}

export function UserList() {
    const { t } = useTranslation();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const snapshot = await getDocs(collection(firestore, 'users'));
                const userList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as UserProfile[];
                setUsers(userList);
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const createUser = async () => {
        if (!newName || !newEmail || !newPassword) return;
        try {
            const uid = newEmail.replace('.', '_');
            await setDoc(doc(firestore, 'users', uid), {
                email: newEmail,
                name: newName,
                password: newPassword,
                role: 'user',
                permissions: { 'A1.1': true }, // Default permission
                is_active: true
            });
            alert("Benutzer erfolgreich angelegt!");
            setShowCreateDialog(false);
            window.location.reload();
        } catch (err) {
            console.error(err);
        }
    };

    const togglePermission = async (userId: string, moduleKey: string, currentVal: boolean) => {
        try {
            const userRef = doc(firestore, 'users', userId);
            const user = users.find(u => u.id === userId);
            if (!user) return;

            const newPermissions = { ...user.permissions, [moduleKey]: !currentVal };
            await updateDoc(userRef, { permissions: newPermissions });

            setUsers(users.map(u => u.id === userId ? { ...u, permissions: newPermissions } : u));
        } catch (err) {
            console.error("Error updating permission:", err);
        }
    };

    const modules = [
        { key: 'A1.1', label: 'Modul A1.1' },
        { key: 'A1.2', label: 'Modul A1.2' },
        { key: 'A2.1', label: 'Modul A2.1' },
        { key: 'A2.2', label: 'Modul A2.2' },
        { key: 'B1.1', label: 'Modul B1.1' },
        { key: 'B1.2', label: 'Modul B1.2' },
        { key: 'B2.1', label: 'Modul B2.1' },
        { key: 'B2.2', label: 'Modul B2.2' },
        { key: 'artikel', label: t('artikeltrainer') },
        { key: 'vokabeltrainer', label: t('vokabeltrainer') },
        { key: 'story', label: t('story_modus') },
    ];

    if (loading) return (
        <div className="flex justify-center p-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black dark:text-white">{t('benutzerverwaltung')}</h2>
                <button
                    onClick={() => setShowCreateDialog(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                    {t('benutzer_anlegen')}
                </button>
            </div>

            {showCreateDialog && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
                        <h3 className="text-xl font-black mb-6 dark:text-white">Neuen Schüler anlegen</h3>
                        <div className="space-y-4">
                            <input
                                placeholder="Vollständiger Name"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white border-transparent dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold outline-none border focus:border-primary/20"
                            />
                            <input
                                placeholder="E-Mail / Benutzername"
                                value={newEmail}
                                onChange={e => setNewEmail(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white border-transparent dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold outline-none border focus:border-primary/20"
                            />
                            <input
                                placeholder="Initiales Passwort"
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white border-transparent dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold outline-none border focus:border-primary/20"
                            />
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowCreateDialog(false)} className="flex-1 py-4 font-black text-xs uppercase text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">Abbrechen</button>
                            <button onClick={createUser} className="flex-1 bg-[#1A1A1A] dark:bg-slate-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10">Anlegen</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {users.map((user) => (
                    <div key={user.id} className="border dark:border-surface-darker rounded-2xl bg-white dark:bg-surface-dark overflow-hidden shadow-sm transition-all hover:shadow-md">
                        <div
                            className="flex items-center justify-between p-5 cursor-pointer"
                            onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center text-white",
                                    user.role === 'admin' ? "bg-[#1A1A1A] dark:bg-slate-700" : "bg-primary/20 text-primary"
                                )}>
                                    {user.role === 'admin' ? <ShieldCheck className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                </div>
                                <div>
                                    <div className="font-black text-sm dark:text-white">{user.name || 'Unbekannt'}</div>
                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{user.email}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={cn(
                                    "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                    user.role === 'admin' ? "bg-[#1A1A1A] dark:bg-slate-700 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                )}>
                                    {user.role}
                                </span>
                                {expandedUserId === user.id ? <ChevronUp className="h-4 w-4 dark:text-white" /> : <ChevronDown className="h-4 w-4 dark:text-white" />}
                            </div>
                        </div>

                        {expandedUserId === user.id && (
                            <div className="p-6 pt-0 border-t dark:border-surface-darker bg-slate-50/30 dark:bg-surface-darker/50">
                                <div className="mt-6 space-y-6">
                                    <div>
                                        <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Berechtigungen (Rechte-Matrix)</div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {modules.map(mod => (
                                                <button
                                                    key={mod.key}
                                                    onClick={() => togglePermission(user.id, mod.key, user.permissions?.[mod.key] || false)}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                                                        user.permissions?.[mod.key]
                                                            ? "bg-primary/5 border-primary text-primary font-bold shadow-sm"
                                                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                                                    )}
                                                >
                                                    <span className="text-xs">{mod.label}</span>
                                                    {user.permissions?.[mod.key] && <div className="h-2 w-2 rounded-full bg-primary" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t dark:border-slate-700 border-dashed">
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`${user.name} wirklich löschen?`)) {
                                                    await DB.deleteUser(user.id);
                                                    setUsers(users.filter(u => u.id !== user.id));
                                                }
                                            }}
                                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" /> {t('benutzer_loeschen')}
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const newPass = window.prompt("Neues Passwort vergeben:", "0000");
                                                if (newPass) {
                                                    await updateDoc(doc(firestore, 'users', user.id), { password: newPass });
                                                    alert("Passwort wurde geändert.");
                                                }
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] dark:bg-slate-700 text-white rounded-xl text-xs font-bold"
                                        >
                                            <Lock className="h-3.5 w-3.5" /> {t('passwort_zuruecksetzen')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
