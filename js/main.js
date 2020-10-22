
window.onload = () => {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./js/sw.js');
  }

  class Settings {
    constructor() {
      this.duration = 300;
    }
  }

  const targetEl = document.querySelector('.target');
  const connectionEl = document.querySelector('.connection');

  let settings = new Settings();
  let ws;

  function connect()
  {
    ws = new WebSocket('ws://192.168.43.208:5000');
    ws.addEventListener('open', e => {
      connectionEl.classList.remove('invisible');
    });
    ws.addEventListener('close', e => {
      connectionEl.classList.add('invisible');
    });
    ws.addEventListener('error', e => {
      connectionEl.classList.add('invisible');
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

  connect();
}
