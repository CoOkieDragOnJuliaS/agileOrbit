import React, { useRef, useState, useEffect } from 'react';
import './Whiteboard.css';

const Whiteboard = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(5);

    // Hook 1: Nur Canvas-Setup (Einmalig beim Start)
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
    }, []);

    // Hook 2: Nur Updates für Farbe und Linienstärke
    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = lineWidth;
        }
    }, [color, lineWidth]); // Hier sind die Abhängigkeiten korrekt

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

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <div className="whiteboard-wrapper">
            <div className="whiteboard-toolbar">
                <div className="tool-group">
                    <label>Farbe:</label>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
                <div className="tool-group">
                    <label>Stärke:</label>
                    <input type="range" min="1" max="20" value={lineWidth} onChange={(e) => setLineWidth(e.target.value)} />
                </div>
                <button onClick={clearCanvas} className="clear-btn">Löschen</button>
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