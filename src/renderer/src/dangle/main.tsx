import React from 'react';
import ReactDOM from 'react-dom/client';
import { DangleApp } from './DangleApp';
import '../../styles/global.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <DangleApp />
    </React.StrictMode>
  );
}
