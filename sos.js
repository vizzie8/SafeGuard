/*  sos.js — SOS Alert Engine (Primary & Secondary)  */

const SOS = (() => {
  let sosActive = false;
  let pendingType = null;

  /* ── Build the SOS message with geolocation ── */
  async function buildMessage(type) {
    let coords = '';
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 })
      );
      const { latitude: lat, longitude: lng } = pos.coords;
      coords = `\nLocation: https://maps.google.com/?q=${lat},${lng}`;
    } catch {
      coords = '\nLocation: unavailable (GPS off)';
    }

    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const name = AppState.settings.userName || 'Someone';
    const triggers = {
      manual:  'pressed the emergency SOS button',
      voice:   'triggered a voice emergency code word',
      motion:  'detected a sudden device throw/impact',
      poweroff:'is turning off their phone (auto-alert)',
    };
    const trigger = triggers[type] || 'activated emergency alert';

    if (pendingType === 'primary') {
      return `🆘 EMERGENCY ALERT!\n${name} has ${trigger} and needs IMMEDIATE HELP!\nTime: ${now}${coords}\n\nThis is an automated SOS from SafeGuard Safety App. Please call or reach them IMMEDIATELY.`;
    } else {
      return `⚠️ EMERGENCY AUTO-ALERT!\n${name} has ${trigger} and may be in DANGER!\nTime: ${now}${coords}\n\nThis automated alert was triggered by SafeGuard Safety App. Please dispatch help immediately.`;
    }
  }

  /* ── Show the SOS Overlay ── */
  async function showOverlay(type, triggerSource = 'manual') {
    if (sosActive) return;
    sosActive = true;
    pendingType = type;

    const msg = await buildMessage(triggerSource);
    const overlay = document.getElementById('sos-overlay');
    overlay.className = `sos-overlay active ${type}`;

    // Set type label
    const labels = {
      primary:   '🆘 PRIMARY SOS',
      secondary: '⚠️ AUTO ALERT',
    };
    document.getElementById('sos-type-label').textContent = labels[type];
    document.getElementById('sos-icon').textContent = type === 'primary' ? '🆘' : '⚠️';
    document.getElementById('sos-msg-text').textContent = msg;

    // Build recipient list
    const recipientsEl = document.getElementById('sos-recipients');
    recipientsEl.innerHTML = '';

    const recipients = getRecipients(type);
    recipients.forEach(r => {
      const a = document.createElement('a');
      a.className = 'sos-recipient-item';
      const encodedMsg = encodeURIComponent(msg);
      a.href = `sms:${r.phone}?body=${encodedMsg}`;
      a.innerHTML = `
        <span class="sos-recipient-icon">${r.icon}</span>
        <span class="sos-recipient-name">${r.name}</span>
        <span class="sos-recipient-cta">Send SMS →</span>
      `;
      recipientsEl.appendChild(a);
    });

    // Update confirm button
    document.getElementById('btn-confirm-sos').onclick = () => fireAllMessages(recipients, msg);

    App.showToast(
      type === 'primary' ? '🆘 PRIMARY SOS ACTIVATED' : '⚠️ AUTO ALERT TRIGGERED',
      type === 'primary' ? 'danger' : 'warning'
    );
  }

  /* ── Get recipient list based on SOS type ── */
  function getRecipients(type) {
    if (type === 'primary') {
      const contacts = AppState.contacts;
      if (contacts.length === 0) {
        return [{ name: 'No contacts saved!', phone: '', icon: '👤' }];
      }
      return contacts.map(c => ({ name: c.name, phone: c.phone, icon: '👤' }));
    } else {
      // Secondary: police, hospitals, govt
      const svcIcons = { police: '🚔', hospital: '🏥', govt: '🏛️' };
      return EMERGENCY_SERVICES.map(s => ({
        name: s.name,
        phone: s.phone,
        icon: svcIcons[s.type] || '📞',
      }));
    }
  }

  /* ── Fire SMS to all recipients ── */
  function fireAllMessages(recipients, msg) {
    const encodedMsg = encodeURIComponent(msg);
    // Open first SMS immediately
    if (recipients.length > 0 && recipients[0].phone) {
      window.open(`sms:${recipients[0].phone}?body=${encodedMsg}`, '_blank');
    }
    // Queue the rest with short delays (mobile OS usually handles one at a time)
    recipients.slice(1).forEach((r, i) => {
      if (r.phone) {
        setTimeout(() => window.open(`sms:${r.phone}?body=${encodedMsg}`, '_blank'), (i + 1) * 1200);
      }
    });
    App.showToast(`Sending SOS to ${recipients.length} contacts...`, 'danger');
  }

  /* ── Dismiss SOS overlay ── */
  function dismiss() {
    document.getElementById('sos-overlay').className = 'sos-overlay';
    sosActive = false;
    pendingType = null;
  }

  /* ── Public API ── */
  return {
    triggerPrimary:   () => showOverlay('primary',   'manual'),
    triggerSecondary: (src) => showOverlay('secondary', src || 'auto'),
    dismiss,
    isActive: () => sosActive,
  };
})();
