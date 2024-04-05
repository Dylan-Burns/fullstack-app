'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';

const Page = () => {
    const webcamRef = useRef<Webcam>(null);
    const [name, setName] = useState('');
    const [imageSrc, setImageSrc] = useState('');
    const [fileSize, setFileSize] = useState<number | null>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const className = 'dark';
        const element = window.document.documentElement;
        if (darkMode) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    }, [darkMode]);

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

    return (
        <div id="container">
            {/* Toggle switch for dark mode */}
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
                            {/*<p>File Size: {fileSize} bytes</p>*/}
                            <button type="submit" className="submit-btn">Submit</button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Page;
