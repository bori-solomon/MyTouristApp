import { Destination, Category, DriveFile, Attraction, PlanEntry } from "@/types";
import { promises as fs } from "fs";
import path from "path";
import {
    getDriveClient,
    findOrCreateRootFolder,
    findOrCreateDestinationFolder,
    findOrCreateCategoryFolder,
    uploadFileToDrive,
    listFilesInFolder,
    deleteFileFromDrive,
    renameFileInDrive,
    saveDestinationMetadata,
    loadDestinationMetadata,
} from "./googleDrive";

const MOCK_DB_PATH = path.join(process.cwd(), "data", "mock_db.json");
const USE_MOCK = process.env.USE_MOCK_DATA === "true";

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

    try {
        const client = await getDriveClient();
        if (!client) {
            // Return empty array if not authenticated instead of throwing error
            return [];
        }

        const { drive } = client;
        const rootFolderId = await findOrCreateRootFolder(drive);

        // List all destination folders
        const response = await drive.files.list({
            q: `'${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: 'files(id, name, createdTime)',
        });

        const destinations: Destination[] = [];

        for (const folder of response.data.files || []) {
            try {
                const metadata = await loadDestinationMetadata(drive, folder.id);

                if (metadata) {
                    destinations.push({
                        ...metadata,
                        id: folder.id,
                        name: folder.name,
                    });
                } else {
                    // Create default structure if metadata doesn't exist
                    const dest: Destination = {
                        id: folder.id,
                        name: folder.name,
                        attractions: [],
                        categories: [],
                        createdTime: folder.createdTime,
                        travelDate: "",
                        dueDate: "",
                        participants: [],
                        plan: [],
                    };
                    destinations.push(dest);
                }
            } catch (metadataError) {
                console.error(`Error loading metadata for folder ${folder.name}:`, metadataError);
            }
        }

        return destinations;
    } catch (error: any) {
        console.error("FATAL ERROR in getDestinations:", error.message || error);
        if (error.response?.data) {
            console.error("Detailed API Error:", JSON.stringify(error.response.data, null, 2));
        }
        // Return empty array instead of throwing to prevent page crash
        // This allows the user to see the UI and click "Sign Out"
        return [];
    }
}

export async function getDestination(id: string): Promise<Destination | null> {
    if (USE_MOCK) {
        const destinations = await getMockData();
        return destinations.find(d => d.id === id) || null;
    }

    const client = await getDriveClient();
    if (!client) {
        throw new Error("Not authenticated");
    }

    const { drive } = client;

    try {
        const folder = await drive.files.get({
            fileId: id,
            fields: 'id, name, createdTime',
        });

        const metadata = await loadDestinationMetadata(drive, id);

        // List category folders
        const categoriesResponse = await drive.files.list({
            q: `'${id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: 'files(id, name)',
        });

        const categories: Category[] = [];

        for (const catFolder of categoriesResponse.data.files || []) {
            const files = await listFilesInFolder(drive, catFolder.id);

            categories.push({
                id: catFolder.id,
                name: catFolder.name,
                files: files.map(f => ({
                    id: f.id,
                    name: f.name,
                    mimeType: f.mimeType,
                    createdTime: f.createdTime,
                    webViewLink: f.webViewLink,
                })),
            });
        }

        return {
            id: folder.data.id,
            name: folder.data.name,
            createdTime: folder.data.createdTime,
            categories,
            attractions: metadata?.attractions || [],
            plan: metadata?.plan || [],
            travelDate: metadata?.travelDate || "",
            dueDate: metadata?.dueDate || "",
            participants: metadata?.participants || [],
        };
    } catch (error) {
        console.error("Error getting destination:", error);
        return null;
    }
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

    const client = await getDriveClient();
    if (!client) {
        throw new Error("Not authenticated");
    }

    const { drive } = client;
    const currentDest = await getDestination(id);

    if (!currentDest) {
        throw new Error("Destination not found");
    }

    const updatedMetadata = {
        ...currentDest,
        ...updates,
    };

    await saveDestinationMetadata(drive, id, updatedMetadata);
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
            dueDate: "",
            participants: [],
            plan: []
        };
        destinations.push(newDest);
        await saveMockData(destinations);
        return newDest;
    }

    const client = await getDriveClient();
    if (!client) {
        throw new Error("Not authenticated");
    }

    const { drive } = client;
    const rootFolderId = await findOrCreateRootFolder(drive);
    const destFolderId = await findOrCreateDestinationFolder(drive, rootFolderId, name);

    // Create default categories
    const defaultCategories = ["Visa/Docs", "Air Tickets", "Hotels", "Transport"];
    const categories: Category[] = [];

    for (const catName of defaultCategories) {
        const catFolderId = await findOrCreateCategoryFolder(drive, destFolderId, catName);
        categories.push({
            id: catFolderId,
            name: catName,
            files: [],
        });
    }

    const newDest: Destination = {
        id: destFolderId,
        name,
        attractions: [],
        categories,
        createdTime: new Date().toISOString(),
        travelDate: "",
        dueDate: "",
        participants: [],
        plan: [],
    };

    await saveDestinationMetadata(drive, destFolderId, newDest);

    return newDest;
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

    const client = await getDriveClient();
    if (!client) {
        throw new Error("Not authenticated");
    }

    const { drive } = client;
    const catFolderId = await findOrCreateCategoryFolder(drive, destId, categoryName);

    return {
        id: catFolderId,
        name: categoryName,
        files: [],
    };
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

    const client = await getDriveClient();
    if (!client) {
        throw new Error("Not authenticated");
    }

    const newAttr: Attraction = {
        id: `attr-${Date.now()}`,
        name,
        addedAt: new Date().toISOString()
    };

    const dest = await getDestination(destId);
    if (!dest) throw new Error("Destination not found");

    dest.attractions.push(newAttr);
    await updateDestination(destId, { attractions: dest.attractions });

    return newAttr;
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

    const client = await getDriveClient();
    if (!client) {
        throw new Error("Not authenticated");
    }

    const dest = await getDestination(destId);
    if (!dest) return;

    dest.attractions = dest.attractions.filter(a => a.id !== attrId);
    await updateDestination(destId, { attractions: dest.attractions });
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

    const client = await getDriveClient();
    if (!client) {
        throw new Error("Not authenticated");
    }

    const { drive } = client;
    const uploadedFile = await uploadFileToDrive(drive, categoryId, file);

    return {
        id: uploadedFile.id,
        name: uploadedFile.name,
        mimeType: uploadedFile.mimeType,
        createdTime: uploadedFile.createdTime,
        webViewLink: uploadedFile.webViewLink,
    };
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

    const client = await getDriveClient();
    if (!client) {
        throw new Error("Not authenticated");
    }

    const { drive } = client;
    await deleteFileFromDrive(drive, fileId);
}

