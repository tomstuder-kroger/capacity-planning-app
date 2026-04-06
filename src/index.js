import React from 'react';
import ReactDOM from 'react-dom/client';
import { KdsToastController } from 'react-mx-web-components';
import './index.css';
import 'mx-web-components/dist/kds-reset.css';
import 'mx-web-components/dist/kds-utils.css';
import 'mx-web-components/dist/kds-components.css';
import 'mx-web-components/dist/light.css';
import 'mx-web-components/dist/mx-web-components/mx-web-components.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <KdsToastController />
    <App />
  </React.StrictMode>
);
