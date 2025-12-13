// /components/ResultCard.tsx

function JsonTable({ data }: { data: any }) {
  const renderValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const entries: { key: string; value: any; isArray?: boolean }[] = [];

  Object.entries(data).forEach(([key, value]) => {
    // Skip summary key
    if (key === 'summary') return;

    if (Array.isArray(value)) {
      // For arrays, add each item as a separate row
      value.forEach((item, idx) => {
        entries.push({
          key: idx === 0 ? key : '',
          value: renderValue(item),
          isArray: true
        });
      });
    } else {
      entries.push({
        key,
        value: renderValue(value)
      });
    }
  });

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700 whitespace-nowrap align-top">{entry.key}</td>
              <td className="border border-gray-300 px-3 py-2 text-gray-600 whitespace-pre-wrap font-mono text-xs">{entry.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ResultCard({ doc }: { doc: any }) {
  const o = doc.output || {};
  
  return (
    <div className="border rounded p-4 bg-white">
  {/*    <h4 className="font-semibold text-lg mb-4">{doc.title}</h4> */}
      {typeof o === 'object' && Object.keys(o).length > 0 ? (
        <JsonTable data={o} />
      ) : (
        <p className="text-gray-500">No output available</p>
      )}
    </div>
  );
}