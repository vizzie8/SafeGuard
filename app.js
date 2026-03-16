/*  app.js — Main App Controller & State  */

/* ── Global App State ── */
const AppState = {
  get contacts() {
    return JSON.parse(localStorage.getItem('sg_contacts') || '[]');
  },
  set contacts(v) {
    localStorage.setItem('sg_contacts', JSON.stringify(v));
  },
  get settings() {
    return JSON.parse(localStorage.getItem('sg_settings') || JSON.stringify({
      userName:       '',
      codeWord:       'help',
      dbThreshold:    65,
      motionEnabled:  false,
      voiceEnabled:   false,
      powerOffEnabled:false,
    }));
  },
  set settings(v) {
    localStorage.setItem('sg_settings', JSON.stringify(v));
  },
};

/* ── Toast system ── */
const App = (() => {
  function showToast(msg, type = 'success') {
    const icons = { success: '✅', warning: '⚠️', danger: '🆘' };
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-msg">${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 350);
    }, 3500);
  }

  return { showToast };
})();

/* ── Navigation ── */
function navigate(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`screen-${screenId}`).classList.add('active');
  document.getElementById(`nav-${screenId}`).classList.add('active');

  if (screenId === 'home') MapModule.invalidateSize();
  if (screenId === 'contacts') renderContacts();
  if (screenId === 'settings') loadSettings();
}

/* ── Contacts ── */
function renderContacts() {
  const list = document.getElementById('contacts-list');
  const contacts = AppState.contacts;

  if (contacts.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👤</div>
        <p>No emergency contacts yet.<br>Add someone who should receive your Primary SOS.</p>
      </div>`;
    return;
  }

  list.innerHTML = contacts.map((c, i) => `
    <div class="contact-card">
      <div class="contact-avatar">${c.name.charAt(0).toUpperCase()}</div>
      <div class="contact-info">
        <div class="contact-name">${c.name}</div>
        <div class="contact-phone">${c.phone}</div>
      </div>
      ${i === 0 ? '<span class="contact-badge">PRIMARY</span>' : ''}
      <div class="contact-actions">
        <button class="btn-icon" onclick="deleteContact(${i})" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');
}

function deleteContact(idx) {
  const contacts = AppState.contacts;
  contacts.splice(idx, 1);
  AppState.contacts = contacts;
  renderContacts();
  App.showToast('Contact removed', 'warning');
}

function openAddContact() {
  document.getElementById('modal-contact').classList.add('active');
  document.getElementById('input-contact-name').value = '';
  document.getElementById('input-contact-phone').value = '';
}

function closeAddContact() {
  document.getElementById('modal-contact').classList.remove('active');
}

function saveContact() {
  const name  = document.getElementById('input-contact-name').value.trim();
  const phone = document.getElementById('input-contact-phone').value.trim();

  if (!name || !phone) { App.showToast('Enter name and phone number', 'warning'); return; }
  if (!/^\+?[\d\s\-]{7,15}$/.test(phone)) { App.showToast('Enter a valid phone number', 'warning'); return; }

  const contacts = AppState.contacts;
  contacts.push({ name, phone });
  AppState.contacts = contacts;

  closeAddContact();
  renderContacts();
  App.showToast(`${name} added as emergency contact ✅`, 'success');
}

/* ── Settings ── */
function loadSettings() {
  const s = AppState.settings;
  document.getElementById('input-username').value   = s.userName || '';
  document.getElementById('input-codeword').value   = s.codeWord || 'help';
  document.getElementById('input-db').value         = s.dbThreshold || 65;
  document.getElementById('val-db').textContent     = (s.dbThreshold || 65) + ' dB';
  document.getElementById('toggle-voice').checked   = s.voiceEnabled || false;
  document.getElementById('toggle-motion').checked  = s.motionEnabled || false;
  document.getElementById('toggle-poweroff').checked = s.powerOffEnabled || false;
}

function saveSettings() {
  AppState.settings = {
    userName:        document.getElementById('input-username').value.trim(),
    codeWord:        document.getElementById('input-codeword').value.trim() || 'help',
    dbThreshold:     parseInt(document.getElementById('input-db').value) || 65,
    voiceEnabled:    document.getElementById('toggle-voice').checked,
    motionEnabled:   document.getElementById('toggle-motion').checked,
    powerOffEnabled: document.getElementById('toggle-poweroff').checked,
  };
  App.showToast('Settings saved ✅', 'success');
}

function applySensorToggles() {
  const s = AppState.settings;
  if (s.voiceEnabled  && !Sensors.Voice.isActive())    Sensors.Voice.start();
  if (!s.voiceEnabled && Sensors.Voice.isActive())     Sensors.Voice.stop();
  if (s.motionEnabled && !Sensors.Motion.isActive())   Sensors.Motion.start();
  if (!s.motionEnabled && Sensors.Motion.isActive())   Sensors.Motion.stop();
  if (s.powerOffEnabled && !Sensors.PowerOff.isActive()) Sensors.PowerOff.start();
  if (!s.powerOffEnabled && Sensors.PowerOff.isActive()) Sensors.PowerOff.stop();
}

/* ── SOS Secondary countdown cancel ── */
let cancelCountdown = false;

/* ── Bootstrap ── */
window.addEventListener('DOMContentLoaded', () => {
  // Init map
  MapModule.init();

  // Default screen
  navigate('home');

  // dB range live update
  const dbRange = document.getElementById('input-db');
  if (dbRange) {
    dbRange.addEventListener('input', () => {
      document.getElementById('val-db').textContent = dbRange.value + ' dB';
    });
  }

  // Apply persisted sensor state
  applySensorToggles();

  // About toast
  setTimeout(() => {
    const name = AppState.settings.userName;
    App.showToast(name ? `Welcome back, ${name}! 💜` : 'Welcome to SafeGuard 💜 Add your emergency contacts to get started.', 'success');
  }, 800);
});
