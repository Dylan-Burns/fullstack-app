'use client';

/**
 * @file page.tsx
 * @description This component serves as the main user interface for capturing photos, toggling the camera,
 *              and submitting data. It utilizes React hooks for managing state and effects, and integrates
 *              with the `react-webcam` for webcam functionalities.
 * @version 0.0.1
 * @author Dylan-Burns
 * @date 04/03/2024
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import Image from 'next/image';

/**
 * Represents the main page component where users can interact with the webcam,
 * switch between camera modes, and submit their captured images along with some data.
 * 
 * @returns {JSX.Element} The rendered component with form and webcam functionalities.
 */
const Page: React.FC = () => {
    // Ref for the webcam component to capture screenshots.
    const webcamRef = useRef<Webcam>(null);

    // State hooks for managing form data and UI state.
    const [name, setName] = useState<string>('');
    const [imageSrc, setImageSrc] = useState<string>('');
    const [fileSize, setFileSize] = useState<number | null>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const [darkMode, setDarkMode] = useState<boolean>(false);

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

    /**
     * Handles changes to the 'name' input field.
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} event - The event object associated with the input change.
     */
    const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }, []);

/**
 * Toggles the camera between front and back on devices that support it.
 * Displays an alert if the action is attempted on a desktop device.
 */
const toggleCamera = useCallback(() => {
    // Check if the device is a mobile device
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobileDevice) {
        // If it's not a mobile device, display an alert
        alert("Switching the camera is only available on mobile devices.");
        return; // Exit the function to prevent further execution
    }

    // Logic to switch the camera
    setFacingMode(facingMode === "user" ? "environment" : "user");
}, [facingMode]);



    /**
     * Captures a screenshot from the webcam.
     */
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


    /**
     * Handles the form submission to a backend API with the captured data.
     * 
     * @param {React.FormEvent<HTMLFormElement>} event - The form event triggered on submission.
     */
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
                        autoComplete='off'
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
                            <Image src={imageSrc} alt="Captured" className="webcam-screenshot" />
                            <button type="submit" className="submit-btn">Submit</button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Page;
