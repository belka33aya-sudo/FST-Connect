import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import AccessGuard from '../components/etudiant/AccessGuard';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const EtudiantLayout = () => {
  const { currentUser } = useAuth();
  const { getStudentByUserId } = useData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!currentUser || currentUser.role !== 'student') return null;

  const student = getStudentByUserId(currentUser.id);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <AccessGuard student={student}>
      <div className="dashboard-wrapper">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
        <div className="main-content">
          <Header openSidebar={openSidebar} />
          <main className="page-area fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </AccessGuard>
  );
};

export default EtudiantLayout;
