import React, { createContext, useContext, useState, useEffect } from 'react';
import { useData } from './DataContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { db } = useData();
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('gdi_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
          setCurrentUser(user);
          localStorage.setItem('gdi_user', JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('Email ou mot de passe incorrect.'));
        }
      }, 500);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gdi_user');
  };

  const can = (action) => {
    if (!currentUser) return false;
    const perms = {
      admin:   ['manage_students','manage_teachers','manage_modules','manage_rooms','manage_filieres','manage_schedule','manage_grades','manage_announcements','view_all'],
      teacher: ['view_students','manage_absences','manage_grades','view_schedule','create_announcement','view_modules'],
      student: ['view_own_profile','view_own_grades','view_own_absences','view_schedule','view_announcements','view_modules','submit_justification'],
    };
    return (perms[currentUser.role] || []).includes(action) || (perms[currentUser.role] || []).includes('view_all');
  };

  const isAdmin = () => currentUser?.role === 'admin';
  const isTeacher = () => currentUser?.role === 'teacher';
  const isStudent = () => currentUser?.role === 'student';

  const value = {
    currentUser,
    login,
    logout,
    can,
    isAdmin,
    isTeacher,
    isStudent
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
