import { MockFirebase } from '../firebase-live.js';
import { createLayout } from '../layout.js';
import { showToast } from '../ui.js';

export function renderGuardDashboard() {
  const content = document.createElement('div');

  content.innerHTML = `
    <div class="grid-cards" style="grid-template-columns: 1fr 1fr;">
      
      <!-- Left: Create Visitor Request -->
      <div class="card animate-slide-up" style="border-top: 4px solid var(--primary);">
        <div class="card-header">
          <div class="card-title"><i class="ph ph-user-plus"></i> New Visitor Request</div>
        </div>
        <form id="visitorForm" class="flex-col" style="gap: 1rem;">
          <div class="flex-row" style="gap: 1rem;">
            <div class="form-group" style="flex: 1; margin: 0;">
              <label class="form-label">Wing</label>
              <select id="vWing" class="form-select" required>
                <option value="A">Wing A</option>
                <option value="B">Wing B</option>
                <option value="C">Wing C</option>
                <option value="D">Wing D</option>
              </select>
            </div>
            <div class="form-group" style="flex: 1; margin: 0;">
              <label class="form-label">Flat Number</label>
              <input type="text" id="vFlat" class="form-input" placeholder="e.g. 101" required>
            </div>
          </div>
          
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Visitor Name</label>
            <input type="text" id="vName" class="form-input" placeholder="Full name" required>
          </div>
          
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Phone Number</label>
            <input type="tel" id="vPhone" class="form-input" placeholder="Phone Number" required>
          </div>

          <div class="form-group" style="margin: 0;">
            <label class="form-label">Reason for Visit</label>
            <input type="text" id="vReason" class="form-input" placeholder="Delivery, Guest, etc." required>
          </div>

          <button type="submit" class="btn btn-primary" style="margin-top: 0.5rem; width: 100%;">
            <i class="ph ph-paper-plane-right"></i> Send Approval Request
          </button>
        </form>
      </div>

      <!-- Right: Recent Visitors Log -->
      <div class="card animate-slide-up delay-1" style="border-top: 4px solid var(--status-info); max-height: 500px; display: flex; flex-direction: column;">
        <div class="card-header" style="align-items: flex-start; flex-direction: column; gap: 0.5rem;">
          <div class="card-title"><i class="ph ph-clock-counter-clockwise"></i> Request Log</div>
          <input type="search" id="searchGuardLogs" class="form-input" placeholder="Search by name, flat, or wing..." style="padding: 0.5rem; font-size: 0.8rem;">
        </div>
        <div id="guardLogList" style="flex: 1; overflow-y: auto;">
            <p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; margin-top: 2rem;">Loading...</p>
        </div>
      </div>
    
    </div>
  `;

  // Submit Logic
  content.querySelector('#visitorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerHTML = '<i class="ph ph-spinner-gap"></i> Sending...';
    btn.disabled = true;

    const flatNumber = content.querySelector('#vFlat').value.trim();
    const wing = content.querySelector('#vWing').value;

    // Check if member exists
    const members = await MockFirebase.getDocs('users', u => u.role === 'member' && u.wing === wing && u.flatNumber === flatNumber);
    if (members.length === 0) {
      showToast(`Error: Member with Flat ${flatNumber} in Wing ${wing} not found!`, 'error');
      btn.innerHTML = '<i class="ph ph-paper-plane-right"></i> Send Approval Request';
      btn.disabled = false;
      return;
    }

    const data = {
      wing: wing,
      flatNumber: flatNumber,
      visitorName: content.querySelector('#vName').value.trim(),
      phone: content.querySelector('#vPhone').value.trim(),
      reason: content.querySelector('#vReason').value.trim(),
      status: 'pending', // pending, approved, rejected
      guardId: window.appState.user.id
    };

    await MockFirebase.addDoc('visitors', data);
    showToast('Visitor approval request sent!', 'success');
    
    e.target.reset();
    btn.innerHTML = '<i class="ph ph-check"></i> Request Sent';
    setTimeout(() => {
      btn.innerHTML = '<i class="ph ph-paper-plane-right"></i> Send Approval Request';
      btn.disabled = false;
    }, 2000);
  });

  // Real-time Log Listener
  let allVisitors = [];
  const logListEl = content.querySelector('#guardLogList');
  
  const renderLogs = (searchQuery = '') => {
    if(allVisitors.length === 0) {
      logListEl.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; margin-top: 2rem;">No logs found.</p>';
      return;
    }

    logListEl.innerHTML = '';
    const filtered = allVisitors.filter(v => 
      v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.flatNumber.includes(searchQuery) ||
      v.wing.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(v => {
      const div = document.createElement('div');
      div.className = 'list-item flex-between';
      
      let statusColor = 'var(--status-pending)';
      if(v.status === 'approved') statusColor = 'var(--status-approve)';
      if(v.status === 'rejected') statusColor = 'var(--status-reject)';

      div.innerHTML = `
        <div class="flex-col">
          <strong style="font-size: 0.95rem;">${v.visitorName} <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);">(${v.reason})</span></strong>
          <span style="font-size: 0.8rem; color: var(--text-muted);">To: Flat ${v.flatNumber}, Wing ${v.wing} • ${new Date(v.timestamp).toLocaleTimeString()}</span>
        </div>
        <span class="badge" style="background: ${statusColor}; color: white; min-width: 80px; text-align: center;">${v.status.toUpperCase()}</span>
      `;
      logListEl.appendChild(div);
    });
  };

  content.querySelector('#searchGuardLogs').addEventListener('keyup', e => renderLogs(e.target.value));

  MockFirebase.onSnapshot('visitors', null, (visitors) => {
    allVisitors = visitors;
    renderLogs(content.querySelector('#searchGuardLogs').value);
  });

  return createLayout('Security Dashboard', content, 'dashboard');
}
