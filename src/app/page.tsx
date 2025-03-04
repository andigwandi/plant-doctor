"use client";
import Head from 'next/head';
import { useState } from 'react';
import Image from 'next/image';
import ImageUploader from '@/components/ImageUploader';

interface PlantData {
    common_name?: string;
    scientific_name?: string;
    trivia?: string[] | string;
    health_status?: string;
    care_instructions?: string[] | string;
}

const Home: React.FC = () => {
    const [plantInfo, setPlantInfo] = useState<PlantData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0); // Track upload progress
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);  // New state for image URL

    const handleImageUpload = async (file: File) => {
        setLoading(true);
        setError(null);
        setUploadProgress(0); // Reset progress
        setSelectedImage(URL.createObjectURL(file)); // Set the selected image URL

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
    
    const renderTrivia = (trivia: string[] | string | undefined) => {
        if (Array.isArray(trivia)) {
            return (
                <ul>
                    {trivia.map((item, index) => (
                        <li key={index} className="text-gray-600">{item}</li>
                    ))}
                </ul>
            );
        } else if (typeof trivia === 'string') {
            return <p className="pb-2">{trivia}</p>;
        } else {
            return <p className="pb-2">No trivia available.</p>;
        }
    };

    const renderPlantInstructions = (care_instructions: string[] | string | undefined) => {
        if (Array.isArray(care_instructions)) {
            return (
                <ul>
                    {care_instructions.map((item, index) => (
                        <li key={index} className="pb-2">{item}</li>
                    ))}
                </ul>
            );
        } else if (typeof care_instructions ==='string') {
            return <p className="pb-2">{care_instructions}</p>;
        }
        else {
            return <p className="pb-2">No care instructions available.</p>;
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 py-8 min-h-screen">
            <div className="container mx-auto p-4 md:p-8 md:w-2/3 lg:w-1/2 rounded-lg shadow-md bg-white">
                <Head>
                    <title>The Plant Doctor</title>
                    <meta name="description" content="Identify plants from images" />
                </Head>

                <h1 className="text-3xl font-bold text-center text-green-700 mb-4">My Plant Doctor</h1>
                <div className="mb-10 mx-auto text-center text-gray-600">Upload an image of a plant to get details about it.</div>
                <ImageUploader onImageUpload={handleImageUpload} />

                {error && <div className="text-red-500 mt-4 text-center">{error}</div>}

                {loading && (
                    <div className="mt-4 mx-auto text-center">
                        <p className="text-gray-700">Processing image...</p>
                        <p className="text-sm text-gray-500">Uploading... {uploadProgress}%</p>
                        <progress value={uploadProgress} max="100" className="w-full h-2 rounded-full bg-gray-200 accent-green-500" />
                    </div>
                )}

                {/* Display the selected image */}
                {selectedImage && (
                    <div className="mt-6">
                        <Image src={selectedImage} alt="Uploaded Plant" className="max-w-full h-auto rounded-md shadow-md" width={500} height={500} />
                    </div>
                )}


                {plantInfo && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-green-600 mb-3 text-center">Plant Details</h2>
                        {plantInfo.common_name && <p className="pb-2"><strong className="text-gray-700">Common Name:</strong> {plantInfo.common_name}</p>}
                        {plantInfo.scientific_name && <p className="pb-2"><strong className="text-gray-700">Scientific Name:</strong> {plantInfo.scientific_name}</p>}
                        {plantInfo.health_status && <p className="pb-2"><strong className="text-gray-700">Health Status:</strong> {plantInfo.health_status}</p>}

                        {plantInfo.trivia && (
                            <div>
                                <strong className="text-gray-700">Trivia:</strong>
                                {renderTrivia(plantInfo.trivia)}
                            </div>
                        )}

                        {plantInfo.care_instructions && (
                            <div>
                                <strong className="text-gray-700">Care Instructions:</strong>
                                {renderPlantInstructions(plantInfo.care_instructions)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
};

export default Home;
