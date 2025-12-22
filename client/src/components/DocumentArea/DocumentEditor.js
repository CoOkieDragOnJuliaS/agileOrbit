import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

//import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
//import { db } from '../../firebase';

const saveDocument = async (content) => {
    //console.log("content:", content);
    await fetch("/api/documents/saveDocument", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content
        })
      });
};


export default function DocumentEditor() {
  const [content, setContent] = useState('');

  return (
    <div className="bg-white rounded-md shadow p-4">
      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        placeholder="Start writing your document..."
      />
      <button onClick={() => saveDocument(content)} type="button">Save</button>
    </div>
    
  );
}
