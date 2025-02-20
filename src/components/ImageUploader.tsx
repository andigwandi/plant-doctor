import React from 'react';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <input type="file" accept="image/*" onChange={handleChange} className="mb-4" />
        </div>
    );
};

export default ImageUploader;
