"use client";

import { Upload } from "lucide-react";
import { useCallback, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface FileUploaderProps {
    onUpload: (files: File[]) => void;
    className?: string;
}

export function FileUploader({ onUpload, className }: FileUploaderProps) {
    const { dict } = useLanguage();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.length) {
                onUpload(Array.from(e.dataTransfer.files));
            }
        },
        [onUpload]
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files?.length) {
                onUpload(Array.from(e.target.files));
                // Reset input value to allow uploading same file again
                e.target.value = "";
            }
        },
        [onUpload]
    );

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className={cn("flex items-center", className)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleChange}
                accept=".pdf,image/png,image/jpeg"
            />

            <button
                onClick={handleClick}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
                    "border border-primary/20",
                    isDragging && "ring-2 ring-primary ring-offset-2 scale-105"
                )}
            >
                <Upload className="w-4 h-4" />
                <span>{dict.destination.upload}</span>
            </button>
            <p className="ml-4 text-xs text-muted-foreground hidden sm:block">
                PDF, PNG, JPG (max 10MB)
            </p>
        </div>
    );
}
