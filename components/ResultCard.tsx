// /components/ResultCard.tsx
export default function ResultCard({ doc }: { doc: any }) {
  const o = doc.output || {};
  return (
    <div className="border rounded p-4 bg-white">
      <h4 className="font-semibold">{doc.title}</h4>
      <p className="text-gray-700 mt-2"><strong>Summary:</strong> {o.summary ?? '—'}</p>
      {Array.isArray(o.decisions) && o.decisions.length > 0 && (
        <div className="mt-2">
          <strong>Decisions</strong>
          <ul className="list-disc ml-6">{o.decisions.map((d: any, i: number) => <li key={i}>{d}</li>)}</ul>
        </div>
      )}
      {Array.isArray(o.action_items) && o.action_items.length > 0 && (
        <div className="mt-2">
          <strong>Action Items</strong>
          <ul className="list-disc ml-6">
            {o.action_items.map((a: any, i: number) => (
              <li key={i}>
                {a.description} — <em>{a.owner}</em> {a.due_date ? `(due ${a.due_date})` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}