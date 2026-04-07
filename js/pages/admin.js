import { MockFirebase } from '../firebase-live.js';
import { createLayout } from '../layout.js';
import { showToast } from '../ui.js';

export function renderAdminDashboard() {
  const content = document.createElement('div');

  content.innerHTML = `
    <!-- Top Stats -->
    <div class="grid-cards" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 2rem;">
      <div class="card stat-card animate-slide-up" style="border-left: 4px solid var(--primary);">
        <div class="stat-icon bg-blue" style="background: rgba(79, 70, 229, 0.1); color: var(--primary);">
          <i class="ph ph-users"></i>
        </div>
        <div class="stat-info">
          <p>Total Visitors</p>
          <h3 id="statVisitors">0</h3>
        </div>
      </div>
      <div class="card stat-card animate-slide-up delay-1" style="border-left: 4px solid var(--status-reject);">
        <div class="stat-icon" style="background: rgba(239, 68, 68, 0.1); color: var(--status-reject);">
          <i class="ph ph-warning-circle"></i>
        </div>
        <div class="stat-info">
          <p>Open Complaints</p>
          <h3 id="statComplaints">0</h3>
        </div>
      </div>
      <div class="card stat-card animate-slide-up delay-2" style="border-left: 4px solid var(--status-approve);">
        <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--status-approve);">
          <i class="ph ph-user-gear"></i>
        </div>
        <div class="stat-info">
          <p>Total Members</p>
          <h3 id="statMembers">0</h3>
        </div>
      </div>
      <div class="card stat-card animate-slide-up delay-3" style="border-left: 4px solid #f59e0b;">
        <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
          <i class="ph ph-shield-check"></i>
        </div>
        <div class="stat-info">
          <p>Total Guards</p>
          <h3 id="statGuards">0</h3>
        </div>
      </div>
    </div>

    <!-- Manager Section Navigation -->
    <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
      <button class="btn btn-primary" id="viewComplaintsBtn">Complaints & Visitors</button>
      <button class="btn" style="background: white; border: 1px solid var(--border-color); color: var(--text-main);" id="viewUsersBtn">User Management</button>
      <button class="btn" style="background: white; border: 1px solid var(--border-color); color: var(--text-main);" id="viewBillsBtn">Billing System</button>
    </div>

    <!-- Complaints & Visitors View -->
    <div id="view1" class="grid-cards" style="grid-template-columns: 1fr 1fr;">
      <!-- Complaints Manager -->
      <div class="card animate-slide-up delay-4" style="border-top: 4px solid var(--status-reject); max-height: 500px; overflow-y: auto;">
        <div class="card-header">
          <div class="card-title"><i class="ph ph-warning-circle"></i> Global Complaints</div>
        </div>
        <div id="adminComplaintsList"></div>
      </div>

      <!-- Visitor Logs -->
      <div class="card animate-slide-up delay-5" style="border-top: 4px solid var(--primary); max-height: 500px; display: flex; flex-direction: column;">
        <div class="card-header" style="align-items: flex-start; flex-direction: column; gap: 0.5rem;">
          <div class="card-title"><i class="ph ph-address-book"></i> All Visitors</div>
          <input type="search" id="searchVisitors" class="form-input" placeholder="Search visitors by name or flat..." style="padding: 0.5rem; font-size: 0.8rem;">
        </div>
        <div id="adminVisitorsList" style="flex: 1; overflow-y: auto;"></div>
      </div>
    </div>

    <!-- User Management View -->
    <div id="view2" style="display: none; grid-template-columns: 3fr 2fr; gap: 1.5rem;" class="grid-cards">
      <!-- User List -->
      <div class="card" style="border-top: 4px solid var(--status-approve); max-height: 500px; display: flex; flex-direction: column;">
        <div class="card-header" style="align-items: flex-start; flex-direction: column; gap: 0.5rem;">
          <div class="card-title"><i class="ph ph-users-three"></i> User Directory</div>
          <input type="search" id="searchUsers" class="form-input" placeholder="Search users by name or ID..." style="padding: 0.5rem; font-size: 0.8rem;">
        </div>
        <div id="adminUsersList" style="flex: 1; overflow-y: auto;"></div>
      </div>

      <!-- Add/Edit User Form -->
      <div class="card" style="border-top: 4px solid #8b5cf6;">
        <div class="card-header">
          <div class="card-title" id="userFormTitle"><i class="ph ph-user-plus"></i> Add New User</div>
        </div>
        <form id="userForm" class="flex-col" style="gap: 1rem;">
          <input type="hidden" id="uDbId"> 
          
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Role</label>
            <select id="uRole" class="form-select" required>
              <option value="member">Member</option>
              <option value="guard">Security Guard</option>
            </select>
          </div>
          
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Full Name</label>
            <input type="text" id="uName" class="form-input" placeholder="e.g. Rahul Sharma" required>
          </div>
          
          <div class="form-group" style="margin: 0;">
             <label class="form-label">Login ID / Flat Number</label>
             <input type="text" id="uId" class="form-input" placeholder="e.g. 101 or guard2" required>
          </div>

          <div class="form-group" style="margin: 0;">
            <label class="form-label">Password</label>
            <input type="text" id="uPassword" class="form-input" placeholder="e.g. user123" required title="At least one character required.">
            <small style="color: var(--text-muted); font-size: 0.75rem; margin-top: 0.2rem; display: block;">Letters, numbers and basic symbols are allowed.</small>
          </div>

          <div id="memberSpecificFields" style="display: block;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label">Wing</label>
              <select id="uWing" class="form-select">
                <option value="A">Wing A</option>
                <option value="B">Wing B</option>
                <option value="C">Wing C</option>
                <option value="D">Wing D</option>
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label">Phone Number</label>
              <input type="tel" id="uPhone" class="form-input" placeholder="Phone Number">
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
            <button type="submit" class="btn btn-primary" style="flex: 1;" id="uSubmitBtn">Create User</button>
            <button type="button" class="btn" style="background: #e2e8f0; color: var(--text-main);" id="uCancelBtn" style="display:none;">Cancel Edit</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Bills View -->
    <div id="view3" style="display: none; grid-template-columns: 2fr 3fr; gap: 1.5rem;" class="grid-cards">
       <div class="card" style="border-top: 4px solid var(--status-pending);">
        <div class="card-header">
          <div class="card-title"><i class="ph ph-receipt"></i> Generate New Bill</div>
        </div>
        <form id="billForm" class="flex-col" style="gap: 1rem;">
          <div class="flex-row" style="gap: 1rem;">
            <div class="form-group" style="flex: 1; margin: 0;">
              <label class="form-label">Wing</label>
              <select id="bWing" class="form-select" required>
                <option value="A">Wing A</option>
                <option value="B">Wing B</option>
                <option value="C">Wing C</option>
                <option value="D">Wing D</option>
              </select>
            </div>
            <div class="form-group" style="flex: 1; margin: 0;">
              <label class="form-label">Target Flat Number</label>
              <input type="text" id="bFlat" class="form-input" placeholder="e.g. 101" required>
            </div>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Amount (₹)</label>
            <input type="number" id="bAmount" class="form-input" required>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Description</label>
            <input type="text" id="bDesc" class="form-input" placeholder="e.g. Maintenance May 2026" required>
          </div>
          <div class="form-group" style="margin: 0;">
             <label class="form-label">Due Date</label>
             <input type="date" id="bDate" class="form-input" required>
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top: 0.5rem;">Dispatch Bill</button>
        </form>
      </div>

      <div class="card" style="max-height: 500px; display: flex; flex-direction: column;">
        <div class="card-header">
          <div class="card-title"><i class="ph ph-file-text"></i> Global Outstanding Bills</div>
        </div>
        <div id="adminBillsList" style="flex: 1; overflow-y: auto;"></div>
      </div>
    </div>
  `;

  // Tabs Logic
  const btns = [content.querySelector('#viewComplaintsBtn'), content.querySelector('#viewUsersBtn'), content.querySelector('#viewBillsBtn')];
  const views = [content.querySelector('#view1'), content.querySelector('#view2'), content.querySelector('#view3')];

  btns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      views.forEach((v, vidx) => v.style.display = (vidx === idx) ? 'grid' : 'none');
      btns.forEach((b, bidx) => {
        if(bidx === idx) {
          b.className = 'btn btn-primary'; b.style = '';
        } else {
          b.className = 'btn'; b.style = 'background: var(--card-bg); border: 1px solid var(--border-color); color: var(--text-main);';
        }
      });
    });
  });

  // User Form UI toggles
  const userForm = content.querySelector('#userForm');
  const memberSpecific = content.querySelector('#memberSpecificFields');
  content.querySelector('#uRole').addEventListener('change', (e) => {
    memberSpecific.style.display = e.target.value === 'member' ? 'block' : 'none';
  });

  // DATA STATE
  let allVisitors = [];
  let allUsers = [];

  // --- Real-time Listeners ---
  MockFirebase.onSnapshot('users', u => u.role === 'member', m => content.querySelector('#statMembers').innerText = m.length);
  MockFirebase.onSnapshot('users', u => u.role === 'guard', g => content.querySelector('#statGuards').innerText = g.length);
  
  // Visitors
  const renderVisitors = (searchQuery = '') => {
    const listEl = content.querySelector('#adminVisitorsList');
    listEl.innerHTML = '';
    const filtered = allVisitors.filter(v => 
      v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.flatNumber.includes(searchQuery)
    );

    filtered.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(v => {
      const div = document.createElement('div');
      div.className = 'list-item flex-col';
      let statusColor = v.status === 'pending' ? 'var(--status-pending)' : (v.status === 'approved' ? 'var(--status-approve)' : 'var(--status-reject)');
      div.innerHTML = `
        <div class="flex-between">
          <strong>${v.visitorName}</strong>
          <span class="badge" style="background: ${statusColor}; color: white; font-size: 0.65rem;">${v.status}</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted);">To: Flat ${v.flatNumber} (${v.wing}) • ${new Date(v.timestamp).toLocaleDateString()} ${new Date(v.timestamp).toLocaleTimeString()}</p>
      `;
      listEl.appendChild(div);
    });
  };

  content.querySelector('#searchVisitors').addEventListener('keyup', e => renderVisitors(e.target.value));
  MockFirebase.onSnapshot('visitors', null, visitors => {
    content.querySelector('#statVisitors').innerText = visitors.length;
    allVisitors = visitors;
    renderVisitors(content.querySelector('#searchVisitors').value);
  });

  // Complaints
  let previousComplaintCount = -1;
  MockFirebase.onSnapshot('complaints', null, complaints => {
    const openCount = complaints.filter(c => c.status === 'open').length;
    content.querySelector('#statComplaints').innerText = openCount;

    if (previousComplaintCount !== -1 && complaints.length > previousComplaintCount) showToast('New complaint submitted!', 'error');
    previousComplaintCount = complaints.length;

    const listEl = content.querySelector('#adminComplaintsList');
    listEl.innerHTML = '';
    complaints.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(c => {
      const div = document.createElement('div');
      div.className = 'list-item flex-col';
      let statColor = c.status === 'open' ? 'var(--status-reject)' : 'var(--status-approve)';
      div.innerHTML = `
        <div class="flex-between">
          <strong style="font-size: 0.9rem;">Flat ${c.flatNumber || c.memberId}</strong>
          <span class="badge" style="background: ${statColor}; color: white; font-size: 0.65rem;">${c.status.toUpperCase()}</span>
        </div>
        <p style="font-size: 0.85rem; margin: 0.5rem 0;">"${c.text}"</p>
        <div class="flex-between">
          <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(c.timestamp).toLocaleDateString()}</span>
          ${c.status === 'open' ? `<button class="btn btn-approve btn-resolve-comp" data-id="${c.id}" style="padding: 0.2rem 0.6rem; font-size: 0.75rem;">Mark Resolved</button>` : ''}
        </div>
      `;
      listEl.appendChild(div);
    });

    listEl.querySelectorAll('.btn-resolve-comp').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        await MockFirebase.updateDoc('complaints', id, { status: 'resolved' });
        showToast('Complaint resolved', 'success');
      });
    });
  });

  // Users Directory
  const renderUsers = (searchQuery = '') => {
    const listEl = content.querySelector('#adminUsersList');
    listEl.innerHTML = '';
    
    const filtered = allUsers.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (u.flatNumber && u.flatNumber.includes(searchQuery)) ||
      u.id.includes(searchQuery)
    );

    filtered.forEach(u => {
      const div = document.createElement('div');
      div.className = 'list-item flex-between';
      let roleColor = u.role === 'member' ? 'var(--status-info)' : 'var(--primary)';
      const uDataStr = encodeURIComponent(JSON.stringify(u));
      let extraInfo = u.role === 'member' ? `Flat: ${u.flatNumber || u.id} (Wing ${u.wing||'-'})` : `Guard ID: ${u.id}`;
      
      div.innerHTML = `
        <div class="flex-col">
          <strong style="font-size: 0.95rem;">${u.name} <span class="badge" style="background: ${roleColor}; color: white; font-size: 0.6rem; margin-left: 0.25rem;">${u.role.toUpperCase()}</span></strong>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${extraInfo}</span>
        </div>
        <div class="flex-row" style="gap: 0.5rem;">
            <button class="btn btn-edit-user" data-user="${uDataStr}" style="padding: 0.4rem; background: var(--border-color); color: var(--text-main);"><i class="ph ph-pencil-simple"></i></button>
            <button class="btn btn-del-user" data-id="${u.id}" style="padding: 0.4rem; background: var(--status-reject); color: white;"><i class="ph ph-trash"></i></button>
        </div>
      `;
      listEl.appendChild(div);
    });

    listEl.querySelectorAll('.btn-edit-user').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const u = JSON.parse(decodeURIComponent(e.currentTarget.getAttribute('data-user')));
        content.querySelector('#uDbId').value = u.id; 
        content.querySelector('#uRole').value = u.role;
        content.querySelector('#uName').value = u.name;
        content.querySelector('#uId').value = u.role === 'member' ? (u.flatNumber || u.id) : u.id;
        content.querySelector('#uPassword').value = u.password || '';
        if(u.role === 'member') {
          memberSpecific.style.display = 'block';
          content.querySelector('#uWing').value = u.wing || '';
          content.querySelector('#uPhone').value = u.phone || '';
        } else {
          memberSpecific.style.display = 'none';
        }
        content.querySelector('#userFormTitle').innerHTML = '<i class="ph ph-pencil"></i> Edit User';
        content.querySelector('#uSubmitBtn').innerText = 'Save Changes';
        content.querySelector('#uCancelBtn').style.display = 'block';
      });
    });

    listEl.querySelectorAll('.btn-del-user').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if(confirm('Delete user permanently?')) {
          await MockFirebase.deleteDoc('users', e.currentTarget.getAttribute('data-id'));
          showToast('User deleted', 'info');
        }
      });
    });
  };

  content.querySelector('#searchUsers').addEventListener('keyup', e => renderUsers(e.target.value));
  MockFirebase.onSnapshot('users', u => u.role !== 'admin', users => {
    allUsers = users;
    renderUsers(content.querySelector('#searchUsers').value);
  });

  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dbId = content.querySelector('#uDbId').value;
    const role = content.querySelector('#uRole').value;
    let uIdRaw = content.querySelector('#uId').value.trim();
    let uPhoneRaw = content.querySelector('#uPhone').value.trim();
    
    // Validate Phone Uniqueness
    if ((role === 'member' || role === 'guard') && uPhoneRaw) {
      const phoneExists = allUsers.find(u => u.phone === uPhoneRaw && u.id !== dbId);
      if (phoneExists) {
        return alert("Error: That phone number is already registered to another user!");
      }
    }

    let userData = { 
      role, 
      name: content.querySelector('#uName').value, 
      id: uIdRaw,
      password: content.querySelector('#uPassword').value 
    };

    if (role === 'member') {
      const flatNum = parseInt(uIdRaw, 10);
      if (isNaN(flatNum)) {
        return alert("Error: Flat number must be a number!");
      }
      
      // Range check e.g. 101-110 up to 1201-1210
      const floor = Math.floor(flatNum / 100);
      const remains = flatNum % 100;
      if (floor < 1 || floor > 12 || remains < 1 || remains > 10) {
        return alert("Error: Flat number must be between X01 and X10 on floors 1 through 12!");
      }

      userData.flatNumber = uIdRaw;
      userData.wing = content.querySelector('#uWing').value;
      userData.id = `${userData.wing}-${userData.flatNumber}`;
      userData.phone = uPhoneRaw;
      
      // Validate Flat Uniqueness
      const flatExists = allUsers.find(u => u.id === userData.id && u.id !== dbId);
      if (flatExists) {
        return alert(`Error: Wing ${userData.wing} Flat ${userData.flatNumber} already exists!`);
      }
    } else if (role === 'guard') {
      userData.phone = uPhoneRaw;
    }

    try {
      if (dbId) {
        // Handle ID changes: if user changed flat/wing, we need to handle the underlying ID change correctly
        await MockFirebase.updateDoc('users', dbId, userData);
        showToast('User updated successfully', 'success');
      } else {
        await MockFirebase.addDoc('users', userData);
        showToast('User created successfully', 'success');
      }
      content.querySelector('#uCancelBtn').click();
    } catch (err) {
      alert("Error saving user: " + err.message);
    }
  });

  content.querySelector('#uCancelBtn').addEventListener('click', () => {
    userForm.reset();
    content.querySelector('#uDbId').value = '';
    content.querySelector('#userFormTitle').innerHTML = '<i class="ph ph-user-plus"></i> Add New User';
    content.querySelector('#uSubmitBtn').innerText = 'Create User';
    content.querySelector('#uRole').value = 'member';
    memberSpecific.style.display = 'block';
    content.querySelector('#uCancelBtn').style.display = 'none';
  });

  // Bills Management
  MockFirebase.onSnapshot('bills', null, bills => {
    const listEl = content.querySelector('#adminBillsList');
    listEl.innerHTML = '';
    bills.sort((a,b) => new Date(b.dueDate) - new Date(a.dueDate)).forEach(b => {
      const div = document.createElement('div');
      div.className = 'list-item flex-between';
      let statusColor = b.status === 'paid' ? 'var(--status-approve)' : 'var(--status-pending)';
      div.innerHTML = `
        <div>
          <strong style="font-size: 0.95rem;">₹${b.amount} <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);">(Flat: ${b.flatNumber})</span></strong>
          <p style="font-size: 0.8rem; color: var(--text-muted);">${b.description} • Due: ${b.dueDate}</p>
        </div>
        <div class="flex-row" style="gap: 0.5rem;">
          <span class="badge" style="background: ${statusColor}; color: white; display: inline-block;">${b.status.toUpperCase()}</span>
          <button class="btn btn-del-bill" data-id="${b.id}" style="padding: 0.3rem 0.5rem; background: var(--status-reject); color: white;"><i class="ph ph-trash"></i></button>
        </div>
      `;
      listEl.appendChild(div);
    });

    listEl.querySelectorAll('.btn-del-bill').forEach(btn => {
      btn.addEventListener('click', async (e) => {
         if(confirm('Cancel bill?')) {
           await MockFirebase.deleteDoc('bills', e.currentTarget.getAttribute('data-id'));
           showToast('Bill removed', 'info');
         }
      });
    });
  });

  content.querySelector('#billForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const wing = content.querySelector('#bWing').value;
    const flatNum = content.querySelector('#bFlat').value.trim();
    const targetId = `${wing}-${flatNum}`;
    
    // Check if flat exists
    const flatExists = allUsers.find(u => u.id === targetId && u.role === 'member');
    if (!flatExists) {
      return alert(`Error: Cannot dispatch bill. Wing ${wing} Flat ${flatNum} does not exist in the system.`);
    }

    await MockFirebase.addDoc('bills', {
      wing: wing,
      flatNumber: flatNum,
      targetId: targetId,
      amount: parseFloat(content.querySelector('#bAmount').value),
      description: content.querySelector('#bDesc').value,
      dueDate: content.querySelector('#bDate').value,
      status: 'pending'
    });
    e.target.reset();
    showToast('Bill dispatched to member!', 'success');
  });

  return createLayout('Admin Subsystem', content, 'dashboard');
}
