export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    webViewLink?: string;
    thumbnailLink?: string;
    hasThumbnail?: boolean;
    createdTime?: string;
}

export interface Attraction {
    id: string;
    name: string;
    description?: string;
    addedAt: string;
}

export interface PlanEntry {
    id: string;
    title: string;
    location?: string;
    startDate: string;
    endDate: string;
    notes?: string;
    links?: { title: string; url: string }[];
    color?: string;
}

export interface Destination {
    id: string;
    name: string; // The folder name
    categories: Category[];
    attractions: Attraction[];
    plan: PlanEntry[];
    coverImage?: string; // Optional cover image URL
    createdTime: string; // ISO date string
    travelDate?: string; // ISO date string or just date string
    dueDate?: string; // ISO date string or just date string
    participants?: string[]; // List of names
}

export interface Category {
    id: string; // Folder ID
    name: string; // "Tickets", "Hotels", "Cars", or custom
    files: DriveFile[];
}

export type DriveFolder = {
    id: string;
    name: string;
};
