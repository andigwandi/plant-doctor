"use client";
import Head from 'next/head';
import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';

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
                    } catch (e: unknown) {
                        if (e instanceof Error) {
                            setError(e.message || "Failed to parse response from server.");
                        } else {
                            setError("Failed to parse response from server.");
                        }
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

        } catch (e: unknown) {
            console.error("Error uploading image:", e);
            if (e instanceof Error) {
                setError(e.message || "An error occurred while processing the image.");
            } else {
                setError("Failed to upload image.");
            }
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-green-100 to-green-50 py-8 min-h-screen">
            <div className="container mx-auto p-4 md:p-8 md:w-2/3 lg:w-1/2 rounded-lg shadow-md bg-white">
                <Head>
                    <title>The Plant Doctor</title>
                    <meta name="description" content="Identify plants from images" />
                </Head>

                <h1 className="text-3xl font-bold text-center text-green-700 mb-4">My Plant Doctor</h1>
                <ImageUploader onImageUpload={handleImageUpload} />

                {error && <div className="text-red-500 mt-4 text-center">{error}</div>}

                {loading && (
                    <div className="mt-4 mx-auto text-center">
                        <p className="text-gray-700">Processing image...</p>
                        <p className="text-sm text-gray-500">Uploading... {uploadProgress}%</p>
                        <progress value={uploadProgress} max="100" className="w-full h-2 rounded-full bg-gray-200 accent-green-500" />
                    </div>
                )}

                {plantInfo && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-green-600 mb-3 text-center">Plant Details:</h2>
                        {Object.entries(plantInfo).map(([key, value]) => (
                            <div key={key} className="mb-2">
                                <strong className="text-gray-700">{key}:</strong>
                                <p className="text-gray-600">{value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
