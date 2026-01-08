import React, {useEffect, useState, useMemo} from "react";
import "./DocumentArea.css"


export default function DocumentTree({reloadKey, onSelectDocument, activeDocumentId}) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);


    const documentItems = useMemo(() => {
        return documents.map((doc) => {
            const isActive = String(activeDocumentId) === String(doc.id);
            return {...doc, isActive};
        });
    }, [documents, activeDocumentId]);

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
    }, [reloadKey]);

    useEffect(() => {
        console.log('Documents updated:', {
            activeDocumentId,
            documents: documents.map(doc => ({
                id: doc.id,
                title: doc.title,
                isActive: String(activeDocumentId) === String(doc.id)
            }))
        });
    }, [documents, activeDocumentId]);

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

    if (loading) return <div>Loading documents…</div>;
    if (!documents.length) return <div>No documents found!</div>;

    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-3">Table of Contents</h2>
            <ul className="list-disc pl-5">
                {documentItems.map((doc) => {
                    const isActive = String(activeDocumentId) === String(doc.id);
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
                                onClick={() => onSelectDocument(doc.id)}
                            >
                                {doc.title.replace(/<[^>]+>/g, "").slice(0, 30)}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    )
        ;
}
