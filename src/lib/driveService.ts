import { Destination, Category, DriveFile, Attraction } from "@/types";
import { promises as fs } from "fs";
import path from "path";

const MOCK_DB_PATH = path.join(process.cwd(), "data", "mock_db.json");
const USE_MOCK = true; // Toggle this or check env

// Helper to read/write mock data
async function getMockData(): Promise<Destination[]> {
    try {
        const data = await fs.readFile(MOCK_DB_PATH, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading mock DB:", error);
        return [];
    }
}

async function saveMockData(data: Destination[]): Promise<void> {
    await fs.writeFile(MOCK_DB_PATH, JSON.stringify(data, null, 4), "utf-8");
}

export async function getDestinations(): Promise<Destination[]> {
    if (USE_MOCK) {
        return await getMockData();
    }
    // TODO: Real Drive Implementation
    return [];
}

export async function getDestination(id: string): Promise<Destination | null> {
    if (USE_MOCK) {
        const destinations = await getMockData();
        return destinations.find(d => d.id === id) || null;
    }
    return null;
}

export async function updateDestination(id: string, updates: Partial<Destination>): Promise<void> {
    if (USE_MOCK) {
        const destinations = await getMockData();
        const dest = destinations.find(d => d.id === id);
        if (dest) {
            Object.assign(dest, updates);
            await saveMockData(destinations);
        }
        return;
    }
    throw new Error("Not implemented");
}

export async function createDestination(name: string): Promise<Destination> {
    if (USE_MOCK) {
        const destinations = await getMockData();
        const newDest: Destination = {
            id: `dest-${Date.now()}`,
            name,
            attractions: [],
            categories: [
                { id: `cat-${Date.now()}-0`, name: "Visa/Docs", files: [] },
                { id: `cat-${Date.now()}-1`, name: "Air Tickets", files: [] },
                { id: `cat-${Date.now()}-2`, name: "Hotels", files: [] },
                { id: `cat-${Date.now()}-3`, name: "Transport", files: [] },
            ],
            createdTime: new Date().toISOString(),
            travelDate: "",
            participants: []
        };
        destinations.push(newDest);
        await saveMockData(destinations);
        return newDest;
    }
    throw new Error("Not implemented");
}

export async function createCategory(destId: string, categoryName: string): Promise<Category> {
    if (USE_MOCK) {
        const destinations = await getMockData();
        const dest = destinations.find(d => d.id === destId);
        if (!dest) throw new Error("Destination not found");
        const newCat: Category = {
            id: `cat-${Date.now()}`,
            name: categoryName,
            files: []
        };
        dest.categories.push(newCat);
        await saveMockData(destinations);
        return newCat;
    }
    throw new Error("Not implemented");
}

export async function addAttraction(destId: string, name: string): Promise<Attraction> {
    if (USE_MOCK) {
        const destinations = await getMockData();
        const dest = destinations.find(d => d.id === destId);
        if (!dest) throw new Error("Destination not found");
        const newAttr: Attraction = {
            id: `attr-${Date.now()}`,
            name,
            addedAt: new Date().toISOString()
        };
        dest.attractions.push(newAttr);
        await saveMockData(destinations);
        return newAttr;
    }
    throw new Error("Not implemented");
}

export async function removeAttraction(destId: string, attrId: string): Promise<void> {
    if (USE_MOCK) {
        const destinations = await getMockData();
        const dest = destinations.find(d => d.id === destId);
        if (dest) {
            dest.attractions = dest.attractions.filter(a => a.id !== attrId);
            await saveMockData(destinations);
        }
        return;
    }
    throw new Error("Not implemented");
}

export async function uploadFile(destId: string, categoryId: string, file: File): Promise<DriveFile> {
    if (USE_MOCK) {
        const destinations = await getMockData();
        const dest = destinations.find(d => d.id === destId);
        if (!dest) throw new Error("Destination not found");
        const cat = dest.categories.find(c => c.id === categoryId);
        if (!cat) throw new Error("Category not found");

        const newFile: DriveFile = {
            id: `file-${Date.now()}`,
            name: file.name,
            mimeType: file.type || "application/octet-stream",
            createdTime: new Date().toISOString()
        };
        cat.files.push(newFile);
        await saveMockData(destinations);
        return newFile;
    }
    throw new Error("Not implemented");
}

export async function deleteFile(destId: string, categoryId: string, fileId: string): Promise<void> {
    if (USE_MOCK) {
        const destinations = await getMockData();
        const dest = destinations.find(d => d.id === destId);
        if (!dest) throw new Error("Destination not found");
        const cat = dest.categories.find(c => c.id === categoryId);
        if (cat) {
            cat.files = cat.files.filter(f => f.id !== fileId);
            await saveMockData(destinations);
        }
        return;
    }
    throw new Error("Not implemented");
}
