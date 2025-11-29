import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  user,
  updateProfile
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  docData
} from '@angular/fire/firestore';
import { Observable, from, of, switchMap } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  createdAt: Date;
  totalQuizzes: number;
  averageScore: number;
  currentDifficulty: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  user$ = user(this.auth);
  currentUser = signal<User | null>(null);
  userProfile = signal<UserProfile | null>(null);

  constructor() {
    // Subscribe to auth state changes
    this.user$.subscribe(user => {
      this.currentUser.set(user);
      if (user) {
        this.loadUserProfile(user.uid);
      } else {
        this.userProfile.set(null);
      }
    });
  }

  // Sign up new user
  async signUp(email: string, password: string, displayName: string): Promise<void> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Update display name
      if (credential.user) {
        await updateProfile(credential.user, { displayName });
        
        // Create user profile in Firestore
        const userProfile: UserProfile = {
          uid: credential.user.uid,
          email: credential.user.email!,
          displayName,
          role: 'user', // Default role
          createdAt: new Date(),
          totalQuizzes: 0,
          averageScore: 0,
          currentDifficulty: 1
        };
        
        await this.createUserProfile(userProfile);
      }
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Sign in existing user
  async signIn(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error: any) {
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  // Create user profile in Firestore
  private async createUserProfile(profile: UserProfile): Promise<void> {
    const userDoc = doc(this.firestore, `users/${profile.uid}`);
    await setDoc(userDoc, profile);
    this.userProfile.set(profile);
  }

  // Load user profile from Firestore
  private async loadUserProfile(uid: string): Promise<void> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    const docSnap = await getDoc(userDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfile;
      this.userProfile.set({
        ...data,
        createdAt: data.createdAt instanceof Date ? data.createdAt : (data.createdAt as any).toDate()
      });
    }
  }

  // Get user profile as observable
  getUserProfile$(uid: string): Observable<UserProfile | null> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    return docData(userDoc) as Observable<UserProfile | null>;
  }

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    await setDoc(userDoc, updates, { merge: true });
    
    // Update local signal
    if (this.userProfile()) {
      this.userProfile.set({ ...this.userProfile()!, ...updates });
    }
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.userProfile()?.role === 'admin';
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  // Get error messages
  private getErrorMessage(errorCode: string): string {
    const errors: { [key: string]: string } = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/operation-not-allowed': 'Operation not allowed.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.'
    };
    
    return errors[errorCode] || 'An error occurred. Please try again.';
  }
}
