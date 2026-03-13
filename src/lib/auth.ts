import { firestore } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface User {
    email: string;
    role: 'admin' | 'user';
    name: string;
    permissions: Record<string, boolean>;
    id: string;
    streakCount?: number;
    lastActivityDate?: string;
}

export const AuthService = {
    async login(email: string, password: string): Promise<User | null> {
        // Special case for Admin
        if (email === 'admin.info' && password === '0190') {
            const adminUser: User = {
                email: 'admin.info',
                role: 'admin',
                id: 'admin-id',
                name: 'Administrator',
                permissions: { '*': true }
            };
            localStorage.setItem('lingolume_user', JSON.stringify(adminUser));
            return adminUser;
        }

        // Check for normal users in Firestore
        // For testing, we check if a user with this email exists and the password matches
        const userDoc = await getDoc(doc(firestore, 'users', email.replace('.', '_')));
        if (userDoc.exists()) {
                const data = userDoc.data();
                if (data.password === password) {
                    // Robust Permission Mapping
                    const mergedPermissions = {
                        ...(data.permissions || {}),
                        ...(data.accessibleCourses || {}),
                        ...(data.accessRights || {}),
                        ...(data.purchasedCourses || {})
                    };

                    const user: User = {
                        email: data.email,
                        role: data.role || 'user',
                        id: userDoc.id,
                        name: data.name || 'User',
                        permissions: mergedPermissions,
                        streakCount: data.streakCount || 0,
                        lastActivityDate: data.lastActivityDate
                    };
                localStorage.setItem('lingolume_user', JSON.stringify(user));
                return user;
            }
        }

        return null;
    },

    getCurrentUser(): User | null {
        const stored = localStorage.getItem('lingolume_user');
        return stored ? JSON.parse(stored) : null;
    },

    logout() {
        localStorage.removeItem('lingolume_user');
        window.location.reload();
    }
};
