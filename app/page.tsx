'use client'

import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

const Page = () => {
    const webcamRef = useRef<Webcam>(null);
    const [name, setName] = useState('');
    const [imageSrc, setImageSrc] = useState('');
    const [fileSize, setFileSize] = useState<number | null>(null);
    // State to toggle between front and back camera
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

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

        // Ensure name and fileSize are provided
        if (!name || fileSize === null) {
            console.error('Name and file size are required');
            return;
        }

        const payload = {
            name,
            fileSize,
        };


        console.log(payload.name)
        console.log(payload.fileSize)
        // Fetch call to the server
        try {
            const postResponse = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
            <div className="form-container">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    {/* Your existing form elements */}
                    <div className="webcam-container">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode }}
                            className="webcam"
                        />
                        <button type="button" onClick={capture} className="button">Capture Photo</button>
                        {/* Button to toggle between front and back camera */}
                        <button type="button" onClick={toggleCamera} className="toggle-camera-btn">
                            Switch Camera
                        </button>
                    </div>
                    {/* Your existing img and submit button elements */}
                </form>
            </div>
        </div>
    );
};

export default Page;
