import React, { useEffect, useState, useMemo } from "react";
import EpicEditor from './EpicEditor';

export default function EpicTree({reloadKey, onSelectEpic, activeEpicId}) {
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(true);

const EpicItems = useMemo(() => {
        return epics.map((doc) => {
            const isActive = String(activeEpicId) === String(doc.id);
            return {...doc, isActive};
        });
    }, [epics, activeEpicId]);

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
  }, [reloadKey]);

useEffect(() => {
        console.log('Epics updated:', {
            activeEpicId,
            epics: epics.map(doc => ({
                id: doc.id,
                title: doc.title,
                isActive: String(activeEpicId) === String(doc.id)
            }))
        });
    }, [epics, activeEpicId]);
 

  if (loading) return <div>Lade Epics…</div>;
  if (!epics.length) return <div>Keine Epics gefunden.</div>;

  return (
    <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-3">Table of Contents</h2>
            <ul className="list-disc pl-5">
                {EpicItems.map((doc) => {
                    const isActive = String(activeEpicId) === String(doc.id);
                    return (
                        <li key={doc.id} className="mb-2">
                            <button
                                className={isActive ? 'active' : ''}
                                style={{
                                    color: isActive ? '#1e1b4b' : '#4f46e5',
                                    backgroundColor: isActive ? '#e0e7ff' : 'transparent',
                                    fontWeight: isActive ? '600' : 'normal',
                                    padding: '0.25rem 0.5rem',  // Consistent padding
                                    borderRadius: isActive ? '0.25rem' : '0',  // Slightly smaller border radius
                                    border: isActive ? '2px solid #4f46e5' : 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    width: 'calc(100% - 1rem)',  // Account for padding and border
                                    boxSizing: 'border-box',  // Include padding and border in width calculation
                                    transition: 'all 0.2s ease',
                                    margin: '0 0.5rem',  // Add some margin to prevent border overflow
                                    display: 'block'  // Ensure it's a block element
                                }}
                                onClick={() => onSelectEpic(doc.id)}
                            >
                                {doc.title.replace(/<[^>]+>/g, "").slice(0, 30)}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
  );
}
