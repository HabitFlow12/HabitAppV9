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
    const userCred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCred.user, { displayName: name })
    
    // Send email verification immediately after account creation
    try {
      await sendEmailVerification(userCred.user)
      console.log('Email verification sent successfully')
    } catch (verificationError) {
      console.error('Error sending verification email:', verificationError)
      // Don't throw error - allow signup to continue even if email fails
    }

    // Create user document in Firestore
    const userData = {
      userId: userCred.user.uid,
      name,
      email,
      verified: false,
      createdAt: new Date(),
      lastLogin: new Date(),
      habits: {},
      habitCompletion: {},
      activityLog: {},
      habitPreferences: {}
    }
    
    // Use setDoc to create the document
    await setDoc(doc(db, "users", userCred.user.uid), userData)

    return userCred
  }

  async function login(email, password) {
    const userCred = await signInWithEmailAndPassword(auth, email, password)
    
    // Update last login time
    await setDoc(doc(db, "users", userCred.user.uid), {
      lastLogin: new Date()
    }, { merge: true })

    return userCred
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