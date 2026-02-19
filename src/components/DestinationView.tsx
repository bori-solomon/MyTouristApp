"use client";

import { Destination, DriveFile } from "@/types";
import { useState } from "react";
import { FileText, Image as ImageIcon, Plus, ExternalLink, Loader2, Trash2, LayoutGrid, List, Edit2, X, Check, ArrowLeft, Calendar, Clock, Users, Plane, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileUploader } from "./FileUploader";
import { AttractionList } from "./AttractionList";
import { TripPlanView } from "./TripPlanView";
import {
    addNewAttraction,
    addNewCategory,
    deleteAttraction,
    uploadFileAction,
    deleteFileAction,
    renameFileAction,
    updateDestinationAction
} from "@/app/actions";
import { useLanguage } from "@/contexts/LanguageContext";
import { format, isFuture } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DestinationViewProps {
    destination: Destination;
}

export function DestinationView({ destination }: DestinationViewProps) {
    const { dict } = useLanguage();
    const router = useRouter();

    // Find initial category based on visual order: Plan -> Visa/Docs -> Air Tickets -> Hotels -> Transport -> Attractions
    const getInitialCategory = () => {
        const order = ["plan", "Visa/Docs", "Air Tickets", "Hotels", "Transport"];
        for (const name of order) {
            if (name === "plan") return "plan";
            const cat = destination.categories.find(c => c.name === name);
            if (cat) return cat.id;
        }
        return "attractions";
    };

    const [activeCategoryId, setActiveCategoryId] = useState<string>(getInitialCategory());
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        travelDate: destination.travelDate || "",
        dueDate: destination.dueDate || "",
        participants: destination.participants?.join(", ") || "",
        flightOut: destination.flightOut || "",
        flightReturn: destination.flightReturn || "",
        comment: destination.comment || "",
    });
    const [isSaving, setIsSaving] = useState(false);

    const activeCategory = destination.categories.find(c => c.id === activeCategoryId);
    const isUpcoming = destination.travelDate ? isFuture(new Date(destination.travelDate)) : false;

    const handleSaveDetails = async () => {
        setIsSaving(true);
        const updates = {
            travelDate: editForm.travelDate,
            dueDate: editForm.dueDate,
            participants: editForm.participants.split(",").map(p => p.trim()).filter(Boolean),
            flightOut: editForm.flightOut,
            flightReturn: editForm.flightReturn,
            comment: editForm.comment,
        };

        const result = await updateDestinationAction(destination.id, updates);
        setIsSaving(false);

        if (result.success) {
            setIsEditing(false);
            router.refresh();
        } else {
            alert("Failed to update trip details.");
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        await addNewCategory(destination.id, newCategoryName);
        setNewCategoryName("");
        setIsAddingCategory(false);
    };

    const handleUpload = async (files: File[]) => {
        if (!activeCategoryId) return;
        setIsUploading(true);

        try {
            await Promise.all(files.map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);
                await uploadFileAction(destination.id, activeCategoryId, formData);
            }));
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddAttraction = async (name: string) => {
        await addNewAttraction(destination.id, name);
    };

    const handleRemoveAttraction = async (id: string) => {
        await deleteAttraction(destination.id, id);
    };

    const handleDeleteFile = async (fileId: string) => {
        if (!activeCategoryId) return;
        if (confirm(dict.common.confirmDelete)) {
            await deleteFileAction(destination.id, activeCategoryId, fileId);
        }
    };

    const handleRenameFile = async (fileId: string, currentName: string) => {
        if (!activeCategoryId) return;
        const newName = prompt("Enter new name:", currentName);
        if (newName && newName !== currentName) {
            await renameFileAction(destination.id, activeCategoryId, fileId, newName);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/30 hover:bg-muted text-foreground hover:text-primary transition-all mb-6 font-medium active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className={cn(
                    "relative rounded-3xl overflow-hidden bg-card border border-border flex items-end p-6 sm:p-8 transition-all duration-300",
                    isEditing ? "min-h-[350px]" : "min-h-[200px] aspect-auto sm:aspect-[5/1]"
                )}>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-background to-background" />
                    <div className="relative z-10 w-full">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <h1 className={`text-3xl sm:text-5xl font-bold tracking-tight mb-2 ${isUpcoming ? "text-yellow-400" : ""}`}>
                                    {destination.name}
                                </h1>
                                <p className="text-muted-foreground text-sm sm:text-lg">
                                    Plan and organize your trip details
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <button
                                    onClick={() => isEditing ? handleSaveDetails() : setIsEditing(true)}
                                    disabled={isSaving}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                        isEditing
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                            : "bg-background/40 backdrop-blur-sm border border-border/50 hover:bg-background/60"
                                    )}
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : isEditing ? (
                                        <>
                                            <Check className="w-4 h-4" /> Save
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 className="w-4 h-4" /> Edit Details
                                        </>
                                    )}
                                </button>

                                <div className="flex flex-wrap items-center justify-end gap-4 bg-background/40 backdrop-blur-sm p-4 rounded-2xl border border-border/50">
                                    {isEditing ? (
                                        <div className="flex flex-col gap-4 w-full">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                                                <div className="space-y-4 p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Plane className="w-4 h-4 text-green-400" />
                                                        <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Outbound</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Date</label>
                                                            <input
                                                                type="date"
                                                                value={editForm.travelDate}
                                                                onChange={e => setEditForm(prev => ({ ...prev, travelDate: e.target.value }))}
                                                                className="bg-background/80 border border-border rounded-md px-2 py-1 text-sm w-full"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Flight Time</label>
                                                            <input
                                                                type="text"
                                                                placeholder="10:00-14:30"
                                                                value={editForm.flightOut}
                                                                onChange={e => setEditForm(prev => ({ ...prev, flightOut: e.target.value }))}
                                                                className="bg-background/80 border border-border rounded-md px-2 py-1 text-sm w-full"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Plane className="w-4 h-4 text-red-400 rotate-180" />
                                                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Return</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Date</label>
                                                            <input
                                                                type="date"
                                                                value={editForm.dueDate}
                                                                onChange={e => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                                                className="bg-background/80 border border-border rounded-md px-2 py-1 text-sm w-full"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Flight Time</label>
                                                            <input
                                                                type="text"
                                                                placeholder="16:00-20:15"
                                                                value={editForm.flightReturn}
                                                                onChange={e => setEditForm(prev => ({ ...prev, flightReturn: e.target.value }))}
                                                                className="bg-background/80 border border-border rounded-md px-2 py-1 text-sm w-full"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                                <div className="flex flex-col gap-1 flex-1">
                                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">People</label>
                                                    <input
                                                        type="text"
                                                        placeholder="John, Jane..."
                                                        value={editForm.participants}
                                                        onChange={e => setEditForm(prev => ({ ...prev, participants: e.target.value }))}
                                                        className="bg-background/80 border border-border rounded-md px-3 py-2 text-sm w-full shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-semibold text-muted-foreground uppercase">Comment</label>
                                                <textarea
                                                    placeholder="Any notes about this trip..."
                                                    value={editForm.comment}
                                                    onChange={e => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                                                    rows={2}
                                                    className="bg-background/80 border border-border rounded-md px-2 py-1 text-sm w-full resize-none"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-wrap items-center gap-4">
                                                <div className="flex items-center gap-4 py-1.5 px-3 rounded-xl bg-green-500/10 border border-green-500/20 shadow-sm">
                                                    <Plane className="w-4 h-4 text-green-400" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-green-400/80 uppercase leading-none mb-1">Outbound</span>
                                                        <div className="flex items-center gap-2">
                                                            {destination.travelDate ? (
                                                                <span className="font-semibold text-sm">{format(new Date(destination.travelDate), "MMM d")}</span>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground italic">No date</span>
                                                            )}
                                                            {destination.flightOut && (
                                                                <span className="text-xs font-medium text-foreground/80 bg-background/50 px-1.5 py-0.5 rounded shadow-inner">{destination.flightOut}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 py-1.5 px-3 rounded-xl bg-red-500/10 border border-red-500/20 shadow-sm">
                                                    <Plane className="w-4 h-4 text-red-400 rotate-180" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-red-400/80 uppercase leading-none mb-1">Return</span>
                                                        <div className="flex items-center gap-2">
                                                            {destination.dueDate ? (
                                                                <span className="font-semibold text-sm">{format(new Date(destination.dueDate), "MMM d")}</span>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground italic">No date</span>
                                                            )}
                                                            {destination.flightReturn && (
                                                                <span className="text-xs font-medium text-foreground/80 bg-background/50 px-1.5 py-0.5 rounded shadow-inner">{destination.flightReturn}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="w-px h-10 bg-border/40 mx-1 hidden sm:block" />

                                                {destination.participants && destination.participants.length > 0 ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-bold text-blue-400/80 uppercase leading-none">People</span>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Users className="w-4 h-4 text-blue-400" />
                                                            <span className="font-medium">{destination.participants.join(", ")}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic flex items-center gap-2">
                                                        <Users className="w-4 h-4" /> No people
                                                    </span>
                                                )}

                                                {destination.comment && (
                                                    <>
                                                        <div className="w-px h-10 bg-border/40 mx-1 hidden sm:block" />
                                                        <div className="flex flex-col gap-1 max-w-[200px]">
                                                            <span className="text-[10px] font-bold text-violet-400/80 uppercase leading-none">Notes</span>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <MessageSquare className="w-4 h-4 text-violet-400 flex-shrink-0" />
                                                                <span className="font-medium truncate">{destination.comment}</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setActiveCategoryId("plan")}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                        activeCategoryId === "plan"
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                >
                    {dict.destination.tabs.plan}
                </button>

                {/* 1. Main 4 Categories in specific order */}
                {["Visa/Docs", "Air Tickets", "Hotels", "Transport"].map(name => {
                    const cat = destination.categories.find(c => c.name === name);
                    if (!cat) return null;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategoryId(cat.id)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                                activeCategoryId === cat.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            {cat.name === "Visa/Docs" ? dict.destination.tabs.visaDocs :
                                cat.name === "Air Tickets" ? dict.destination.tabs.airTickets :
                                    cat.name === "Hotels" ? dict.destination.tabs.hotels :
                                        cat.name === "Transport" ? dict.destination.tabs.transport : cat.name}
                        </button>
                    );
                })}

                {/* 2. Attractions Tab - requested after Transport */}
                <button
                    onClick={() => setActiveCategoryId("attractions")}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                        activeCategoryId === "attractions"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                >
                    {dict.destination.tabs.attractions}
                </button>

                {/* 3. Any Other Categories */}
                {destination.categories
                    .filter(cat => !["Visa/Docs", "Air Tickets", "Hotels", "Transport"].includes(cat.name))
                    .map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategoryId(cat.id)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                                activeCategoryId === cat.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}

                {/* 4. Add Category Button */}
                {isAddingCategory ? (
                    <form onSubmit={handleAddCategory} className="flex items-center gap-2">
                        <input
                            className="bg-background border border-border rounded-full px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Name..."
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                            <Plus className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => setIsAddingCategory(false)} className="p-1.5 text-muted-foreground hover:text-foreground">
                            <X className="w-4 h-4" />
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={() => setIsAddingCategory(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm border border-dashed border-border"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{dict.destination.addCategory}</span>
                    </button>
                )}
            </div>

            {/* Content Area */}
            {activeCategoryId === "plan" ? (
                <TripPlanView destination={destination} />
            ) : activeCategoryId === "attractions" ? (
                <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 min-h-[400px]">
                    <AttractionList
                        attractions={destination.attractions}
                        onAdd={handleAddAttraction}
                        onRemove={handleRemoveAttraction}
                    />
                </div>
            ) : activeCategory ? (
                <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold">
                                {activeCategory.name === "Visa/Docs" ? dict.destination.tabs.visaDocs :
                                    activeCategory.name === "Air Tickets" ? dict.destination.tabs.airTickets :
                                        activeCategory.name === "Hotels" ? dict.destination.tabs.hotels :
                                            activeCategory.name === "Transport" ? dict.destination.tabs.transport : activeCategory.name}
                            </h2>
                            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={cn(
                                        "p-1.5 rounded-md transition-colors",
                                        viewMode === "grid" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                    )}
                                    title="Grid View"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={cn(
                                        "p-1.5 rounded-md transition-colors",
                                        viewMode === "list" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                    )}
                                    title="List View"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{activeCategory.files.length} {dict.destination.documents}</span>
                    </div>

                    <div className="mb-8">
                        <FileUploader onUpload={handleUpload} />
                        {isUploading && (
                            <div className="flex items-center justify-center py-4 text-primary animate-pulse">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                {dict.destination.uploading}
                            </div>
                        )}
                    </div>

                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeCategory.files.map(file => (
                                <FileCard
                                    key={file.id}
                                    file={file}
                                    onDelete={() => handleDeleteFile(file.id)}
                                    onRename={() => handleRenameFile(file.id, file.name)}
                                />
                            ))}
                            {activeCategory.files.length === 0 && !isUploading && (
                                <p className="col-span-full text-center text-muted-foreground py-8 italic">
                                    {dict.destination.noDocuments}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {activeCategory.files.length > 0 && (
                                <div className="hidden sm:flex items-center gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border mb-2">
                                    <div className="w-10">Icon</div>
                                    <div className="flex-1">Name</div>
                                    <div className="w-40">Date</div>
                                    <div className="w-10"></div>
                                </div>
                            )}
                            {activeCategory.files.map(file => (
                                <FileListItem
                                    key={file.id}
                                    file={file}
                                    onDelete={() => handleDeleteFile(file.id)}
                                    onRename={() => handleRenameFile(file.id, file.name)}
                                />
                            ))}
                            {activeCategory.files.length === 0 && !isUploading && (
                                <p className="text-center text-muted-foreground py-8 italic">
                                    {dict.destination.noDocuments}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 bg-card rounded-2xl border border-dashed text-muted-foreground">
                    Select or create a category to view files.
                </div>
            )}
        </div>
    );
}

function FileListItem({ file, onDelete, onRename }: { file: DriveFile; onDelete: () => void; onRename: () => void }) {
    const { dict } = useLanguage();
    const isImage = file.mimeType.startsWith("image/");

    return (
        <div className="group relative flex items-center gap-4 p-3 rounded-xl border border-border bg-muted/10 hover:bg-muted/30 transition-all">
            <a
                href={file.webViewLink || undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button')) {
                        e.preventDefault();
                        return;
                    }
                    if (!file.webViewLink) {
                        e.preventDefault();
                        alert("Mock Mode: File content is not available for download.");
                    }
                }}
                className="flex flex-1 items-center gap-4 min-w-0"
            >
                <div className={cn(
                    "p-2 rounded-lg flex-shrink-0",
                    isImage ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                )}>
                    {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{file.name}</p>
                </div>
                <div className="hidden sm:block w-40 text-xs text-muted-foreground" suppressHydrationWarning>
                    {file.createdTime ? new Date(file.createdTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : dict.common.unknownDate}
                </div>
            </a>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRename();
                    }}
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    title="Rename"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

function FileCard({ file, onDelete, onRename }: { file: DriveFile; onDelete: () => void; onRename: () => void }) {
    const isImage = file.mimeType.startsWith("image/");


    return (
        <div className="relative group">
            <a
                href={file.webViewLink || undefined}
                target="_blank"
                rel="noopener noreferrer"
                download={file.name}
                onClick={(e) => {
                    // Prevent navigation if clicking menu button or if mock
                    if ((e.target as HTMLElement).closest('button')) {
                        e.preventDefault();
                        return;
                    }
                    if (!file.webViewLink) {
                        e.preventDefault();
                        alert("Mock Mode: File content is not available for download.");
                    }
                }}
                className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/30 transition-all pr-10",
                    file.webViewLink
                        ? "hover:bg-muted/60 hover:border-primary/30 cursor-pointer"
                        : "cursor-not-allowed opacity-70"
                )}
            >
                <div className={cn(
                    "p-2.5 rounded-lg flex-shrink-0",
                    isImage ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                )}>
                    {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5" suppressHydrationWarning>
                        {file.createdTime ? new Date(file.createdTime).toLocaleDateString() : 'Unknown date'}
                    </p>
                </div>
            </a>

            {/* Action Buttons */}
            <div className="absolute top-3 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRename();
                    }}
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    title="Rename"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

function XIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
