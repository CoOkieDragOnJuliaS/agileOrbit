import React, { useEffect, useState } from "react";
import EpicEditor from './EpicEditor';

export default function EpicTree() {
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEpics = async () => {
      try {
        const res = await fetch("/api/epics/fileTree"); // Backend Endpoint
        if (!res.ok) throw new Error("Fehler beim Laden der Epics");

        const data = await res.json();
        setEpics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEpics();
  }, []);

  /*const loadDocument = async (docId) => {
    try {
      const res = await fetch(`/api/documents/${docId}`);
      const data = await res.json();
      setContent(data.content || "");
    } catch (err) {
      console.error("Failed to load document", err);
    } finally {
      setLoading(false);
    }
  };*/

  const [activeEpicId, setActiveEpicId] = useState(false);

  if (loading) return <div>Lade Epics…</div>;
  if (!epics.length) return <div>Keine Epics gefunden.</div>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-3">Epics</h2>
      <ul className="list-disc pl-5">
        {epics.map((epic) => (
            <li key={epic.id} className="mb-2">
            <button
              className="text-indigo-600 hover:underline"
              onClick={() =>
                setActiveEpicId((prev) =>
                  prev === epic.id ? null : epic.id
                )
                
              }
            >
              {epic.title.replace(/<[^>]+>/g, "").slice(0, 30)}…
            </button>
           
        
            {activeEpicId === epic.id && (
              <div className="mt-2">
                <EpicEditor epicId={epic.id} />
              </div>
            )}
          </li>
        
        ))}
      </ul>
    </div>
  );
}
