import React, { useRef, useState, useEffect } from 'react';
import './Whiteboard.css';

// You can pass this as a prop later, but for now we use the ID from your screenshot
const WHITEBOARD_ID = "5wVZYcO7CCqJ9YXEhY0I"; 

const Whiteboard = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(5);

    // --- API FUNCTIONS (Matching your DocumentEditor pattern) ---

    const saveWhiteboard = async (content) => {
        try {
            await fetch("/api/whiteboards/save", { // You might need to create this route on your server
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: WHITEBOARD_ID,
                    content: content, // This is the Base64 image string
                    title: "Whiteboard Drawing" 
                }),
            });
            console.log("Whiteboard saved successfully!");
        } catch (error) {
            console.error("Error saving whiteboard:", error);
        }
    };

    const loadWhiteboard = async () => {
        try {
            const res = await fetch(`/api/whiteboards/${WHITEBOARD_ID}`);
            if (!res.ok) throw new Error("Failed to load whiteboard");
            
            const data = await res.json();
            if (data.content) {
                loadImageOnCanvas(data.content);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // --- CANVAS HELPERS ---

    const loadImageOnCanvas = (base64Image) => {
        const img = new Image();
        img.src = base64Image;
        img.onload = () => {
            const canvas = canvasRef.current;
            // Clear before drawing new image
            contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
            // Draw image to fit canvas size
            contextRef.current.drawImage(img, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
        };
    };

    // --- HOOKS ---

    // Hook 1: Canvas Setup
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        canvas.style.width = `${canvas.offsetWidth}px`;
        canvas.style.height = `${canvas.offsetHeight}px`;

        const context = canvas.getContext("2d");
        context.scale(2, 2);
        context.lineCap = "round";
        contextRef.current = context;

        // Load data when component mounts
        loadWhiteboard();
    }, []);

    // Hook 2: Updates
    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = lineWidth;
        }
    }, [color, lineWidth]);

    // --- DRAWING LOGIC ---

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    const handleSaveClick = () => {
        if (!canvasRef.current) return;
        // Convert canvas to Base64 string
        const imageContent = canvasRef.current.toDataURL("image/png");
        saveWhiteboard(imageContent);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Optional: Save empty state to backend immediately
        // saveWhiteboard(""); 
    };

    return (
        <div className="whiteboard-wrapper">
            <div className="whiteboard-toolbar">
                <div className="tool-group">
                    <label>Color:</label>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
                <div className="tool-group">
                    <label>Boldness:</label>
                    <input type="range" min="1" max="20" value={lineWidth} onChange={(e) => setLineWidth(e.target.value)} />
                </div>
                <button onClick={clearCanvas} className="btn btn-danger clear-btn">Delete/Clear</button>
                
                {/* NEW SAVE BUTTON */}
                <button onClick={handleSaveClick} style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}>
                    💾 Save Whiteboard
                </button>
            </div>
            <div className="canvas-container">
                <canvas
                    onMouseDown={startDrawing}
                    onMouseUp={finishDrawing}
                    onMouseMove={draw}
                    ref={canvasRef}
                    className="whiteboard-canvas"
                />
            </div>
        </div>
    );
};

export default Whiteboard;