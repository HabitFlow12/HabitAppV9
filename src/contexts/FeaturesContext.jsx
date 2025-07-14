import React, { createContext, useContext, useState, useEffect } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from './AuthContext'

const FeaturesContext = createContext()

export function useFeatures() {
  return useContext(FeaturesContext)
}

export function FeaturesProvider({ children }) {
  const { currentUser, getUserData, updateUserData } = useAuth()
  const [journalEntries, setJournalEntries] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [todoItems, setTodoItems] = useState([])
  const [mealLogs, setMealLogs] = useState({})
  const [waterIntake, setWaterIntake] = useState({})
  const [mealTrackerSettings, setMealTrackerSettings] = useState({ waterGoal: 8 })
  const [futureLetters, setFutureLetters] = useState([])
  const [gratitudeEntries, setGratitudeEntries] = useState([])
  const [dayReflections, setDayReflections] = useState([])
  const [bucketListItems, setBucketListItems] = useState([])
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState({})
  const [savingsGoals, setSavingsGoals] = useState([])
  const [financeSettings, setFinanceSettings] = useState({})
  const [schoolTasks, setSchoolTasks] = useState([])
  const [schoolSubjects, setSchoolSubjects] = useState([])
  const [schoolGrades, setSchoolGrades] = useState([])
  const [studySchedule, setStudySchedule] = useState([])
  const [schoolSettings, setSchoolSettings] = useState({})
  const [loading, setLoading] = useState(true)
  
  // Password Vault state
  const [passwordEntries, setPasswordEntries] = useState([])
  const [vaultPin, setVaultPin] = useState('')

  // Load user data when user changes
  useEffect(() => {
    if (currentUser && currentUser.emailVerified) {
      loadFeaturesData()
    } else {
      resetAllData()
    }
  }, [currentUser])

  function resetAllData() {
    setJournalEntries([])
    setCalendarEvents([])
    setTodoItems([])
    setMealLogs({})
    setWaterIntake({})
    setMealTrackerSettings({ waterGoal: 8 })
    setFutureLetters([])
    setGratitudeEntries([])
    setDayReflections([])
    setBucketListItems([])
    setTransactions([])
    setBudgets({})
    setSavingsGoals([])
    setFinanceSettings({})
    setSchoolTasks([])
    setSchoolSubjects([])
    setSchoolGrades([])
    setStudySchedule([])
    setSchoolSettings({})
    setPasswordEntries([])
    setVaultPin('')
    setLoading(false)
  }

  async function loadFeaturesData() {
    try {
      setLoading(true)
      const userData = await getUserData(currentUser.uid)
      if (userData) {
        // Safely load all features data with proper defaults
        setJournalEntries(userData.journalEntries || [])
        setCalendarEvents(userData.calendarEvents || [])
        setTodoItems(userData.todoItems || [])
        setMealLogs(userData.mealLogs || {})
        setWaterIntake(userData.waterIntake || {})
        setMealTrackerSettings(userData.mealTrackerSettings || { waterGoal: 8 })
        setFutureLetters(userData.futureLetters || [])
        setGratitudeEntries(userData.gratitudeEntries || [])
        setDayReflections(userData.dayReflections || [])
        setBucketListItems(userData.bucketListItems || [])
        setTransactions(userData.transactions || [])
        setBudgets(userData.budgets || {})
        setSavingsGoals(userData.savingsGoals || [])
        setFinanceSettings(userData.financeSettings || {})
        setSchoolTasks(userData.schoolTasks || [])
        setSchoolSubjects(userData.schoolSubjects || [])
        setSchoolGrades(userData.schoolGrades || [])
        setStudySchedule(userData.studySchedule || [])
        setSchoolSettings(userData.schoolSettings || {})
        setPasswordEntries(userData.passwordEntries || [])
        setVaultPin(userData.vaultPin || '')
        
        console.log('Features data loaded successfully:', {
          journalEntries: userData.journalEntries?.length || 0,
          calendarEvents: userData.calendarEvents?.length || 0,
          todoItems: userData.todoItems?.length || 0,
          transactions: userData.transactions?.length || 0
        })
      } else {
        console.log('No features data found, initializing with defaults')
        // Initialize with empty defaults if no data exists
        resetAllData()
      }
    } catch (error) {
      console.error('Error loading features data:', error)
      // Initialize with empty defaults on error
      resetAllData()
    } finally {
      setLoading(false)
    }
  }

  async function saveFeaturesData() {
    if (!currentUser) return

    try {
      // Prepare complete features data for saving
      const featuresData = {
        journalEntries,
        calendarEvents,
        todoItems,
        mealLogs,
        waterIntake,
        mealTrackerSettings,
        futureLetters,
        gratitudeEntries,
        dayReflections,
        bucketListItems,
        transactions,
        budgets,
        savingsGoals,
        financeSettings,
        schoolTasks,
        schoolSubjects,
        schoolGrades,
        studySchedule,
        schoolSettings,
        passwordEntries,
        vaultPin,
        lastUpdated: new Date()
      }
      
      // Use setDoc with merge to safely update the document
      await setDoc(doc(db, "users", currentUser.uid), featuresData, { merge: true })
    } catch (error) {
      console.error('Error saving features data:', error)
      // Don't throw error to prevent app crashes, but log for debugging
    }
  }

  // Journal functions
  function addJournalEntry(title, content, mood = null) {
    const entry = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      mood,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    }
    setJournalEntries(prev => [entry, ...prev])
    return entry.id
  }

  function deleteJournalEntry(entryId) {
    setJournalEntries(prev => prev.filter(entry => entry.id !== entryId))
  }

  function getJournalEntries() {
    return journalEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  // Calendar functions
  function addCalendarEvent(title, date, category = 'general', description = '') {
    const event = {
      id: Date.now().toString(),
      title: title.trim(),
      date: date,
      category,
      description: description.trim(),
      timestamp: new Date().toISOString()
    }
    setCalendarEvents(prev => [...prev, event])
    return event.id
  }

  function deleteCalendarEvent(eventId) {
    setCalendarEvents(prev => prev.filter(event => event.id !== eventId))
  }

  function getCalendarEvents(date = null) {
    if (date) {
      return calendarEvents.filter(event => event.date === date)
    }
    return calendarEvents.sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  function getEventsForMonth(year, month) {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getFullYear() === year && eventDate.getMonth() === month
    })
  }

  // Todo functions
  function addTodoItem(title, dueDate = null) {
    const todo = {
      id: Date.now().toString(),
      title: title.trim(),
      dueDate,
      completed: false,
      completedAt: null,
      timestamp: new Date().toISOString()
    }
    
    setTodoItems(prev => [...prev, todo])
    
    // If there's a due date, add it to calendar
    if (dueDate) {
      addCalendarEvent(`📋 ${title}`, dueDate, 'todo', 'Todo item due date')
    }
    
    return todo.id
  }

  function completeTodoItem(todoId) {
    setTodoItems(prev => prev.map(todo => 
      todo.id === todoId 
        ? { ...todo, completed: true, completedAt: new Date().toISOString() }
        : todo
    ))
    
    // Schedule removal after 24 hours
    setTimeout(() => {
      setTodoItems(prev => prev.filter(todo => todo.id !== todoId))
    }, 24 * 60 * 60 * 1000) // 24 hours
  }

  function deleteTodoItem(todoId) {
    const todo = todoItems.find(item => item.id === todoId)
    setTodoItems(prev => prev.filter(item => item.id !== todoId))
    
    // Remove from calendar if it was added there
    if (todo && todo.dueDate) {
      const calendarEvent = calendarEvents.find(event => 
        event.title === `📋 ${todo.title}` && 
        event.date === todo.dueDate &&
        event.category === 'todo'
      )
      if (calendarEvent) {
        deleteCalendarEvent(calendarEvent.id)
      }
    }
  }

  function getActiveTodoItems() {
    return todoItems.filter(todo => !todo.completed)
      .sort((a, b) => {
        // Sort by due date, then by creation time
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate)
        }
        if (a.dueDate && !b.dueDate) return -1
        if (!a.dueDate && b.dueDate) return 1
        return new Date(b.timestamp) - new Date(a.timestamp)
      })
  }

  function getCompletedTodoItems() {
    return todoItems.filter(todo => todo.completed)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  }

  // Meal Tracker functions
  function getMealLogs(date) {
    return mealLogs[date] || []
  }

  function addMealLog(date, mealData) {
    const meal = {
      id: Date.now().toString(),
      ...mealData,
      timestamp: new Date().toISOString()
    }
    
    setMealLogs(prev => ({
      ...prev,
      [date]: [...(prev[date] || []), meal]
    }))
    
    return meal.id
  }

  function updateMealLog(date, mealId, updatedMealData) {
    setMealLogs(prev => ({
      ...prev,
      [date]: (prev[date] || []).map(meal => 
        meal.id === mealId 
          ? { ...meal, ...updatedMealData, timestamp: new Date().toISOString() }
          : meal
      )
    }))
  }

  function deleteMealLog(date, mealId) {
    setMealLogs(prev => ({
      ...prev,
      [date]: (prev[date] || []).filter(meal => meal.id !== mealId)
    }))
  }

  function getWaterIntake(date) {
    return waterIntake[date] || 0
  }

  function updateWaterIntake(date, amount) {
    setWaterIntake(prev => ({
      ...prev,
      [date]: Math.max(0, amount)
    }))
  }

  function getMealTrackerSettings() {
    return mealTrackerSettings
  }

  function updateMealTrackerSettings(settings) {
    setMealTrackerSettings(prev => ({ ...prev, ...settings }))
  }

  function getMealStreak() {
    const dates = Object.keys(mealLogs).sort().reverse()
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    
    let currentDate = new Date()
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const meals = mealLogs[dateStr] || []
      
      if (meals.length >= 3) { // At least 3 meals per day
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  function getWaterStreak() {
    const dates = Object.keys(waterIntake).sort().reverse()
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    const waterGoal = mealTrackerSettings.waterGoal || 8
    
    let currentDate = new Date()
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const water = waterIntake[dateStr] || 0
      
      if (water >= waterGoal) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  // Future Letters functions
  function getFutureLetters() {
    const now = new Date()
    return futureLetters.filter(letter => {
      const deliveryDate = new Date(letter.deliveryDate)
      return deliveryDate > now && !letter.delivered
    }).sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))
  }

  function getDeliveredLetters() {
    const now = new Date()
    return futureLetters.filter(letter => {
      const deliveryDate = new Date(letter.deliveryDate)
      return deliveryDate <= now || letter.delivered
    }).sort((a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate))
  }

  function addFutureLetter(letterData) {
    const letter = {
      id: Date.now().toString(),
      ...letterData,
      delivered: false,
      isRead: false
    }
    
    setFutureLetters(prev => [...prev, letter])
    return letter.id
  }

  function markLetterAsRead(letterId) {
    setFutureLetters(prev => prev.map(letter =>
      letter.id === letterId ? { ...letter, isRead: true } : letter
    ))
  }

  // Gratitude functions
  function getGratitudeEntries() {
    return gratitudeEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  function addGratitudeEntry(text) {
    const entry = {
      id: Date.now().toString(),
      text: text.trim(),
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    }
    
    setGratitudeEntries(prev => [entry, ...prev])
    return entry.id
  }

  function deleteGratitudeEntry(entryId) {
    setGratitudeEntries(prev => prev.filter(entry => entry.id !== entryId))
  }

  function getGratitudeStreak() {
    const dates = {}
    gratitudeEntries.forEach(entry => {
      const date = new Date(entry.timestamp).toDateString()
      dates[date] = true
    })
    
    let streak = 0
    let currentDate = new Date()
    
    while (true) {
      const dateStr = currentDate.toDateString()
      if (dates[dateStr]) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  // Day Reflection functions
  function getDayReflections() {
    return dayReflections.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  function addDayReflection(reflectionData) {
    const reflection = {
      id: Date.now().toString(),
      ...reflectionData,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    }
    
    setDayReflections(prev => [reflection, ...prev])
    return reflection.id
  }

  function deleteDayReflection(reflectionId) {
    setDayReflections(prev => prev.filter(reflection => reflection.id !== reflectionId))
  }

  function getDayReflectionStreak() {
    const dates = {}
    dayReflections.forEach(reflection => {
      const date = new Date(reflection.timestamp).toDateString()
      dates[date] = true
    })
    
    let streak = 0
    let currentDate = new Date()
    
    while (true) {
      const dateStr = currentDate.toDateString()
      if (dates[dateStr]) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  // Bucket List functions
  function getBucketListItems() {
    return bucketListItems.sort((a, b) => {
      // Sort completed items to bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }

  function addBucketListItem(itemData) {
    const item = {
      id: Date.now().toString(),
      ...itemData,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    }
    
    setBucketListItems(prev => [...prev, item])
    return item.id
  }

  function updateBucketListItem(itemId, updates) {
    setBucketListItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    ))
  }

  function completeBucketListItem(itemId) {
    setBucketListItems(prev => prev.map(item =>
      item.id === itemId 
        ? { ...item, completed: true, completedAt: new Date().toISOString() }
        : item
    ))
  }

  function deleteBucketListItem(itemId) {
    setBucketListItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Finance functions
  function getTransactions() {
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  function addTransaction(transactionData) {
    const transaction = {
      id: Date.now().toString(),
      ...transactionData,
      createdAt: new Date().toISOString()
    }
    
    setTransactions(prev => [...prev, transaction])
    return transaction.id
  }

  function updateTransaction(transactionId, transactionData) {
    setTransactions(prev => prev.map(transaction =>
      transaction.id === transactionId 
        ? { ...transaction, ...transactionData, updatedAt: new Date().toISOString() }
        : transaction
    ))
  }

  function deleteTransaction(transactionId) {
    setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId))
  }

  function getBudgets() {
    return budgets
  }

  function setBudget(category, budgetData) {
    setBudgets(prev => ({
      ...prev,
      [category]: {
        ...budgetData,
        updatedAt: new Date().toISOString()
      }
    }))
  }

  function getSavingsGoals() {
    return savingsGoals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  function addSavingsGoal(goalData) {
    const goal = {
      id: Date.now().toString(),
      ...goalData,
      createdAt: new Date().toISOString()
    }
    
    setSavingsGoals(prev => [...prev, goal])
    return goal.id
  }

  function updateSavingsGoal(goalId, goalData) {
    setSavingsGoals(prev => prev.map(goal =>
      goal.id === goalId 
        ? { ...goal, ...goalData, updatedAt: new Date().toISOString() }
        : goal
    ))
  }

  function deleteSavingsGoal(goalId) {
    setSavingsGoals(prev => prev.filter(goal => goal.id !== goalId))
  }

  function getFinanceSettings() {
    return financeSettings
  }

  function updateFinanceSettings(settings) {
    setFinanceSettings(prev => ({ ...prev, ...settings }))
  }

  // School functions
  function getSchoolTasks() {
    return schoolTasks.sort((a, b) => {
      // Sort by due date, then by priority
      if (a.dueDate && b.dueDate) {
        const dateCompare = new Date(a.dueDate) - new Date(b.dueDate)
        if (dateCompare !== 0) return dateCompare
      }
      if (a.dueDate && !b.dueDate) return -1
      if (!a.dueDate && b.dueDate) return 1
      
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  function addSchoolTask(taskData) {
    const task = {
      id: Date.now().toString(),
      ...taskData,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    }
    
    setSchoolTasks(prev => [...prev, task])
    
    // Add to calendar if has due date
    if (task.dueDate) {
      const typeEmojis = {
        homework: '📝',
        quiz: '📋',
        test: '📊',
        project: '🎯'
      }
      addCalendarEvent(
        `${typeEmojis[task.type]} ${task.title}`,
        task.dueDate,
        'school',
        `${task.subject} - ${task.type}`
      )
    }
    
    return task.id
  }

  function updateSchoolTask(taskId, taskData) {
    setSchoolTasks(prev => prev.map(task =>
      task.id === taskId 
        ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
        : task
    ))
  }

  function completeSchoolTask(taskId) {
    setSchoolTasks(prev => prev.map(task =>
      task.id === taskId 
        ? { ...task, completed: true, completedAt: new Date().toISOString() }
        : task
    ))
  }

  function deleteSchoolTask(taskId) {
    setSchoolTasks(prev => prev.filter(task => task.id !== taskId))
  }

  function getSchoolSubjects() {
    return schoolSubjects.sort((a, b) => a.name.localeCompare(b.name))
  }

  function addSchoolSubject(subjectData) {
    const subject = {
      id: Date.now().toString(),
      ...subjectData,
      createdAt: new Date().toISOString()
    }
    
    setSchoolSubjects(prev => [...prev, subject])
    return subject.id
  }

  function updateSchoolSubject(subjectId, subjectData) {
    setSchoolSubjects(prev => prev.map(subject =>
      subject.id === subjectId 
        ? { ...subject, ...subjectData, updatedAt: new Date().toISOString() }
        : subject
    ))
  }

  function deleteSchoolSubject(subjectId) {
    setSchoolSubjects(prev => prev.filter(subject => subject.id !== subjectId))
  }

  function getSchoolGrades() {
    return schoolGrades.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  function addSchoolGrade(gradeData) {
    const grade = {
      id: Date.now().toString(),
      ...gradeData,
      createdAt: new Date().toISOString()
    }
    
    setSchoolGrades(prev => [...prev, grade])
    return grade.id
  }

  function updateSchoolGrade(gradeId, gradeData) {
    setSchoolGrades(prev => prev.map(grade =>
      grade.id === gradeId 
        ? { ...grade, ...gradeData, updatedAt: new Date().toISOString() }
        : grade
    ))
  }

  function deleteSchoolGrade(gradeId) {
    setSchoolGrades(prev => prev.filter(grade => grade.id !== gradeId))
  }

  function getStudySchedule() {
    return studySchedule.sort((a, b) => {
      // Sort by day of week, then by start time
      const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      const dayCompare = dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek)
      if (dayCompare !== 0) return dayCompare
      return a.startTime.localeCompare(b.startTime)
    })
  }

  function addStudySession(sessionData) {
    const session = {
      id: Date.now().toString(),
      ...sessionData,
      createdAt: new Date().toISOString()
    }
    
    setStudySchedule(prev => [...prev, session])
    return session.id
  }

  function updateStudySession(sessionId, sessionData) {
    setStudySchedule(prev => prev.map(session =>
      session.id === sessionId 
        ? { ...session, ...sessionData, updatedAt: new Date().toISOString() }
        : session
    ))
  }

  function deleteStudySession(sessionId) {
    setStudySchedule(prev => prev.filter(session => session.id !== sessionId))
  }

  function getSchoolSettings() {
    return schoolSettings
  }

  function updateSchoolSettings(settings) {
    setSchoolSettings(prev => ({ ...prev, ...settings }))
  }

  // Password Vault functions
  function getPasswordEntries() {
    return passwordEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  function addPasswordEntry(entryData) {
    const entry = {
      id: Date.now().toString(),
      ...entryData,
      createdAt: new Date().toISOString()
    }
    
    setPasswordEntries(prev => [...prev, entry])
    return entry.id
  }

  function updatePasswordEntry(entryId, entryData) {
    setPasswordEntries(prev => prev.map(entry =>
      entry.id === entryId 
        ? { ...entry, ...entryData, updatedAt: new Date().toISOString() }
        : entry
    ))
  }

  function deletePasswordEntry(entryId) {
    setPasswordEntries(prev => prev.filter(entry => entry.id !== entryId))
  }

  function getVaultPin() {
    return vaultPin
  }

  function updateVaultPin(pin) {
    // In a real app, you'd want to hash this PIN
    // For demo purposes, we'll store it as-is
    setVaultPin(pin)
  }

  function verifyVaultPin(inputPin) {
    return inputPin === vaultPin
  }

  function calculateGPA() {
    if (schoolGrades.length === 0) return 0
    
    const gradePoints = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0
    }
    
    let totalPoints = 0
    let totalCredits = 0
    
    schoolGrades.forEach(grade => {
      const points = gradePoints[grade.grade] || 0
      const credits = grade.credits || 1
      totalPoints += points * credits
      totalCredits += credits
    })
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0
  }

  // Auto-save when data changes with debouncing
  useEffect(() => {
    if (!loading && currentUser) {
      const timeoutId = setTimeout(() => {
        saveFeaturesData()
      }, 1000) // Increase debounce to 1 second to reduce Firebase calls

      return () => clearTimeout(timeoutId)
    }
  }, [
    journalEntries, calendarEvents, todoItems, mealLogs, waterIntake, 
    mealTrackerSettings, futureLetters, gratitudeEntries, dayReflections, 
    bucketListItems, transactions, budgets, savingsGoals, financeSettings,
    schoolTasks, schoolSubjects, schoolGrades, studySchedule, schoolSettings,
    passwordEntries, vaultPin
  ])

  const value = {
    // Journal
    journalEntries,
    addJournalEntry,
    deleteJournalEntry,
    getJournalEntries,
    
    // Calendar
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    getCalendarEvents,
    getEventsForMonth,
    
    // Todo
    todoItems,
    addTodoItem,
    completeTodoItem,
    deleteTodoItem,
    getActiveTodoItems,
    getCompletedTodoItems,
    
    // Meal Tracker
    getMealLogs,
    addMealLog,
    updateMealLog,
    deleteMealLog,
    getWaterIntake,
    updateWaterIntake,
    getMealTrackerSettings,
    updateMealTrackerSettings,
    getMealStreak,
    getWaterStreak,
    
    // Future Letters
    getFutureLetters,
    getDeliveredLetters,
    addFutureLetter,
    markLetterAsRead,
    
    // Gratitude
    getGratitudeEntries,
    addGratitudeEntry,
    deleteGratitudeEntry,
    getGratitudeStreak,
    
    // Day Reflections
    getDayReflections,
    addDayReflection,
    deleteDayReflection,
    getDayReflectionStreak,
    
    // Bucket List
    getBucketListItems,
    addBucketListItem,
    updateBucketListItem,
    completeBucketListItem,
    deleteBucketListItem,
    
    // Finance
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getBudgets,
    setBudget,
    getSavingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    getFinanceSettings,
    updateFinanceSettings,
    
    // School
    getSchoolTasks,
    addSchoolTask,
    updateSchoolTask,
    completeSchoolTask,
    deleteSchoolTask,
    getSchoolSubjects,
    addSchoolSubject,
    updateSchoolSubject,
    deleteSchoolSubject,
    getSchoolGrades,
    addSchoolGrade,
    updateSchoolGrade,
    deleteSchoolGrade,
    getStudySchedule,
    addStudySession,
    updateStudySession,
    deleteStudySession,
    getSchoolSettings,
    updateSchoolSettings,
    calculateGPA,
    
    // Password Vault
    getPasswordEntries,
    addPasswordEntry,
    updatePasswordEntry,
    deletePasswordEntry,
    getVaultPin,
    updateVaultPin,
    verifyVaultPin,
    
    // General
    loading
  }

  return (
    <FeaturesContext.Provider value={value}>
      {children}
    </FeaturesContext.Provider>
  )
}