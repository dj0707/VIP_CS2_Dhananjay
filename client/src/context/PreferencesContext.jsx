import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const PreferencesContext = createContext(null);

const en = {
  brand: 'ResolveX', tagline: 'Public Complaint Portal', dashboard: 'Dashboard', login: 'Login', register: 'Register',
  logout: 'Logout', language: 'Language', theme: 'Theme', dark: 'Dark', light: 'Light', userLogin: 'User Login',
  officerLogin: 'Officer Login', adminLogin: 'Admin Login', portalTitle: 'Public Complaint Registration Portal',
  portalCopy: 'A clear and secure portal to register complaints, attach image evidence, and track resolution updates.',
  portalOpen: 'Portal services are available', portalNote: 'Submit a complaint or use your tracking number to check its current status.',
  trackComplaint: 'Track Complaint', trackingPlaceholder: 'Enter tracking number, for example RX-2026-ABC123',
  registerComplaint: 'Register Complaint', announcements: 'Announcements', noAnnouncements: 'No active announcements.',
  secureAccess: 'Secure access', loginCopy: 'Use the correct portal for your role. Access permissions are verified by the server.',
  email: 'Email', password: 'Password', signIn: 'Sign in', pleaseWait: 'Please wait...', newHere: 'New here?',
  createAccount: 'Create an account', user: 'User', officer: 'Officer', admin: 'Admin', securityCheck: 'Security check',
  captchaAnswer: 'Answer', newQuestion: 'New question', loading: 'Loading...', createYourAccount: 'Create your account',
  registerTitle: 'Register with ResolveX', registerCopy: 'Create an account to submit complaints and follow their progress.',
  fullName: 'Full name', phone: 'Phone', alreadyRegistered: 'Already registered?', welcomeBack: 'Welcome Back',
  myComplaints: 'My Complaints', active: 'Active', resolved: 'Resolved', createComplaint: 'Create Complaint',
  title: 'Title', description: 'Description', department: 'Department', location: 'Location', priority: 'Priority',
  imageEvidence: 'Image evidence', submitComplaint: 'Submit Complaint', loadingComplaints: 'Loading complaints...',
  assigned: 'Assigned', inProgress: 'In Progress', complaint: 'Complaint', trackingNo: 'Tracking No', type: 'Type',
  status: 'Status', agent: 'Agent', created: 'Created', noComplaints: 'No complaints found.', unassigned: 'Unassigned',
  userDashboardCopy: 'Create complaints, upload evidence, and track your complaint history.',
  agentDashboardCopy: 'View assigned complaints, update status, and track work history.',
  complaintSubmitted: 'Complaint submitted. Tracking No:', loginSuccess: 'Login successful',
  registrationFailed: 'Registration failed', loginFailed: 'Login failed', complaintNotFound: 'Complaint not found',
  backDashboard: 'Back to dashboard', complaintDetails: 'Complaint Details', statusTimeline: 'Status Timeline',
  cancelComplaint: 'Cancel Complaint', reopenComplaint: 'Reopen Complaint', archiveComplaint: 'Archive Complaint',
  statusUpdate: 'Agent/Admin Status Update', note: 'Note', resolutionDetails: 'Resolution details',
  resolutionImages: 'Resolution images', updateStatus: 'Update Status', comments: 'Comments', addComment: 'Add comment',
  comment: 'Comment', officerRating: 'Officer Rating', feedback: 'Feedback', submitRating: 'Submit Rating',
  ratingAfterResolution: 'Rating is available after the complaint is resolved.', notAssigned: 'Not assigned',
  notifications: 'Notifications', profile: 'Profile', reports: 'Complaint Reports', noNotifications: 'No notifications.',
  name: 'Name', role: 'Role', notAdded: 'Not added', reportsCopy: 'Complaint information is displayed from MongoDB.',
  adminCopy: 'Manage complaints, users, officers, assignments, announcements, and ratings.',
  complaints: 'Complaints', users: 'Users', agents: 'Officers', assignComplaint: 'Assign Complaint',
  selectComplaint: 'Select complaint', selectAgent: 'Select officer', assign: 'Assign', officerPerformance: 'Officer Performance',
  complaintCategories: 'Complaint Categories', categoryName: 'Category name', responsibleDepartment: 'Responsible department',
  addCategory: 'Add Category', delete: 'Delete', publish: 'Publish', announcementTitle: 'Announcement title',
  announcementMessage: 'Announcement message', accounts: 'User and Officer Accounts', temporaryPassword: 'Temporary password',
  createAccountButton: 'Create Account', deactivate: 'Deactivate'
};

