import React from 'react';
import ReactDOM from 'react-dom/client';
import { SettingsApp } from './SettingsApp';
import '../../styles/global.css';
import '../../styles/settings.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <SettingsApp />
    </React.StrictMode>
  );
}
