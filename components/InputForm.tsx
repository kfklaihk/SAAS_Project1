// /components/InputForm.tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

function JsonTable({ data }: { data: any }) {
  const renderValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const entries = Object.entries(data).map(([key, value]) => ({
    key,
    value: renderValue(value)
  }));

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
        <tr className="bg-blue-50">
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Key</th>
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Value</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-4 py-2 font-medium text-gray-700">{entry.key}</td>
              <td className="border border-gray-300 px-4 py-2 text-gray-600 whitespace-pre-wrap font-mono text-sm">{entry.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function InputForm({ disabled }: { disabled?: boolean }) {
  const [originalText, setOriginalText] = useState('');
  const [generatedOutput, setGeneratedOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Calculate UTF-8 byte length
  const charCount = new TextEncoder().encode(originalText).length;
  const maxChars = 5000;
  const isExceeded = charCount > maxChars;

  const generate = async () => {
    if (isExceeded) {
      alert('Text exceeds 5000 UTF-8 character limit');
      return;
    }

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
    if (json.error) {
      alert(json.error);
      setGeneratedOutput(null);
    } else if (json.doc?.output) {
      setGeneratedOutput(json.doc.output);
    } else {
      setGeneratedOutput(null);
    }
  };

  return (
    <div className="mt-8 border rounded p-4 bg-white">
      <textarea 
        className="textarea w-full h-40 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
        placeholder="Paste your original text here..." 
        value={originalText} 
        onChange={e => setOriginalText(e.target.value)} 
      />
      <div className={`text-sm mt-2 ${isExceeded ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
        {charCount} / {maxChars} UTF-8 bytes
      </div>
      
      <div className="flex gap-3 mt-4">
        <button 
          className={`px-6 py-2 rounded font-medium transition ${
            disabled || isExceeded
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : loading
              ? 'bg-blue-500 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          onClick={generate} 
          disabled={disabled || loading || isExceeded}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
        
        <button
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
          onClick={() => setGeneratedOutput(null)}
        >
          Clear Generated Summary
        </button>
      </div>

      <h3 className="font-semibold mb-2 mt-6">Generated Summary</h3>
      {generatedOutput && <JsonTable data={generatedOutput} />}
    </div>
  );
}