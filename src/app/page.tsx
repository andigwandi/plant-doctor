"use client";
import Head from 'next/head';
import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import { ExecException, ExecOptions } from 'child_process';

interface PlantDetails {
    [key: string]: string;
}

const Home: React.FC = () => {
    const [plantInfo, setPlantInfo] = useState<PlantDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0); // Track upload progress
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = async (file: File) => {
        setLoading(true);
        setError(null);
        setUploadProgress(0); // Reset progress

        try {
            const formData = new FormData();
            formData.append('file', file);

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(progress);
                }
            });

            xhr.open('POST', '/process-image');
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        setPlantInfo(data);
                    } catch (e) {
                        setError(e.message || "Failed to parse response from server.");
                    }
                } else {
                    setError(`HTTP error! Status: ${xhr.status}`);
                }
                setLoading(false);
            };
            xhr.onerror = () => {
                setError("Network error occurred.");
                setLoading(false);
            };

            xhr.send(formData);

        } catch (e) {
            console.error("Error uploading image:", e);
            setError(e.message || "An error occurred while processing the image.");
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:mx-auto md:p-8 md:w-1/2 w-2 border border-gray-200 rounded-lg">
            <Head>
                <title>The Plant Doctor</title>
                <meta name="description" content="Identify plants from images" />
            </Head>

            <h1 className="text-3xl font-bold text-center">Plant Identifier</h1>
            <ImageUploader onImageUpload={handleImageUpload} />

            {error && <div className="text-red-500 mt-4">{error}</div>}

            {loading && (
                <div className="mt-4 mx-auto text-center">
                    <p>Processing image...</p>
                    <p>Uploading... {uploadProgress}%</p>
                    <progress value={uploadProgress} max="100" />
                </div>
            )}

            {plantInfo && (
                <div className="mt-4 text-center">
                    <h2 className="text-xl font-semibold mb-2">Plant Details:</h2>
                    {Object.entries(plantInfo).map(([key, value]) => (
                        <p key={key}><strong>{key}:</strong> {value}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