const hi = {
  brand: 'ResolveX', tagline: 'सार्वजनिक शिकायत पोर्टल', dashboard: 'डैशबोर्ड', login: 'लॉगिन', register: 'पंजीकरण',
  logout: 'लॉगआउट', language: 'भाषा', theme: 'थीम', dark: 'डार्क', light: 'लाइट', userLogin: 'उपयोगकर्ता लॉगिन',
  officerLogin: 'अधिकारी लॉगिन', adminLogin: 'प्रशासक लॉगिन', portalTitle: 'सार्वजनिक शिकायत पंजीकरण पोर्टल',
  portalCopy: 'शिकायत दर्ज करने, चित्र प्रमाण जोड़ने और समाधान की स्थिति देखने के लिए सरल और सुरक्षित पोर्टल।',
  portalOpen: 'पोर्टल सेवाएं उपलब्ध हैं', portalNote: 'शिकायत दर्ज करें या वर्तमान स्थिति देखने के लिए ट्रैकिंग नंबर का उपयोग करें।',
  trackComplaint: 'शिकायत ट्रैक करें', trackingPlaceholder: 'ट्रैकिंग नंबर दर्ज करें, जैसे RX-2026-ABC123',
  registerComplaint: 'शिकायत पंजीकृत करें', announcements: 'घोषणाएं', noAnnouncements: 'कोई सक्रिय घोषणा नहीं है।',
  secureAccess: 'सुरक्षित प्रवेश', loginCopy: 'अपनी भूमिका के अनुसार सही पोर्टल का उपयोग करें। अनुमतियों की जांच सर्वर द्वारा की जाती है।',
  email: 'ईमेल', password: 'पासवर्ड', signIn: 'साइन इन', pleaseWait: 'कृपया प्रतीक्षा करें...', newHere: 'नए उपयोगकर्ता?',
  createAccount: 'खाता बनाएं', user: 'उपयोगकर्ता', officer: 'अधिकारी', admin: 'प्रशासक', securityCheck: 'सुरक्षा जांच',
  captchaAnswer: 'उत्तर', newQuestion: 'नया प्रश्न', loading: 'लोड हो रहा है...', createYourAccount: 'अपना खाता बनाएं',
  registerTitle: 'ResolveX में पंजीकरण', registerCopy: 'शिकायत दर्ज करने और उसकी प्रगति देखने के लिए खाता बनाएं।',
  fullName: 'पूरा नाम', phone: 'फोन', alreadyRegistered: 'पहले से पंजीकृत हैं?', welcomeBack: 'वापसी पर स्वागत है',
  myComplaints: 'मेरी शिकायतें', active: 'सक्रिय', resolved: 'समाधान हुआ', createComplaint: 'शिकायत दर्ज करें',
  title: 'शीर्षक', description: 'विवरण', department: 'विभाग', location: 'स्थान', priority: 'प्राथमिकता',
  imageEvidence: 'चित्र प्रमाण', submitComplaint: 'शिकायत जमा करें', loadingComplaints: 'शिकायतें लोड हो रही हैं...',
  assigned: 'सौंपी गई', inProgress: 'प्रगति में', complaint: 'शिकायत', trackingNo: 'ट्रैकिंग नंबर', type: 'प्रकार',
  status: 'स्थिति', agent: 'अधिकारी', created: 'बनाई गई', noComplaints: 'कोई शिकायत नहीं मिली।', unassigned: 'अभी नहीं सौंपी गई',
  userDashboardCopy: 'शिकायत दर्ज करें, प्रमाण जोड़ें और अपना शिकायत इतिहास देखें।',
  agentDashboardCopy: 'सौंपी गई शिकायतें देखें, स्थिति अपडेट करें और कार्य इतिहास देखें।',
  complaintSubmitted: 'शिकायत जमा हुई। ट्रैकिंग नंबर:', loginSuccess: 'लॉगिन सफल रहा',
  registrationFailed: 'पंजीकरण विफल रहा', loginFailed: 'लॉगिन विफल रहा', complaintNotFound: 'शिकायत नहीं मिली',
  backDashboard: 'डैशबोर्ड पर वापस जाएं', complaintDetails: 'शिकायत विवरण', statusTimeline: 'स्थिति समयरेखा',
  cancelComplaint: 'शिकायत रद्द करें', reopenComplaint: 'शिकायत फिर खोलें', archiveComplaint: 'शिकायत संग्रहित करें',
  statusUpdate: 'अधिकारी/प्रशासक स्थिति अपडेट', note: 'टिप्पणी', resolutionDetails: 'समाधान विवरण',
  resolutionImages: 'समाधान चित्र', updateStatus: 'स्थिति अपडेट करें', comments: 'टिप्पणियां', addComment: 'टिप्पणी जोड़ें',
  comment: 'टिप्पणी करें', officerRating: 'अधिकारी रेटिंग', feedback: 'प्रतिक्रिया', submitRating: 'रेटिंग जमा करें',
  ratingAfterResolution: 'शिकायत के समाधान के बाद रेटिंग उपलब्ध होगी।', notAssigned: 'अभी नहीं सौंपी गई',
  notifications: 'सूचनाएं', profile: 'प्रोफाइल', reports: 'शिकायत रिपोर्ट', noNotifications: 'कोई सूचना नहीं है।',
  name: 'नाम', role: 'भूमिका', notAdded: 'नहीं जोड़ा गया', reportsCopy: 'शिकायत की जानकारी MongoDB से प्रदर्शित होती है।',
  adminCopy: 'शिकायतें, उपयोगकर्ता, अधिकारी, कार्य आवंटन, घोषणाएं और रेटिंग प्रबंधित करें।',
  complaints: 'शिकायतें', users: 'उपयोगकर्ता', agents: 'अधिकारी', assignComplaint: 'शिकायत सौंपें',
  selectComplaint: 'शिकायत चुनें', selectAgent: 'अधिकारी चुनें', assign: 'सौंपें', officerPerformance: 'अधिकारी प्रदर्शन',
  complaintCategories: 'शिकायत श्रेणियां', categoryName: 'श्रेणी का नाम', responsibleDepartment: 'संबंधित विभाग',
  addCategory: 'श्रेणी जोड़ें', delete: 'हटाएं', publish: 'प्रकाशित करें', announcementTitle: 'घोषणा शीर्षक',
  announcementMessage: 'घोषणा संदेश', accounts: 'उपयोगकर्ता और अधिकारी खाते', temporaryPassword: 'अस्थायी पासवर्ड',
  createAccountButton: 'खाता बनाएं', deactivate: 'निष्क्रिय करें'
};

