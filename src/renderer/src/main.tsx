import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { attachPressLog } from './press-log';

attachPressLog((input) => window.appytron.logPress(input));

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
