import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

//import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
//import { db } from '../../firebase';

const saveEpic = async (content,epicId) => {
    //console.log("content:", content);
    await fetch("/api/epics/saveEpic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: epicId,
          content
        }),
        
      });
};

const loadEpic = async (epicId) => {
  const res = await fetch(`/api/epics/${epicId}`);
  if (!res.ok) {
    throw new Error("Failed to load epic");
  }
  return res.json();
};


export default function EpicEditor({ epicId }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState('');

  console.log(epicId);

  useEffect(() => {
    if (!epicId) return;

    const fetchEpic = async () => {
      try {
        setLoading(true);
        const data = await loadEpic(epicId);
        setContent(data.content || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEpic();
  }, [epicId]);


  const deleteEpic = async (epicId) => {
    //console.log("content:", content);
    await fetch("/api/epics/deleteEpic", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: epicId
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
        placeholder="Start writing your epic..."
      />
      <button onClick={() => saveEpic(content,epicId)} type="button">Save</button>
      <button onClick={() => deleteEpic(epicId)} type="button">Delete</button>
    </div>
    
  );
}
