'use client'

import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

const Page = () => {
    const webcamRef = useRef<Webcam>(null);
    const [name, setName] = useState('');
    const [imageSrc, setImageSrc] = useState('');
    const [fileSize, setFileSize] = useState<number | null>(null);

    const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }, []);

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
                // Clear the form here if necessary
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };

    return (
        <div id="container">
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={handleNameChange}
                        required
                    />
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        style={{ margin: '10px 0' }}
                    />
                    <button type="button" onClick={capture}>Capture Photo</button>
                    {imageSrc && (
                        <div>
                            <img src={imageSrc} alt="Captured" style={{ margin: '10px 0' }} />
                            <p>File Size: {fileSize} bytes</p>
                            <button type="submit">Submit</button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Page;
