"use client";

import { Upload, File as FileIcon, X } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
    onUpload: (files: File[]) => void;
    className?: string;
}

export function FileUploader({ onUpload, className }: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);

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
            }
        },
        [onUpload]
    );

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "relative group border-2 border-dashed rounded-xl p-8 transition-all duration-300 text-center cursor-pointer overflow-hidden",
                isDragging
                    ? "border-primary bg-primary/10 scale-[1.01]"
                    : "border-border hover:border-primary/50 hover:bg-muted/50",
                className
            )}
        >
            <input
                type="file"
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleChange}
                accept=".pdf,image/png,image/jpeg"
            />

            <div className="flex flex-col items-center gap-3">
                <div className={cn(
                    "p-3 rounded-full transition-colors",
                    isDragging ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                )}>
                    <Upload className="w-6 h-6" />
                </div>
                <div>
                    <p className="font-medium text-foreground">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        PDF, PNG, JPG (max 10MB)
                    </p>
                </div>
            </div>
        </div>
    );
}
