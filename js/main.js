window.onload = () => {
  'use strict';

  class Settings {
    constructor() {
      this.duration = 300;
      this.ip = '192.168.43.208';
      this.port = 5000;
    }
  }

  const targetEl = document.querySelector('.target');
  const connectionEl = document.querySelector('.connection');
  const swEl = document.querySelector('.sw');
  const dashboardEl = document.querySelector('.dashboard');
  const ipEl = /** @type {HTMLInputElement} */document.querySelector('#ip');
  const portEl = /** @type {HTMLInputElement} */document.querySelector('#port');
  const statusEl = document.querySelector('.status');

  let settings = new Settings();
  let ws;
  let screen;

  function connect()
  {
    statusEl.textContent = `Connecting to ${settings.ip}:${settings.port}`;

    ws = new WebSocket(`ws://${settings.ip}:${settings.port}`);
    ws.addEventListener('open', e => {
      connectionEl.classList.add('active');
      statusEl.textContent = `Connected`;
      screen.enable();
    });
    ws.addEventListener('close', e => {
      connectionEl.classList.remove('active');
      statusEl.textContent = `Connection lost: ${e.reason}`;
      screen.disable();
    });
    ws.addEventListener('error', e => {
      connectionEl.classList.remove('active');
      statusEl.textContent = `Connection error`;
      setTimeout( connect, 3000 );
    });
    ws.addEventListener('message', e => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'settings') {
        settings = { ...settings, ...(msg.payload) };
        console.log(`Settings: ${settings}`);
      }
      else if (msg.type === 'flash') {
        console.log('Flash');
        targetEl.classList.remove('invisible');
        setTimeout(hideTarget, settings.duration);
      }
    });
  }

  function hideTarget() {
    targetEl.classList.add('invisible');
  }

  function startServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('./js/sw.js')
        .then(reg => {
          console.log(`Service worker: ${reg.scope}`);
          swEl.classList.add('active');
        })
        .catch(ex => {
          console.error(`Service worker: ${ex?.toString()}`);
        });
    }
  }

  function toggleDashboard(/** @type {Event}*/ e) {
    if (e.target !== ipEl && e.target !== portEl) {
      dashboardEl.classList.toggle('invisible');
    }
  }

  function setup() {
    const loadedSettings = localStorage.getItem('dp-settings');
    if (loadedSettings) {
      settings = { ...settings, ...JSON.parse(loadedSettings) }
    }

    ipEl.value = settings.ip;
    ipEl.addEventListener('change', e => {
      settings.ip = ipEl.value;
      localStorage.setItem('dp-settings', JSON.stringify(settings));
    });

    portEl.value = settings.port;
    portEl.addEventListener('change', e => {
      settings.port = portEl.value;
      localStorage.setItem('dp-settings', JSON.stringify(settings));
    });

    document.addEventListener('click', toggleDashboard);

    screen = new NoSleep();
  }


  setup();
  connect();
  startServiceWorker();
}
