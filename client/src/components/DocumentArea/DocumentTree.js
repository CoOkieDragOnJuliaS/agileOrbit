import React, { useEffect, useState } from "react";
import DocumentEditor from './DocumentEditor';

export default function DocumentTree() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch("/api/documents/fileTree"); // Backend Endpoint
        if (!res.ok) throw new Error("Fehler beim Laden der Dokumente");

        const data = await res.json();
        setDocuments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
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

  const [activeDocumentId, setActiveDocumentId] = useState(false);

  if (loading) return <div>Lade Dokumente…</div>;
  if (!documents.length) return <div>Keine Dokumente gefunden.</div>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-3">Dokumente</h2>
      <ul className="list-disc pl-5">
        {documents.map((doc) => (
            <li key={doc.id} className="mb-2">
            <button
              className="text-indigo-600 hover:underline"
              onClick={() =>
                setActiveDocumentId((prev) =>
                  prev === doc.id ? null : doc.id
                )
                
              }
            >
              {doc.title.replace(/<[^>]+>/g, "").slice(0, 30)}
            </button>
           
        
            {activeDocumentId === doc.id && (
              <div className="mt-2">
                <DocumentEditor documentId={doc.id} />
              </div>
            )}
          </li>
        
        ))}
      </ul>
    </div>
  );
}
