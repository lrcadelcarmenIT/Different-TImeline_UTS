(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var soundButton = document.getElementById('sound-toggle');
  var motionButton = document.getElementById('motion-toggle');
  var progress = document.getElementById('journey-progress');
  var pageIds = Array.from(document.querySelectorAll('.page')).map(function (page) { return page.id; });
  var context;
  function read(key, fallback) { try { var value = localStorage.getItem(key); return value === null ? fallback : value === 'true'; } catch (_) { return fallback; } }
  function save(key, value) { try { localStorage.setItem(key, String(value)); } catch (_) {} }
  var sound = read('woodland-sound', true);
  var motion = read('woodland-motion', true);
  function updateSettings() {
    var moving = motion && !reduced.matches;
    root.dataset.motion = moving ? 'on' : 'off';
    soundButton.textContent = sound ? '♪ Sound on' : '♪ Sound off';
    soundButton.setAttribute('aria-pressed', String(sound));
    motionButton.textContent = moving ? 'Motion on' : 'Motion off';
    motionButton.setAttribute('aria-pressed', String(moving));
    motionButton.disabled = reduced.matches;
    motionButton.title = reduced.matches ? 'Reduced motion is enabled in your device settings' : 'Toggle drifting leaves and page animations';
  }
  // A short, original two-note cue. No audio downloads or background playback.
  function chime() {
    if (!sound) return;
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!context) context = new AudioContext();
      var ready = context.state === 'suspended' ? context.resume() : Promise.resolve();
      ready.then(function () {
        if (!sound || context.state !== 'running') return;
        var now = context.currentTime;
        [523.25, 659.25].forEach(function (frequency, i) {
          var oscillator = context.createOscillator();
          var envelope = context.createGain();
          var start = now + i * 0.075;
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(frequency, start);
          envelope.gain.setValueAtTime(0, start);
          envelope.gain.linearRampToValueAtTime(0.035, start + 0.02);
          envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
          oscillator.connect(envelope);
          envelope.connect(context.destination);
          oscillator.start(start);
          oscillator.stop(start + 0.32);
          oscillator.onended = function () { oscillator.disconnect(); envelope.disconnect(); };
        });
      }).catch(function () {});
    } catch (_) { /* Navigation continues if the browser cannot play sound. */ }
  }
  soundButton.addEventListener('click', function () { sound = !sound; save('woodland-sound', sound); updateSettings(); if (sound) chime(); });
  motionButton.addEventListener('click', function () { motion = !motion; save('woodland-motion', motion); updateSettings(); });
  reduced.addEventListener('change', updateSettings);
  updateSettings();
  window.woodlandExperience = {
    play: chime,
    update: function (id) {
      var index = Math.max(0, pageIds.indexOf(id));
      progress.style.width = ((index + 1) / pageIds.length * 100) + '%';
      progress.parentElement.setAttribute('aria-valuenow', String(index + 1));
      progress.parentElement.setAttribute('aria-valuetext', 'Page ' + (index + 1) + ' of ' + pageIds.length);
    }
  };
  var layer = document.createElement('div');
  layer.id = 'leaf-layer';
  layer.setAttribute('aria-hidden', 'true');
  for (var i = 0; i < 9; i++) {
    var leaf = document.createElement('i');
    leaf.className = 'drifting-leaf';
    // Keep the busiest part of the effect near the edges of the reading area.
    leaf.style.left = (i % 2 ? 91 + (i % 3) * 2 : (i % 4) * 2) + '%';
    leaf.style.setProperty('--duration', (19 + i * 2) + 's');
    leaf.style.setProperty('--delay', (-i * 4.7) + 's');
    layer.appendChild(leaf);
  }
  document.body.prepend(layer);
  document.addEventListener('visibilitychange', function () { document.body.classList.toggle('is-away', document.hidden); });
}());
