/*  sensors.js — Voice, Motion & Power-Off Sensor Modules  */

const Sensors = (() => {
  /* ─────────────────────────────────────────────
     MODULE 1: VOICE / CODE-WORD DETECTOR
  ───────────────────────────────────────────── */
  const Voice = (() => {
    let audioCtx, analyser, micStream, rafId;
    let active = false;
    let recognition = null;
    let lastRms = 0;

    function getDbThreshold() {
      return parseInt(AppState.settings.dbThreshold) || 65;
    }

    function getCodeWord() {
      return (AppState.settings.codeWord || 'help').toLowerCase().trim();
    }

    async function start() {
      if (active) return;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
        const src = audioCtx.createMediaStreamSource(micStream);
        analyser  = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);

        active = true;
        updateChip('voice', true);
        monitorDb();
        startSpeechRecognition();
        App.showToast('🎙️ Voice monitoring active', 'success');
      } catch (e) {
        App.showToast('❌ Mic access denied. Voice monitoring inactive.', 'warning');
        console.warn('Voice:', e);
      }
    }

    function monitorDb() {
      if (!active) return;
      const buf = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteTimeDomainData(buf);

      // Calculate RMS
      let sum = 0;
      for (let v of buf) sum += Math.pow((v - 128) / 128, 2);
      const rms = Math.sqrt(sum / buf.length);
      lastRms = rms;
      const db = rms > 0 ? (20 * Math.log10(rms) + 90) : 0; // roughly 0–100
      const perc = Math.min(100, Math.max(0, db));

      // Update dB bar
      const fill = document.getElementById('db-fill');
      if (fill) fill.style.width = perc + '%';

      // Auto-trigger on loud noise even without keyword (ultra-high dB = scream)
      if (db >= parseInt(AppState.settings.dbThreshold || 70) + 15) {
        // Very loud → trigger secondary SOS
        if (!SOS.isActive()) {
          SOS.triggerSecondary('voice');
        }
      }

      rafId = requestAnimationFrame(monitorDb);
    }

    function startSpeechRecognition() {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { App.showToast('⚠️ Speech recognition not supported. Using dB-only mode.', 'warning'); return; }

      recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (e) => {
        const transcript = Array.from(e.results)
          .map(r => r[0].transcript.toLowerCase())
          .join(' ');

        const codeWord = getCodeWord();
        if (transcript.includes(codeWord)) {
          recognition.stop();
          App.showToast(`🗣️ Code word "${codeWord}" detected!`, 'danger');
          SOS.triggerSecondary('voice');
        }
      };

      recognition.onerror = (e) => {
        if (e.error !== 'no-speech') console.warn('SR error:', e.error);
      };

      recognition.onend = () => {
        // Restart if still active
        if (active) {
          setTimeout(() => { try { recognition.start(); } catch {} }, 1000);
        }
      };

      try { recognition.start(); } catch {}
    }

    function stop() {
      active = false;
      if (rafId) cancelAnimationFrame(rafId);
      if (recognition) { try { recognition.stop(); } catch {} recognition = null; }
      if (micStream)  micStream.getTracks().forEach(t => t.stop());
      if (audioCtx)   audioCtx.close();
      micStream = audioCtx = analyser = null;
      updateChip('voice', false);

      const fill = document.getElementById('db-fill');
      if (fill) fill.style.width = '0%';
      App.showToast('🎙️ Voice monitoring stopped', 'warning');
    }

    function toggle() { active ? stop() : start(); }
    return { start, stop, toggle, isActive: () => active };
  })();

  /* ─────────────────────────────────────────────
     MODULE 2: DEVICE MOTION / THROW DETECTOR
  ───────────────────────────────────────────── */
  const Motion = (() => {
    let active = false;
    let cooldown = false;
    let highGFrames = 0;
    const THRESHOLD = 28; // m/s²
    const REQUIRED_FRAMES = 3;

    function handleMotion(e) {
      if (!active || cooldown) return;
      const a = e.acceleration || e.accelerationIncludingGravity;
      if (!a) return;

      const magnitude = Math.sqrt(
        Math.pow(a.x || 0, 2) +
        Math.pow(a.y || 0, 2) +
        Math.pow(a.z || 0, 2)
      );

      if (magnitude > THRESHOLD) {
        highGFrames++;
        if (highGFrames >= REQUIRED_FRAMES) {
          highGFrames = 0;
          cooldown = true;

          App.showToast('📲 Throw/Impact detected! Auto SOS in 5s...', 'danger');
          updateChip('motion', 'triggered');

          let t = 5;
          const cd = document.getElementById('countdown');
          if (cd) {
            cd.classList.add('active');
            document.getElementById('countdown-num').textContent = t;
          }

          const iv = setInterval(() => {
            t--;
            if (cd) document.getElementById('countdown-num').textContent = t;
            if (t <= 0) {
              clearInterval(iv);
              if (cd) cd.classList.remove('active');
              SOS.triggerSecondary('motion');
              setTimeout(() => {
                cooldown = false;
                updateChip('motion', true);
              }, 30000);
            }
          }, 1000);
        }
      } else {
        highGFrames = Math.max(0, highGFrames - 1);
      }
    }

    async function start() {
      if (active) return;

      // iOS 13+ requires permission for DeviceMotionEvent
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const perm = await DeviceMotionEvent.requestPermission();
          if (perm !== 'granted') {
            App.showToast('❌ Motion sensor permission denied', 'warning');
            return;
          }
        } catch (e) {
          App.showToast('❌ Motion permission error', 'warning');
          return;
        }
      }

      active = true;
      window.addEventListener('devicemotion', handleMotion);
      updateChip('motion', true);
      App.showToast('📲 Motion detection active', 'success');
    }

    function stop() {
      active = false;
      window.removeEventListener('devicemotion', handleMotion);
      updateChip('motion', false);
      App.showToast('📲 Motion detection stopped', 'warning');
    }

    function toggle() { active ? stop() : start(); }

    /* Desktop testing: simulate a throw */
    function simulateThrow() {
      if (!active) { App.showToast('⚠️ Enable motion monitoring first', 'warning'); return; }
      handleMotion({ acceleration: { x: 30, y: 15, z: 25 } });
      setTimeout(() => handleMotion({ acceleration: { x: 30, y: 15, z: 25 } }), 50);
      setTimeout(() => handleMotion({ acceleration: { x: 30, y: 15, z: 25 } }), 100);
    }

    return { start, stop, toggle, simulateThrow, isActive: () => active };
  })();

  /* ─────────────────────────────────────────────
     MODULE 3: POWER-OFF / TAB-CLOSE DETECTOR
  ───────────────────────────────────────────── */
  const PowerOff = (() => {
    let active = false;
    let batteryObj = null;
    let batteryCheckInterval = null;

    async function start() {
      if (active) return;
      active = true;
      updateChip('poweroff', true);

      // 3a — beforeunload (tab close / browser quit / phone power off)
      window.addEventListener('beforeunload', handlePageClose);

      // 3b — Battery API
      if ('getBattery' in navigator) {
        try {
          batteryObj = await navigator.getBattery();
          checkBattery();
          batteryObj.addEventListener('levelchange', checkBattery);
          batteryObj.addEventListener('chargingchange', checkBattery);
          batteryCheckInterval = setInterval(checkBattery, 30000);
        } catch { /* Battery API not available */ }
      }

      App.showToast('🔋 Power-off monitoring active', 'success');
    }

    function handlePageClose(e) {
      if (!active) return;
      // Build minimal message and fire sendBeacon
      const msg = buildEmergencyBeacon();
      // sendBeacon is the only reliable method before page unload
      // We target a canary endpoint; in a real app, this would be your server
      navigator.sendBeacon && navigator.sendBeacon('/sos-beacon', JSON.stringify({ msg }));

      // Show SMS link as warning
      e.returnValue = '⚠️ SafeGuard: Emergency SOS will be sent when you leave!';
      return e.returnValue;
    }

    function checkBattery() {
      if (!batteryObj || !active) return;
      const level = batteryObj.level * 100;
      const charging = batteryObj.charging;

      // Critical: <10% and discharging → trigger secondary SOS
      if (level <= 10 && !charging) {
        App.showToast(`🔋 Critical battery (${Math.round(level)}%)! Sending auto-alert...`, 'danger');
        SOS.triggerSecondary('poweroff');
      } else if (level <= 20 && !charging) {
        App.showToast(`🔋 Low battery (${Math.round(level)}%). Keep charging!`, 'warning');
        updateChip('poweroff', 'warning');
      }
    }

    function buildEmergencyBeacon() {
      const name = AppState.settings.userName || 'Unknown';
      return `🆘 EMERGENCY: ${name}'s device is powering off or browser closed. Last known time: ${new Date().toLocaleTimeString()}`;
    }

    function stop() {
      active = false;
      window.removeEventListener('beforeunload', handlePageClose);
      if (batteryObj) {
        batteryObj.removeEventListener('levelchange', checkBattery);
        batteryObj.removeEventListener('chargingchange', checkBattery);
      }
      clearInterval(batteryCheckInterval);
      updateChip('poweroff', false);
      App.showToast('🔋 Power-off monitoring stopped', 'warning');
    }

    function toggle() { active ? stop() : start(); }
    return { start, stop, toggle, isActive: () => active };
  })();

  /* ── Shared helper: update sensor chip UI ── */
  function updateChip(id, state) {
    const chip = document.getElementById(`chip-${id}`);
    if (!chip) return;
    chip.className = 'sensor-chip';
    const dot = chip.querySelector('.chip-dot');

    if (state === true) {
      chip.classList.add('active');
    } else if (state === 'triggered' || state === 'warning') {
      chip.classList.add('triggered');
    }
    // false = default inactive state
  }

  return { Voice, Motion, PowerOff, updateChip };
})();
