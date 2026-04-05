import { navigate } from './app.js';

export function createLayout(title, contentElement, activeNav) {
  const user = window.appState.user;
  const layout = document.createElement('div');
  layout.className = 'app-layout animate-fade-in';

  // Determine Nav Items based on Role
  let navItems = '';
  if (user.role === 'member') {
    navItems = `
      <a class="nav-item ${activeNav === 'dashboard' ? 'active' : ''}" id="nav-dashboard">
        <i class="ph ph-squares-four"></i> Dashboard
      </a>
      <a class="nav-item ${activeNav === 'complaints' ? 'active' : ''}" id="nav-complaints">
        <i class="ph ph-warning-circle"></i> Complaints
      </a>
    `;
  } else if (user.role === 'guard') {
    navItems = `
      <a class="nav-item active" id="nav-dashboard">
        <i class="ph ph-shield-check"></i> Visitor Entry
      </a>
    `;
  } else if (user.role === 'admin') {
    navItems = `
      <a class="nav-item active" id="nav-dashboard">
        <i class="ph ph-chart-bar"></i> Overview
      </a>
    `;
  }

  layout.innerHTML = `
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2><i class="ph ph-buildings" style="font-size: 1.5rem;"></i> Rahul Society</h2>
      </div>
      <nav class="nav-links">
        ${navItems}
      </nav>
      <button class="btn logout-btn flex-row" id="logoutBtn">
        <i class="ph ph-sign-out"></i> Logout
      </button>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-title">${title}</div>
        
        <div class="flex-row" style="gap: 1.5rem;">
          <button id="themeToggleBtn" class="btn" style="background: transparent; color: var(--text-main); font-size: 1.25rem; padding: 0.5rem;">
             <i class="ph ph-moon" id="themeIcon"></i>
          </button>
          
          <div class="user-profile">
            <div class="user-info" style="text-align: right;">
              <span class="user-name">${user.name}</span>
              <span class="user-flat">${user.role === 'member' ? 'Flat: ' + user.flatNumber : 'Role: ' + user.role.toUpperCase()}</span>
            </div>
            <div class="avatar">${user.name.charAt(0)}</div>
          </div>
        </div>
      </header>

      <!-- Dynamic Page Content -->
      <div class="dashboard-content" id="dashboardContent">
      </div>
    </main>
  `;

  // Insert the page content
  layout.querySelector('#dashboardContent').appendChild(contentElement);

  // Theme Logic
  const themeBtn = layout.querySelector('#themeToggleBtn');
  const themeIcon = layout.querySelector('#themeIcon');
  
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.className = 'ph ph-sun';
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeIcon.className = 'ph ph-moon';
  }

  themeBtn.addEventListener('click', () => {
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      themeIcon.className = 'ph ph-moon';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      themeIcon.className = 'ph ph-sun';
    }
  });

  // Logout Logic
  layout.querySelector('#logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('mockSession');
    window.appState.user = null;
    navigate('login');
  });

  return layout;
}
