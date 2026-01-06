'use client';

import { useState, useEffect } from 'react';

export default function SimpleTestPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from API...');
        const response = await fetch('http://localhost:5000/api/dashboard/kpis', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Data fetched successfully:', result);
        setData(result);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Simple API Test (No React Query)</h1>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Simple API Test (No React Query)</h1>
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple API Test (No React Query)</h1>
      <div className="bg-green-100 p-4 rounded">
        <h3 className="font-bold text-green-800">Success!</h3>
        <pre className="mt-2 text-sm overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}