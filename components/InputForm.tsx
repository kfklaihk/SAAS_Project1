// /components/InputForm.tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function InputForm({ disabled }: { disabled?: boolean }) {
  const [originalText, setOriginalText] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id!;
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title: 'Analysis', transcript: originalText })
    });
    const json = await res.json();
    setLoading(false);
    if (json.error) alert(json.error);
    else {
      setGeneratedSummary(json.summary || 'Generated analysis will appear here.');
      alert('Generated! Refresh to see the latest.');
    }
  };

  return (
    <div className="mt-8 border rounded p-4 bg-white">
      <h3 className="font-semibold mb-2">Original Text</h3>
      <textarea 
        className="textarea w-full h-40 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
        placeholder="Paste your original text here..." 
        value={originalText} 
        onChange={e => setOriginalText(e.target.value)} 
      />
      
      <button 
        className={`mt-4 px-6 py-2 rounded font-medium transition ${
          disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : loading
            ? 'bg-blue-500 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        onClick={generate} 
        disabled={disabled || loading}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>

      <h3 className="font-semibold mb-2 mt-6">Generated Summary</h3>
      <textarea 
        className="textarea w-full h-40 px-3 py-2 border border-gray-300 rounded bg-gray-50" 
        placeholder="Generated analysis will appear here..." 
        value={generatedSummary} 
        readOnly 
      />
    </div>
  );
}