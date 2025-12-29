import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

//import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
//import { db } from '../../firebase';

const saveEpic = async (content,epicId, title) => {
    //console.log("content:", content);
    await fetch("/api/epics/saveEpic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: epicId,
          content,
          title: title
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
  const [title, setTitle] = useState('');

  console.log(epicId);

  useEffect(() => {
    if (!epicId) return;

    const fetchEpic = async () => {
      try {
        setLoading(true);
        const data = await loadEpic(epicId);
        setContent(data.content || "");
        setTitle(data.title || "");
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
        placeholder="Start writing your epic..."
      />
      <button onClick={() => saveEpic(content,epicId, title)} type="button">Save</button>
      <button onClick={() => deleteEpic(epicId)} type="button">Delete</button>
    </div>
    
  );
}
