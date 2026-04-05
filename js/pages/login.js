import { MockFirebase } from '../firebase-live.js';
import { navigate } from '../app.js';

export function renderLogin() {
  const container = document.createElement('div');
  container.className = 'login-wrapper animate-fade-in';

  container.innerHTML = `
    <div class="login-card">
      <div class="login-header">
        <h1>Rahul Downtown Society</h1>
        <p>Login to your portal</p>
      </div>

      <div class="role-selector" id="roleTabs">
        <div class="role-tab active" data-role="member">Member</div>
        <div class="role-tab" data-role="guard">Security</div>
        <div class="role-tab" data-role="admin">Admin</div>
      </div>

      <form id="loginForm">
        <div id="dynamicInputs">
          <!-- Member specific inputs by default -->
          <div class="form-group">
            <label class="form-label">Flat Number / ID</label>
            <input type="text" id="loginId" class="form-input" placeholder="e.g. A-101" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" id="loginPassword" class="form-input" placeholder="Enter password" required>
        </div>

        <button type="submit" class="btn btn-primary" style="width:100%; margin-top: 1rem; padding: 0.8rem;">
          Secure Login
        </button>

        <div style="margin-top: 1.5rem; text-align: center; display: flex; justify-content: space-between; font-size: 0.85rem;">
          <a href="#" style="color: var(--primary); text-decoration: none;">Forgot Password?</a>
          <a href="#" style="color: var(--text-muted); text-decoration: none;">Help Center</a>
        </div>
      </form>
      
      <div id="loginError" style="color: var(--status-reject); font-size: 0.875rem; text-align: center; margin-top: 1rem; display: none;">
        Invalid credentials or role mismatch.
      </div>
    </div>
  `;

  // Logic
  let currentRole = 'member';
  const roleTabs = container.querySelectorAll('.role-tab');
  const loginIdInput = container.querySelector('#loginId');

  roleTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      roleTabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      currentRole = e.target.getAttribute('data-role');
      
      if(currentRole === 'member') {
        loginIdInput.placeholder = 'e.g. A-101';
      } else if (currentRole === 'guard') {
        loginIdInput.placeholder = 'Guard ID (e.g. guard)';
      } else {
        loginIdInput.placeholder = 'Admin ID (e.g. admin)';
      }
    });
  });

  const form = container.querySelector('#loginForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = loginIdInput.value.trim();
    // In real app, verify password. Here simulate by checking ID & Role.
    
    // Default Mock Passwords are anything for now, we just check existence in MockDB
    try {
      const users = await MockFirebase.getDocs('users', null); // get all users
      
      let user;
      if (currentRole === 'member' || currentRole === 'guard' || currentRole === 'admin') {
        const inputId = id.toUpperCase();
        user = users.find(u => u.role === currentRole && u.id.toUpperCase() === inputId);
      }

      if (user && user.password === container.querySelector('#loginPassword').value.trim()) {
        // Success
        window.appState.user = user;
        localStorage.setItem('mockSession', JSON.stringify(user));
        navigate(user.role); 
      } else {
        // Error
        const err = container.querySelector('#loginError');
        err.style.display = 'block';
        if (users.length === 0) {
           alert("CRITICAL ERROR: The users collection in Firebase is completely empty! The seeder function must have failed to run.");
        }
      }
    } catch (error) {
      alert("Firebase Connection Error: " + error.message);
    }
  });

  return container;
}
