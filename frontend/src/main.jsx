import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'Nunito, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
              background: '#fff',
              color: '#2D2D2D',
            },
            success: {
              iconTheme: { primary: '#A8E6CF', secondary: '#2D2D2D' },
              style: { borderLeft: '4px solid #A8E6CF' },
            },
            error: {
              iconTheme: { primary: '#FF7B7B', secondary: '#fff' },
              style: { borderLeft: '4px solid #FF7B7B' },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
