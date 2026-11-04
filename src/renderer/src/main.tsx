import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { attachPressLog } from './press-log';
import { attachVoiceFollow } from './voice-live';

attachPressLog((input) => window.appytron.logPress(input));
attachVoiceFollow();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
