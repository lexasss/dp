
window.onload = () => {
  'use strict';

  const IP = '192.168.43.208';
  const PORT = 5000;

  class Settings {
    constructor() {
      this.duration = 300;
    }
  }

  const targetEl = document.querySelector('.target');
  const connectionEl = document.querySelector('.connection');
  const statusEl = document.querySelector('.status');

  let settings = new Settings();
  let ws;

  function connect()
  {
    statusEl.textContent = `Connecting to ${IP}:${PORT}`;

    ws = new WebSocket(`ws://${IP}:${PORT}`);
    ws.addEventListener('open', e => {
      connectionEl.classList.remove('invisible');
      statusEl.textContent = `Connected`;
    });
    ws.addEventListener('close', e => {
      connectionEl.classList.add('invisible');
      statusEl.textContent = `Connection lost: ${e.reason}`;
    });
    ws.addEventListener('error', /** $type*/e => {
      connectionEl.classList.add('invisible');
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

  connect();
  startServiceWorker();
}
