import { MockFirebase } from '../firebase-live.js';
import { createLayout } from '../layout.js';
import { showToast } from '../ui.js';

export function renderMemberDashboard() {
  const user = window.appState.user;
  const content = document.createElement('div');

  content.innerHTML = `
    <div class="grid-cards">
      <!-- Welcome Card -->
      <div class="card animate-slide-up" style="grid-column: 1 / -1; background: linear-gradient(135deg, var(--primary) 0%, #312e81 100%); color: white;">
        <h2>Welcome back, ${user.name}!</h2>
        <p style="opacity: 0.9; margin-top: 0.5rem;">Here is your dashboard for Flat ${user.flatNumber}, Wing ${user.wing}.</p>
      </div>

      <!-- Visitor Approvals (Real-time) -->
      <div class="card animate-slide-up delay-1" style="border-top: 4px solid var(--status-info);">
        <div class="card-header">
          <div class="card-title"><i class="ph ph-users"></i> Visitor Requests</div>
          <span class="badge bg-blue" id="visitorCount">0</span>
        </div>
        <div id="visitorList" style="min-height: 150px;">
          <p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; margin-top: 2rem;">No pending visitors</p>
        </div>
      </div>

      <!-- Outstanding Bills -->
      <div class="card animate-slide-up delay-2" style="border-top: 4px solid var(--status-reject);">
        <div class="card-header">
          <div class="card-title"><i class="ph ph-receipt"></i> Pending Bills</div>
        </div>
        <div id="billsList" style="min-height: 150px;">
          <p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; margin-top: 2rem;">No pending bills</p>
        </div>
      </div>
      
      <!-- Complaint System -->
       <div class="card animate-slide-up delay-3" style="grid-column: 1 / -1; border-top: 4px solid var(--status-pending);">
        <div class="card-header">
          <div class="card-title"><i class="ph ph-warning-circle"></i> Submit a Complaint</div>
        </div>
        <form id="complaintForm" class="flex-col" style="gap: 1rem;">
          <textarea id="complaintText" class="form-input" rows="3" placeholder="Describe your issue here..." required></textarea>
          <button type="submit" class="btn btn-primary" style="align-self: flex-start;">Submit Complaint</button>
        </form>
        
        <h4 style="margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">Recent Complaints</h4>
        <div id="complaintsList"></div>
      </div>
    </div>
  `;

  // --- Logic for Real-time Visitors ---
  const visitorListEl = content.querySelector('#visitorList');
  const visitorCountEl = content.querySelector('#visitorCount');
  let prevVal = -1;
  
  // Real-time listener
  MockFirebase.onSnapshot('visitors', 
    (v) => v.flatNumber === user.flatNumber && v.status === 'pending', 
    (visitors) => {
      visitorCountEl.innerText = visitors.length;
      
      if (prevVal !== -1 && visitors.length > prevVal) {
        showToast('New Visitor Request Arrived!', 'info');
      }
      prevVal = visitors.length;

      if (visitors.length === 0) {
        visitorListEl.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; margin-top: 2rem;">No pending visitors</p>';
        return;
      }

      visitorListEl.innerHTML = '';
      visitors.forEach(v => {
        const div = document.createElement('div');
        div.className = 'list-item flex-col';
        div.innerHTML = `
          <div class="flex-between">
            <strong>${v.visitorName}</strong>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${new Date(v.timestamp).toLocaleTimeString()}</span>
          </div>
          <p style="font-size: 0.85rem; margin: 0.25rem 0;">Reason: ${v.reason}</p>
          <p style="font-size: 0.85rem; margin-bottom: 0.75rem;"><i class="ph ph-phone"></i> ${v.phone}</p>
          <div class="flex-row" style="gap: 0.5rem;">
            <button class="btn btn-approve btn-action" data-id="${v.id}" data-action="approved"><i class="ph ph-check"></i> Approve</button>
            <button class="btn btn-reject btn-action" data-id="${v.id}" data-action="rejected"><i class="ph ph-x"></i> Reject</button>
          </div>
        `;
        visitorListEl.appendChild(div);
      });

      // Attach actions
      visitorListEl.querySelectorAll('.btn-action').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const action = e.currentTarget.getAttribute('data-action');
          await MockFirebase.updateDoc('visitors', id, { status: action });
        });
      });
  });

  // --- Logic for Bills ---
  const billsListEl = content.querySelector('#billsList');
  MockFirebase.getDocs('bills', (b) => b.targetId === user.id && b.status === 'pending')
    .then(bills => {
      if (bills.length > 0) {
        billsListEl.innerHTML = '';
        bills.forEach(b => {
          const div = document.createElement('div');
          div.className = 'list-item flex-between';
          div.innerHTML = `
            <div>
              <strong>₹${b.amount}</strong>
              <p style="font-size: 0.8rem; color: var(--text-muted);">${b.description} (Due: ${b.dueDate})</p>
            </div>
            <button class="btn btn-info" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Pay</button>
          `;
          billsListEl.appendChild(div);
        });
      }
    });

  // --- Logic for Complaints ---
  const complaintsListEl = content.querySelector('#complaintsList');
  
  function renderComplaints() {
    MockFirebase.getDocs('complaints', (c) => c.memberId === user.id)
      .then(complaints => {
        if(complaints.length === 0) {
          complaintsListEl.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No past complaints.</p>';
          return;
        }
        complaintsListEl.innerHTML = '';
        // Sort descending
        complaints.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(c => {
          const div = document.createElement('div');
          div.className = 'list-item flex-between';
          let statusColor = c.status === 'open' ? 'var(--status-reject)' : (c.status === 'resolved' ? 'var(--status-approve)' : 'var(--status-pending)');
          div.innerHTML = `
            <div>
              <p style="font-size: 0.9rem;">${c.text}</p>
              <p style="font-size: 0.75rem; color: var(--text-muted);">ID: ${c.id.substring(0,6).toUpperCase()} • ${new Date(c.timestamp).toLocaleDateString()}</p>
            </div>
            <span class="badge" style="background: ${statusColor}; color: white;">${c.status.toUpperCase()}</span>
          `;
          complaintsListEl.appendChild(div);
        });
      });
  }

  // Initial load
  renderComplaints();

  // Submit Complaint
  content.querySelector('#complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const textEl = content.querySelector('#complaintText');
    const text = textEl.value.trim();
    if(text) {
      await MockFirebase.addDoc('complaints', {
        memberId: user.id,
        flatNumber: user.flatNumber,
        text: text,
        status: 'open'
      });
      textEl.value = '';
      renderComplaints();
      showToast('Complaint submitted successfully', 'success');
    }
  });

  // Handle Complaints Modal
  document.addEventListener('showComplaintsModal', () => {
    const cModal = document.createElement('div');
    cModal.className = 'modal-overlay active';
    cModal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <button class="modal-close">&times;</button>
        <h2 style="margin-bottom: 1.5rem;"><i class="ph ph-warning-circle"></i> My Complaints</h2>
        <div id="modalComplaintsList">Loading...</div>
      </div>
    `;
    document.body.appendChild(cModal);

    const listEl = cModal.querySelector('#modalComplaintsList');
    MockFirebase.getDocs('complaints', (c) => c.memberId === user.id)
      .then(complaints => {
        if(complaints.length === 0) {
          listEl.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No past complaints.</p>';
          return;
        }
        listEl.innerHTML = '';
        complaints.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(c => {
          const div = document.createElement('div');
          div.className = 'list-item flex-between';
          let statusColor = c.status === 'open' ? 'var(--status-reject)' : (c.status === 'resolved' ? 'var(--status-approve)' : 'var(--status-pending)');
          div.innerHTML = `
            <div>
              <p style="font-size: 0.95rem;">${c.text}</p>
              <p style="font-size: 0.75rem; color: var(--text-muted);">ID: ${c.id.substring(0,6).toUpperCase()} • ${new Date(c.timestamp).toLocaleDateString()}</p>
            </div>
            <span class="badge" style="background: ${statusColor}; color: white;">${c.status.toUpperCase()}</span>
          `;
          listEl.appendChild(div);
        });
      });

    cModal.querySelector('.modal-close').addEventListener('click', () => cModal.remove());
    cModal.addEventListener('click', (e) => { if(e.target === cModal) cModal.remove() });
  });

  return createLayout('Member Dashboard', content, 'dashboard');
}
