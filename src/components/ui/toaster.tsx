'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          style: {
            background: '#10B981',
          },
        },
        error: {
          style: {
            background: '#EF4444',
          },
        },
      }}
    />
  );
}
