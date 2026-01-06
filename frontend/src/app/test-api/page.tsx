'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [envInfo, setEnvInfo] = useState<any>({});

  useEffect(() => {
    // Get environment info
    setEnvInfo({
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      grafanaUrl: process.env.NEXT_PUBLIC_GRAFANA_URL,
      nodeEnv: process.env.NODE_ENV,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR'
    });
  }, []);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing API connection...');
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');
      
      // Test direct fetch first
      const directResponse = await fetch('http://localhost:5000/api/dashboard/kpis', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3001'
        }
      });
      
      if (!directResponse.ok) {
        throw new Error(`Direct fetch failed: ${directResponse.status} ${directResponse.statusText}`);
      }
      
      const directData = await directResponse.json();
      console.log('Direct fetch success:', directData);
      
      // Now test via API client
      const response = await api.dashboard.kpis();
      console.log('API Client Response:', response);
      setResult({
        directFetch: directData,
        apiClient: response.data,
        status: 'success'
      });
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Unknown error');
      setResult({
        error: err.message,
        stack: err.stack,
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Connection Test - Mac Mini M4 Pro</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Environment Info:</h3>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(envInfo, null, 2)}
        </pre>
      </div>
      
      <button
        onClick={testApi}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className={`mt-4 p-4 border rounded ${result.status === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'}`}>
          <h3 className="font-bold">{result.status === 'success' ? 'Success! API Response:' : 'Error Details:'}</h3>
          <pre className="mt-2 text-sm overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600 space-y-1">
        <p><strong>Expected API Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}</p>
        <p><strong>Frontend URL:</strong> http://localhost:3001</p>
        <p><strong>Backend URL:</strong> http://localhost:5000</p>
        <p><strong>Architecture:</strong> ARM64 (Mac Mini M4 Pro)</p>
        <p><strong>Node.js:</strong> v25.2.1</p>
        <p><strong>.NET:</strong> 9.0.112</p>
      </div>
    </div>
  );
}