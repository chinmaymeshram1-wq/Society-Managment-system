// Core SPA router and state
import { renderLogin } from './pages/login.js';
import { renderMemberDashboard } from './pages/member.js';
import { renderGuardDashboard } from './pages/guard.js';
import { renderAdminDashboard } from './pages/admin.js';

// Global State
window.appState = {
  user: null, // { id: '...', role: 'member'|'guard'|'admin', name: '...', flat: '...' }
};

export function navigate(path) {
  const app = document.getElementById('app');
  app.innerHTML = ''; // clear

  if (!window.appState.user && path !== 'login') {
    path = 'login';
  }

  // Very simple client-side router
  switch(path) {
    case 'login':
      app.appendChild(renderLogin());
      break;
    case 'member':
      if (window.appState.user?.role !== 'member') return navigate('login');
      app.appendChild(renderMemberDashboard());
      break;
    case 'guard':
      if (window.appState.user?.role !== 'guard') return navigate('login');
      app.appendChild(renderGuardDashboard());
      break;
    case 'admin':
      if (window.appState.user?.role !== 'admin') return navigate('login');
      app.appendChild(renderAdminDashboard());
      break;
    default:
      navigate('login');
  }
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  // Check if we have an active mock session
  const storedUser = localStorage.getItem('mockSession');
  if (storedUser) {
    window.appState.user = JSON.parse(storedUser);
    navigate(window.appState.user.role);
  } else {
    navigate('login');
  }
});
