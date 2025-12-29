import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

//import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
//import { db } from '../../firebase';

const saveDocument = async (content,docId, title) => {
    //console.log("content:", content);
    await fetch("/api/documents/saveDocument", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: docId,
          content,
          title: title
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
  const [title, setTitle] = useState('');

  console.log(documentId);

  useEffect(() => {
    if (!documentId) return;

    const fetchDocument = async () => {
      try {
        setLoading(true);
        const data = await loadDocument(documentId);
        setTitle(data.title || "");
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

      <div className="mb-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title"
          className="w-full border px-2 py-1 rounded"
        />
      </div>

      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        placeholder="Start writing your document..."
      />
      <button onClick={() => saveDocument(content,documentId, title)} type="button">Save</button>
      <button onClick={() => deleteDocument(documentId)} type="button">Delete</button>
    </div>
    
  );
}
