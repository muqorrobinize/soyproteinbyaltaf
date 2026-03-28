'use client';

import { useState } from 'react';
import { checkApiTier } from '@/app/admin/actions';

export function TestTierButton({ keyId }: { keyId: string }) {
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    try {
      const result = await checkApiTier(keyId);
      alert(`Result: ${result.tier}\nDetail: ${result.message}`);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  return (
    <button 
      type="button"
      onClick={handleCheck}
      disabled={loading}
      className={`text-xs px-3 py-1 font-bold rounded transition-colors shadow-sm ${loading ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
    >
      {loading ? '...' : 'Test Tier'}
    </button>
  );
}
