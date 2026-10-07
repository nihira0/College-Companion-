import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { DynamicBackground } from './components/DynamicBackground';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Omnibar } from './components/Omnibar';
import { ToastContainer } from './components/ToastContainer';
import { FloatingSageDrawer } from './components/FloatingSageDrawer';
import { RoleRoute } from './components/RoleRoute';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Assignments } from './pages/Assignments';
import { Attendance } from './pages/Attendance';
import { Marks } from './pages/Marks';
import { Timetable } from './pages/Timetable';
import { Notices } from './pages/Notices';
import { Notes } from './pages/Notes';
import { Pomodoro } from './pages/Pomodoro';
import { SageAI } from './pages/SageAI';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { StudentFees } from './pages/StudentFees';
import { Reports } from './pages/Reports';
import { FacultyClasses } from './pages/FacultyClasses';
import { Settings } from './pages/Settings';

const Layout = ({ children }) => {
  const { user, loading } = useAuth();
  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-poppins text-xs font-semibold">
          <span className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          Loading College Companion...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-slate-100 font-inter">
      {/* Dynamic Animated Nature Landscape Background */}
      <DynamicBackground />

      {/* Floating Glass Sidebar */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Glass Navigation Header */}
      <Navbar
        onOpenOmnibar={() => setIsOmnibarOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Command Palette / Omnibar Modal */}
      <Omnibar isOpen={isOmnibarOpen} onClose={() => setIsOmnibarOpen(false)} />

      {/* Floating Notifications */}
      <ToastContainer />

      {/* Mobile Floating Sage AI Assistant Drawer (< 768px) */}
      <FloatingSageDrawer />

      {/* Main Content View Container */}
      <main className="px-3 sm:px-4 md:pl-72 md:pr-5 pt-20 sm:pt-24 md:pt-28 pb-6 md:pb-10 min-h-screen relative z-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/" element={<Layout><Dashboard /></Layout>} />
              <Route path="/classes" element={<Layout><FacultyClasses /></Layout>} />
              <Route path="/assignments" element={<Layout><Assignments /></Layout>} />
              <Route path="/attendance" element={<Layout><Attendance /></Layout>} />
              <Route path="/marks" element={<Layout><Marks /></Layout>} />
              <Route path="/timetable" element={<Layout><Timetable /></Layout>} />
              <Route path="/notices" element={<Layout><Notices /></Layout>} />
              <Route path="/notes" element={<Layout><Notes /></Layout>} />
              <Route path="/fees" element={<Layout><StudentFees /></Layout>} />
              <Route path="/pomodoro" element={<Layout><Pomodoro /></Layout>} />
              <Route path="/sage" element={<Layout><SageAI /></Layout>} />
              <Route path="/settings" element={<Layout><Settings /></Layout>} />

              {/* Role Protected Routes */}
              <Route 
                path="/reports" 
                element={
                  <Layout>
                    <RoleRoute allowedRoles={['faculty', 'admin']}>
                      <Reports />
                    </RoleRoute>
                  </Layout>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <Layout>
                    <RoleRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </RoleRoute>
                  </Layout>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <Layout>
                    <RoleRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </RoleRoute>
                  </Layout>
                } 
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
