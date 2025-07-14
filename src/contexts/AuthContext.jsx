import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function signup(email, password, name) {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update profile first
      await updateProfile(userCred.user, { displayName: name })
      
      // Force refresh the user to get updated profile
      await userCred.user.reload()
      
      // Send email verification with proper error handling
      await sendEmailVerification(userCred.user, {
        handleCodeInApp: false,
        url: window.location.origin
      })
      
      console.log('Email verification sent successfully to:', email)
    } catch (verificationError) {
      console.error('Error sending verification email:', verificationError)
      // Re-throw verification errors so user knows about the issue
      throw new Error('Account created but verification email failed to send. Please try logging in and request a new verification email.')
    }

      // Create comprehensive user document in Firestore
      const userData = {
        userId: userCred.user.uid,
        name,
        email,
        verified: false,
        createdAt: new Date(),
        lastLogin: new Date(),
        // Habit system data
        habits: {},
        habitCompletion: {},
        activityLog: {},
        habitPreferences: {},
        habitStacks: {},
        dailyStats: {},
        reflections: {},
        // Features data
        journalEntries: [],
        calendarEvents: [],
        todoItems: [],
        mealLogs: {},
        waterIntake: {},
        mealTrackerSettings: { waterGoal: 8 },
        futureLetters: [],
        gratitudeEntries: [],
        dayReflections: [],
        bucketListItems: [],
        transactions: [],
        budgets: {},
        savingsGoals: [],
        financeSettings: {},
        schoolTasks: [],
        schoolSubjects: [],
        schoolGrades: [],
        studySchedule: [],
        schoolSettings: {},
        passwordEntries: [],
        vaultPin: '',
        lastUpdated: new Date()
      }
      
      // Use setDoc to create the document with merge to avoid overwriting
      await setDoc(doc(db, "users", userCred.user.uid), userData, { merge: true })

      return userCred
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  async function login(email, password) {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password)
      
      // Update last login time
      await setDoc(doc(db, "users", userCred.user.uid), {
        lastLogin: new Date()
      }, { merge: true })

      return userCred
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async function logout() {
    return signOut(auth)
  }

  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email)
  }

  async function getUserData(uid) {
    const userDoc = await getDoc(doc(db, "users", uid))
    return userDoc.exists() ? userDoc.data() : null
  }

  async function updateUserData(uid, data) {
    return setDoc(doc(db, "users", uid), data, { merge: true })
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    getUserData,
    updateUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}