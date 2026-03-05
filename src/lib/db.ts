import { firestore } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, query, where } from 'firebase/firestore';

export class DB {
    static async query<T>(sql: string, params: any[] = []): Promise<T[]> {
        // Handle Firestore queries for web
        if (!window.electronAPI) {
            if (sql.includes('SELECT * FROM lessons WHERE id = ?')) {
                const lessonDoc = await getDoc(doc(firestore, 'lessons', params[0]));
                if (lessonDoc.exists()) {
                    const data = lessonDoc.data();
                    return [{ id: lessonDoc.id, content_json: JSON.stringify(data) }] as any;
                }
            }
            if (sql.includes('SELECT * FROM lessons WHERE moduleId = ?')) {
                const q = query(collection(firestore, 'lessons'), where('moduleId', '==', params[0]));
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any;
            }
        }

        if (window.electronAPI && window.electronAPI.dbQuery) {
            const result = await window.electronAPI.dbQuery(sql, params);
            return result;
        }

        // Final Browser Fallback (Local Storage)
        if (sql.includes('SELECT * FROM lessons')) {
            const id = params[0];
            const data = localStorage.getItem(`mock_db_lesson_${id}`);
            return data ? [JSON.parse(data)] : [];
        }
        return [];
    }

    static async execute(sql: string, params: any[] = []): Promise<any> {
        if (window.electronAPI && window.electronAPI.dbExecute) {
            return window.electronAPI.dbExecute(sql, params);
        }
        return { changes: 1 };
    }

    // --- Learning ---

    static async getLesson(lessonId: string): Promise<any> {
        if (!window.electronAPI) {
            const lessonDoc = await getDoc(doc(firestore, 'lessons', lessonId));
            if (lessonDoc.exists()) {
                const data = lessonDoc.data();
                return {
                    id: lessonId,
                    ...data,
                    content_json: data.content_json || JSON.stringify(data)
                };
            }
        }
        const results = await this.query('SELECT * FROM lessons WHERE id = ?', [lessonId]);
        return results[0] || null;
    }

    static async saveLesson(lesson: any) {
        const id = lesson.id || `${lesson.moduleId}-L${String(lesson.order || 1).padStart(2, '0')}`;
        const updatedAt = new Date().toISOString();
        if (!window.electronAPI) {
            await setDoc(doc(firestore, 'lessons', id), {
                ...lesson,
                id,
                updatedAt
            });
            return;
        }

        const existing = await this.getLesson(id);
        if (existing) {
            return this.execute(
                'UPDATE lessons SET title = ?, content_json = ?, isPublished = ?, updatedAt = ? WHERE id = ?',
                [lesson.title, JSON.stringify(lesson), lesson.isPublished ? 1 : 0, updatedAt, id]
            );
        } else {
            return this.execute(
                'INSERT INTO lessons (id, moduleId, title, content_json, isPublished, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                [id, lesson.moduleId, lesson.title, JSON.stringify(lesson), 0, updatedAt]
            );
        }
    }

    static async clearLessons() {
        if (!window.electronAPI) {
            const { writeBatch, getDocs, collection } = await import('firebase/firestore');
            const batch = writeBatch(firestore);
            const snapshot = await getDocs(collection(firestore, 'lessons'));
            snapshot.forEach((d) => batch.delete(d.ref));
            await batch.commit();
            return;
        }
        return this.execute('DELETE FROM lessons');
    }

    static async deleteUser(uid: string) {
        if (!window.electronAPI) {
            const { deleteDoc, doc } = await import('firebase/firestore');
            await deleteDoc(doc(firestore, 'users', uid));
        }
    }

    static async updateProgress(userId: string, lessonId: string, itemId: string, status: string, answer: any) {
        if (!window.electronAPI) {
            const { doc, setDoc } = await import('firebase/firestore');
            const ref = doc(firestore, `users/${userId}/progress/${lessonId}`);
            await setDoc(ref, {
                [itemId]: { status, answer, timestamp: new Date().toISOString() },
                completed: true, // mark lesson as completed if they checked an answer for now
                lastUpdated: new Date().toISOString()
            }, { merge: true });

            // Trigger streak update
            await this.syncStreak(userId);
        }
    }

    static async syncStreak(userId: string) {
        if (!window.electronAPI) {
            const { doc, getDoc, updateDoc } = await import('firebase/firestore');
            const userRef = doc(firestore, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) return;

            const data = userSnap.data();
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const lastActive = data.lastActivityDate;

            let currentStreak = data.streakCount || 0;

            if (!lastActive) {
                currentStreak = 1;
            } else {
                const lastDate = new Date(lastActive);
                // Calculate difference in days based on date strings to avoid timezone/time-of-day issues
                const d1 = new Date(todayStr);
                const d2 = new Date(lastActive);
                const diffTime = d1.getTime() - d2.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    currentStreak += 1;
                } else if (diffDays > 1) {
                    currentStreak = 1;
                }
                // if diffDays === 0, keep current streak
            }

            await updateDoc(userRef, {
                streakCount: currentStreak,
                lastActivityDate: todayStr
            });

            // Update local storage for active session
            const stored = localStorage.getItem('lingolume_user');
            if (stored) {
                const user = JSON.parse(stored);
                if (user.id === userId) {
                    user.streakCount = currentStreak;
                    user.lastActivityDate = todayStr;
                    localStorage.setItem('lingolume_user', JSON.stringify(user));
                }
            }
        }
    }

    static async getCompletedLessons(userId: string): Promise<Record<string, boolean>> {
        if (!window.electronAPI) {
            const { collection, getDocs } = await import('firebase/firestore');
            const progressRef = collection(firestore, `users/${userId}/progress`);
            const snapshot = await getDocs(progressRef);
            const completed: Record<string, boolean> = {};
            snapshot.forEach(d => {
                if (d.data().completed) completed[d.id] = true;
            });
            return completed;
        }
        return {};
    }

    static async getStats() {
        if (!window.electronAPI) {
            const lessons = await getDocs(collection(firestore, 'lessons'));
            const users = await getDocs(collection(firestore, 'users'));
            const vocab = await getDocs(collection(firestore, 'vocabulary'));
            return {
                lessons: lessons.size,
                users: users.size,
                vocabulary: vocab.size,
                mode: 'Cloud (Firestore)'
            };
        }

        const lessons = await this.query('SELECT count(*) as count FROM lessons');
        return {
            lessons: (lessons[0] as any)?.count || 0,
            mode: 'Local (SQLite)'
        };
    }
}
