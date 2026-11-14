import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { CampusProviders } from '@/src/app/CampusProviders';
import { campusRouter } from '@/src/app/router';
import '@/src/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CampusProviders>
      <RouterProvider router={campusRouter} />
    </CampusProviders>
  </React.StrictMode>,
);
