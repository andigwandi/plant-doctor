"use client";
import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
    const [hasCamera, setHasCamera] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
    };

    const handleCameraClick = async () => {
        if (!hasCamera) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setIsCameraActive(true);
                    setHasCamera(true);
                }
            } catch (error) {
                console.error("Error accessing camera:", error);
            }
        } else {
            setIsCameraActive(prevState => !prevState);
            if (isCameraActive && videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
            setHasCamera(false);
        }
    };

    const handleCaptureClick = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "capturedImage.jpg", { type: "image/jpeg" });
                    onImageUpload(file);
                }
            }, 'image/jpeg');
            setIsCameraActive(false);
            setHasCamera(false);

            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null; // Clear the srcObject
            }
        }
    };

    return (
        <div className="flex flex-col items-center">
            <input type="file" accept="image/*" onChange={handleChange} className="mb-4" />
            <button onClick={handleCameraClick} className="px-4 py-2 bg-blue-500 text-white rounded mb-4">
                {hasCamera ? 'Stop Camera' : 'Use Camera'}
            </button>
            {hasCamera && (
                <div className="relative">
                    <video ref={videoRef} autoPlay className="w-64 h-48" style={{ display: isCameraActive ? 'block' : 'none' }} />
                    <canvas ref={canvasRef} className="hidden" />
                    <button onClick={handleCaptureClick} className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-green-500 text-white rounded">Capture</button>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
