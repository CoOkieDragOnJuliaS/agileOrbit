import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

//import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
//import { db } from '../../firebase';

const saveDocument = async (content,docId) => {
    //console.log("content:", content);
    await fetch("/api/documents/saveDocument", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: docId,
          content
        }),
        
      });
};

const loadDocument = async (docId) => {
  const res = await fetch(`/api/documents/${docId}`);
  if (!res.ok) {
    throw new Error("Failed to load document");
  }
  return res.json();
};


export default function DocumentEditor({ documentId }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState('');

  console.log(documentId);

  useEffect(() => {
    if (!documentId) return;

    const fetchDocument = async () => {
      try {
        setLoading(true);
        const data = await loadDocument(documentId);
        setContent(data.content || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);


  const deleteDocument = async (docId) => {
    //console.log("content:", content);
    await fetch("/api/documents/deleteDocument", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: docId
        }),
        
      });
};

  if (loading) return <div>Lade Dokument…</div>;

  return (
    <div className="bg-white rounded-md shadow p-4">
      
      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        placeholder="Start writing your document..."
      />
      <button onClick={() => saveDocument(content,documentId)} type="button">Save</button>
      <button onClick={() => deleteDocument(documentId)} type="button">Delete</button>
    </div>
    
  );
}
