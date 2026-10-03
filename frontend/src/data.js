export const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: '🏠' },
  { label: 'Daily Check-in', to: '/daily-checkin', icon: '📝' },
  { label: 'Exercises', to: '/exercises', icon: '🏋️' },
  { label: 'Medication', to: '/medication', icon: '💊' },
  { label: 'Blood Pressure', to: '/blood-pressure', icon: '🩺' },
  { label: 'Progress', to: '/progress', icon: '📈' },
  { label: 'Notes', to: '/notes', icon: '📌' },
  { label: 'Emergency Information', to: '/emergency', icon: '🚨' },
  { label: 'Privacy & Security', to: '/privacy-security', icon: '🔒' },
  { label: 'Settings', to: '/settings', icon: '⚙️' },
]

export const mobilityOptions = [
  'Unable today',
  'Needs significant assistance',
  'Needs some assistance',
  'Able with little/no assistance',
]

export const moodOptions = ['Calm', 'Tired', 'Frustrated', 'Happy', 'Anxious']

export const quickSummary = [
  'Mobility was steady with light support in the morning.',
  'Exercise completion is strong for the week.',
  'Blood-pressure readings remain within the recent variation recorded by the caregiver.',
  'Medication entries are mostly complete with one missed afternoon dose noted.',
]

export const weeklyProgress = [
  { name: 'Mon', mobility: 2, exercise: 75, blood: 118 },
  { name: 'Tue', mobility: 3, exercise: 80, blood: 120 },
  { name: 'Wed', mobility: 2, exercise: 70, blood: 122 },
  { name: 'Thu', mobility: 3, exercise: 85, blood: 119 },
  { name: 'Fri', mobility: 4, exercise: 90, blood: 116 },
  { name: 'Sat', mobility: 3, exercise: 65, blood: 121 },
  { name: 'Sun', mobility: 4, exercise: 95, blood: 118 },
]

export const exerciseSessions = [
  {
    label: 'Morning session',
    items: [
      { name: 'Seated marching', description: 'Gentle seated exercise rhythm', reps: '10 reps each side', completed: true, notes: 'Completed with little effort.' },
      { name: 'Arm reach', description: 'Reach above the shoulder with support if needed', reps: '8 reps', completed: true, notes: 'Needed a hand on the chair.' },
      { name: 'Sit-to-stand practice', description: 'Repeat using the chair for support', reps: '6 reps', completed: false, notes: 'Rested after two repetitions.' },
    ],
  },
  {
    label: 'Afternoon session',
    items: [
      { name: 'Mobility walk', description: 'Short hallway walk with the walker', reps: '5 minutes', completed: true, notes: 'Steady pace with support.' },
      { name: 'Hand opening exercise', description: 'Open and close the affected hand slowly', reps: '12 times', completed: false, notes: 'Mild fatigue noted.' },
    ],
  },
  {
    label: 'Evening session',
    items: [
      { name: 'Stretching routine', description: 'Gentle stretching for arms and legs', reps: '10 minutes', completed: true, notes: 'Completed after dinner.' },
      { name: 'Breathing and relaxation', description: 'Calm breathing routine', reps: '5 minutes', completed: true, notes: 'More relaxed afterwards.' },
    ],
  },
]

export const medicationPlan = [
  { name: 'Morning tablet', time: '8:00 AM', taken: true },
  { name: 'Blood pressure check', time: '10:00 AM', taken: true },
  { name: 'Afternoon supplement', time: '1:00 PM', taken: false },
  { name: 'Evening tablet', time: '8:30 PM', taken: true },
]

export const noteEntries = [
  { title: 'Morning walk', date: 'Today • 9:15 AM', detail: 'Used the walker with one caregiver support and stayed steady.' },
  { title: 'Speech update', date: 'Yesterday • 6:40 PM', detail: 'Answering questions more clearly and speaking in longer sentences.' },
  { title: 'Exercise reminder', date: 'Mon • 7:30 AM', detail: 'Completed seated exercises and rested after the standing practice.' },
]

export const emergencyWarnings = [
  'Sudden facial drooping',
  'Sudden weakness or numbness',
  'Sudden difficulty speaking or understanding',
  'Sudden vision problems',
  'Sudden severe headache',
  'Sudden loss of balance or coordination',
  'Sudden loss of consciousness',
]

export const privacyDetails = [
  {
    title: 'Authentication',
    points: [
      'Caregiver sign-in with strong password requirements',
      'Session timeout after inactivity',
      'Role-based access for family and caregivers',
    ],
  },
  {
    title: 'Sensitive data',
    points: [
      'Encrypted storage for health-related notes',
      'Secure API communication with token validation',
      'Minimal data collection and least-privilege access',
    ],
  },
  {
    title: 'Account controls',
    points: [
      'Audit log for important actions',
      'Access revocation for other caregivers',
      'Data export and secure deletion tools',
    ],
  },
  {
    title: 'Privacy notice',
    points: [
      'No health information in URLs or browser logs',
      'Only necessary data is shared across the app',
      'Clear consent and transparency for caregiver access',
    ],
  },
]

export const settingsOptions = [
  'Large text mode',
  'High contrast view',
  'Reminder alerts',
  'Caregiver notifications',
  'Data sharing summary',
]

export const initialCheckIn = {
  walking: 'Needs some assistance',
  hand: 'Needs significant assistance',
  leg: 'Able with little/no assistance',
  speech: 'Needs some assistance',
  alertness: 'Alert and responsive',
  swallowing: 'Able to eat without difficulty',
  mood: 'Calm',
  exerciseCompleted: true,
  medicationTaken: true,
  bloodPressure: '118/76',
  notes: 'Stayed consistent with the morning routine and rested in the afternoon.',
}