const dictionary = { en, hi };
const hindiValues = {
  PENDING: 'लंबित', ASSIGNED: 'सौंपी गई', IN_PROGRESS: 'प्रगति में', RESOLVED: 'समाधान हुआ',
  NOT_RESOLVED: 'समाधान नहीं हुआ', CANCELLED: 'रद्द', REOPENED: 'फिर से खोली गई',
  Critical: 'अत्यावश्यक', High: 'उच्च', Medium: 'मध्यम', Low: 'कम',
  'Water Leakage': 'पानी का रिसाव', Roads: 'सड़कें', Electricity: 'बिजली', Sanitation: 'स्वच्छता',
  Infrastructure: 'बुनियादी ढांचा', 'IT Support': 'आईटी सहायता', HR: 'मानव संसाधन',
  Security: 'सुरक्षा', Finance: 'वित्त', Healthcare: 'स्वास्थ्य सेवा', Education: 'शिक्षा',
  Police: 'पुलिस', Transport: 'परिवहन', Facilities: 'सुविधाएं', General: 'सामान्य',
  'Portal is open for complaints': 'शिकायतों के लिए पोर्टल खुला है',
  'Users can register, submit complaints with image evidence, and track status updates.':
    'उपयोगकर्ता पंजीकरण कर सकते हैं, चित्र प्रमाण के साथ शिकायत जमा कर सकते हैं और स्थिति अपडेट देख सकते हैं।'
};

export function PreferencesProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('resolveXTheme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('resolveXLanguage') || 'en');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language === 'hi' ? 'hi' : 'en';
    localStorage.setItem('resolveXTheme', theme);
  }, [theme, language]);

  useEffect(() => {
    localStorage.setItem('resolveXLanguage', language);
  }, [language]);

  const value = useMemo(() => {
    const t = dictionary[language] || dictionary.en;
    return {
      theme,
      language,
      t,
      tr: (key) => t[key] || dictionary.en[key] || key,
      translateText: (value) => (language === 'hi' ? hindiValues[value] || value : value),
      toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
      setLanguage
    };
  }, [theme, language]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
