
window.onload = () => {
  'use strict';

  let ip = '192.168.43.208';
  let port = 5000;

  class Settings {
    constructor() {
      this.duration = 300;
    }
  }

  const targetEl = document.querySelector('.target');
  const connectionEl = document.querySelector('.connection');
  const dashboardEl = document.querySelector('.dashboard');
  const ipEl = /** @type {HTMLInputElement} */document.querySelector('#ip');
  const portEl = /** @type {HTMLInputElement} */document.querySelector('#port');
  const statusEl = document.querySelector('.status');

  let settings = new Settings();
  let ws;

  function connect()
  {
    statusEl.textContent = `Connecting to ${ip}:${port}`;

    ws = new WebSocket(`ws://${ip}:${port}`);
    ws.addEventListener('open', e => {
      connectionEl.classList.remove('no');
      connectionEl.classList.add('yes');
      statusEl.textContent = `Connected`;
    });
    ws.addEventListener('close', e => {
      connectionEl.classList.remove('yes');
      connectionEl.classList.add('no');
      statusEl.textContent = `Connection lost: ${e.reason}`;
    });
    ws.addEventListener('error', e => {
      connectionEl.classList.remove('yes');
      connectionEl.classList.add('no');
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
              .register('./js/sw.js');
    }
  }

  function toggleDashboard(/** @type {Event}*/ e) {
    if (e.target !== ipEl && e.target !== portEl) {
      dashboardEl.classList.toggle('invisible');
    }
  }

  function setup() {
    ipEl.value = ip;
    ipEl.addEventListener('change', e => {
      ip = ipEl.value;
    });

    portEl.value = port;
    portEl.addEventListener('change', e => {
      port = portEl.value;
    });

    document.addEventListener('click', toggleDashboard);
  }


  setup();
  connect();
  startServiceWorker();
}
