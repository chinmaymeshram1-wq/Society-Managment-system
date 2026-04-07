import { navigate } from './app.js';
import { MockFirebase } from './firebase-live.js';

export function createLayout(title, contentElement, activeNav) {
  const user = window.appState.user;
  const layout = document.createElement('div');
  layout.className = 'app-layout';

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
    <aside class="sidebar animate-fade-in">
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
    <main class="main-content animate-slide-up">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-title">${title}</div>
        
        <div class="flex-row" style="gap: 1.5rem;">
          <button id="themeToggleBtn" class="btn" style="background: transparent; color: var(--text-main); font-size: 1.25rem; padding: 0.5rem;">
             <i class="ph ph-moon" id="themeIcon"></i>
          </button>
          
          <div class="user-profile" id="profileTrigger" style="cursor: pointer; padding: 0.5rem; border-radius: 12px; transition: var(--transition-bounce);">
            <div class="user-info" style="text-align: right;">
              <span class="user-name">${user.name}</span>
              <span class="user-flat">${user.role === 'member' ? 'Flat: ' + user.flatNumber : 'Role: ' + user.role.toUpperCase()}</span>
            </div>
            <div class="avatar" id="headerAvatar" style="box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4); border: 2px solid white;">${user.photoURL ? `<img src="${user.photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : user.name.charAt(0)}</div>
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

  // Profile Modal Logic
  layout.querySelector('#profileTrigger').addEventListener('click', () => {
    const pModal = document.createElement('div');
    pModal.className = 'modal-overlay active';
    
    let extraHTML = '';
    if(user.role === 'member') {
      extraHTML = `
        <p><strong>Wing:</strong> <span>${user.wing || 'N/A'}</span></p>
        <p><strong>Flat:</strong> <span>${user.flatNumber || 'N/A'}</span></p>
      `;
    } else {
      extraHTML = `<p><strong>Role:</strong> <span>${user.role.toUpperCase()}</span></p>`;
    }

    let photoSection = '';
    if(user.role === 'member') {
      photoSection = `
        <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 1.5rem;">
          <div class="avatar" id="modalAvatar" style="width: 80px; height: 80px; font-size: 2rem; margin-bottom: 0.5rem; position: relative;">
            ${user.photoURL ? `<img src="${user.photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : user.name.charAt(0)}
          </div>
          <label for="photoUpload" class="btn" style="background:#eef2ff; color:var(--primary); font-size:0.75rem; padding:0.4rem 0.8rem; cursor:pointer;">
             <i class="ph ph-camera"></i> Change Photo
          </label>
          <input type="file" id="photoUpload" accept="image/*" style="display:none;">
          <button id="savePhotoBtn" class="btn btn-primary" style="display:none; margin-top: 0.5rem; font-size:0.75rem;"><i class="ph ph-floppy-disk"></i> Save Photo</button>
        </div>
      `;
    }

    pModal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close">&times;</button>
        <h2 style="margin-bottom: 1.5rem; text-align: center;"><i class="ph ph-user-circle"></i> User Profile</h2>
        ${photoSection}
        <div class="modal-profile-info">
          <p><strong>Name:</strong> <span>${user.name}</span></p>
          <p><strong>Login ID:</strong> <span>${user.id}</span></p>
          ${extraHTML}
          <p><strong>Phone:</strong> <span>${user.phone || 'N/A'}</span></p>
        </div>
      </div>
    `;
    document.body.appendChild(pModal);

    if(user.role === 'member') {
      const pUpload = pModal.querySelector('#photoUpload');
      const saveBtn = pModal.querySelector('#savePhotoBtn');
      const mAvatar = pModal.querySelector('#modalAvatar');
      let newPhotoBase64 = null;

      pUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          newPhotoBase64 = event.target.result;
          mAvatar.innerHTML = `<img src="${newPhotoBase64}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
          saveBtn.style.display = 'inline-flex';
        };
        reader.readAsDataURL(file);
      });

      saveBtn.addEventListener('click', async () => {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="ph ph-spinner-gap"></i> Saving...';
        try {
          await MockFirebase.updateDoc('users', user.id, { photoURL: newPhotoBase64 });
          
          user.photoURL = newPhotoBase64;
          localStorage.setItem('mockSession', JSON.stringify(user));
          
          const headerAvatar = document.querySelector('#headerAvatar');
          if(headerAvatar) {
             headerAvatar.innerHTML = `<img src="${newPhotoBase64}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
          }
          saveBtn.style.display = 'none';
        } catch(err) {
          alert('Error saving photo: ' + err.message);
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i class="ph ph-floppy-disk"></i> Save Photo';
        }
      });
    }

    pModal.querySelector('.modal-close').addEventListener('click', () => pModal.remove());
    pModal.addEventListener('click', (e) => { if(e.target === pModal) pModal.remove() });
  });

  // Nav Complaints click
  const navComplaints = layout.querySelector('#nav-complaints');
  if(navComplaints) {
    navComplaints.addEventListener('click', () => {
      document.dispatchEvent(new Event('showComplaintsModal'));
    });
  }

  return layout;
}
