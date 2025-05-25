import React from 'react';
import ReactDOM from 'react-dom/client';
// App is the main component containing our routes
import App from './App.jsx';
// BrowserRouter enables client-side routing
import { BrowserRouter } from 'react-router-dom';
import './index.css';

// This tells React to render our App inside the <div id="root"> in index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Enables routing throughout the entire app */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)