export async function renameFile(destId: string, categoryId: string, fileId: string, newName: string): Promise<void> {
    if (USE_MOCK) {
        const destinations = await getMockData();
        const dest = destinations.find(d => d.id === destId);
        if (!dest) throw new Error("Destination not found");
        const cat = dest.categories.find(c => c.id === categoryId);
        if (cat) {
            const file = cat.files.find(f => f.id === fileId);
            if (file) {
                file.name = newName;
                await saveMockData(destinations);
            }
        }
        return;
    }

    const client = await getDriveClient();
    if (!client) {
        throw new Error("Not authenticated");
    }

    const { drive } = client;
    await renameFileInDrive(drive, fileId, newName);
}

export async function updatePlan(destId: string, plan: PlanEntry[]): Promise<void> {
    if (USE_MOCK) {
        const destinations = await getMockData();
        const dest = destinations.find(d => d.id === destId);
        if (!dest) throw new Error("Destination not found");
        dest.plan = plan;
        await saveMockData(destinations);
        return;
    }

    const client = await getDriveClient();
    if (!client) throw new Error("Not authenticated");

    const destination = await getDestination(destId);
    if (!destination) throw new Error("Destination not found");

    destination.plan = plan;

    await saveDestinationMetadata(
        client.drive,
        destId,
        {
            attractions: destination.attractions,
            travelDate: destination.travelDate,
            dueDate: destination.dueDate,
            participants: destination.participants,
            plan: destination.plan
        }
    );
}
