'use client'

// Page.tsx
// This component provides the main user interface for capturing photos,
// toggling the camera, and submitting data.

// Imports necessary React hooks, components from react-webcam, and styles.
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';

// Main functional component for the page.
const Page = () => {
    // Ref for the webcam component to capture screenshots.
    const webcamRef = useRef<Webcam>(null);

    // State hooks for managing form data and UI state.
    const [name, setName] = useState('');
    const [imageSrc, setImageSrc] = useState('');
    const [fileSize, setFileSize] = useState<number | null>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const [darkMode, setDarkMode] = useState(false);

    // Effect hook to toggle the 'dark' class on the root element based on darkMode state.
    useEffect(() => {
        const className = 'dark';
        const element = window.document.documentElement;
        if (darkMode) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    }, [darkMode]);

    // Handlers for form input, camera toggling, and photo capturing.
    const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }, []);

    const toggleCamera = useCallback(() => {
        setFacingMode(facingMode === "user" ? "environment" : "user");
    }, [facingMode]);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        setImageSrc(imageSrc || '');
        if (imageSrc) {
            fetch(imageSrc)
                .then((res) => res.blob())
                .then((blob) => {
                    setFileSize(blob.size);
                });
        }
    }, [webcamRef]);

    // Handler for form submission to the backend API.
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!name || fileSize === null) {
            console.error('Name and file size are required');
            return;
        }
        const payload = { name, fileSize };
        try {
            const postResponse = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await postResponse.json();
            if (!postResponse.ok) {
                console.error('Error:', data);
            } else {
                console.log('Success:', data);
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };

    // Render method providing the structure of the page with form inputs,
    // the webcam component, and the dark mode toggle switch.
    return (
        <div id="container">
            <div className="switch-container">
                <input
                    type="checkbox"
                    id="switch"
                    className="switch-input"
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                />
                <label htmlFor="switch" className="switch-label">
                    <span className="light-label">Light</span>
                    <span className="dark-label">Dark</span>
                </label>
            </div>
            <div className="form-container">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={handleNameChange}
                        required
                        className="text-input"
                    />
                    <div className="webcam-container">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode }}
                            className="webcam"
                        />
                        <button type="button" onClick={capture} className="button">Capture Photo</button>
                        <button type="button" onClick={toggleCamera} className="toggle-camera-btn">Switch Camera</button>
                    </div>
                    {imageSrc && (
                        <div>
                            <img src={imageSrc} alt="Captured" className="webcam-screenshot" />
                            <button type="submit" className="submit-btn">Submit</button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Page;
