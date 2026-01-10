import { google } from 'googleapis';
import { auth } from './auth';

export interface GoogleDriveClient {
    drive: any;
    auth: any;
}

/**
 * Initialize Google Drive client with user's access token
 */
export async function getDriveClient(): Promise<GoogleDriveClient | null> {
    const session = await auth();

    if (!session || !session.accessToken) {
        return null;
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: session.accessToken as string,
        refresh_token: session.refreshToken as string,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    return { drive, auth: oauth2Client };
}

/**
 * Find or create the root folder for the app (e.g., "4myTouristApp")
 */
export async function findOrCreateRootFolder(drive: any): Promise<string> {
    const folderName = process.env.DRIVE_FOLDER_NAME || '4myTouristApp';

    try {
        console.log(`Searching for root folder: ${folderName}`);
        // Search for existing folder
        const response = await drive.files.list({
            q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        if (response.data.files && response.data.files.length > 0) {
            console.log(`Found existing root folder: ${response.data.files[0].id}`);
            return response.data.files[0].id;
        }

        console.log(`Root folder not found, creating: ${folderName}`);
        // Create folder if it doesn't exist
        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
        };

        const folder = await drive.files.create({
            requestBody: folderMetadata,
            fields: 'id',
        });

        console.log(`Created root folder: ${folder.data.id}`);
        return folder.data.id;
    } catch (error: any) {
        console.error("Error in findOrCreateRootFolder:", error.message || error);
        if (error.response?.data) {
            console.error("API Error Details:", JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

/**
 * Find or create a destination folder within the root folder
 */
export async function findOrCreateDestinationFolder(
    drive: any,
    rootFolderId: string,
    destinationName: string
): Promise<string> {
    // Search for existing destination folder
    const response = await drive.files.list({
        q: `name='${destinationName}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
    }

    // Create destination folder
    const folderMetadata = {
        name: destinationName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [rootFolderId],
    };

    const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
    });

    return folder.data.id;
}

/**
 * Find or create a category folder within a destination folder
 */
export async function findOrCreateCategoryFolder(
    drive: any,
    destinationFolderId: string,
    categoryName: string
): Promise<string> {
    // Search for existing category folder
    const response = await drive.files.list({
        q: `name='${categoryName}' and '${destinationFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
    }

    // Create category folder
    const folderMetadata = {
        name: categoryName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [destinationFolderId],
    };

    const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
    });

    return folder.data.id;
}

/**
 * Upload a file to a specific category folder
 */
export async function uploadFileToDrive(
    drive: any,
    categoryFolderId: string,
    file: File
): Promise<any> {
    const buffer = Buffer.from(await file.arrayBuffer());

    const fileMetadata = {
        name: file.name,
        parents: [categoryFolderId],
    };

    const media = {
        mimeType: file.type,
        body: require('stream').Readable.from(buffer),
    };

    const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, mimeType, createdTime, webViewLink',
    });

    return response.data;
}

/**
 * List files in a folder
 */
export async function listFilesInFolder(drive: any, folderId: string): Promise<any[]> {
    const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, createdTime, webViewLink)',
        spaces: 'drive',
    });

    return response.data.files || [];
}

/**
 * Delete a file from Drive
 */
export async function deleteFileFromDrive(drive: any, fileId: string): Promise<void> {
    await drive.files.delete({
        fileId: fileId,
    });
}

/**
 * Rename a file in Drive
 */
export async function renameFileInDrive(drive: any, fileId: string, newName: string): Promise<void> {
    await drive.files.update({
        fileId: fileId,
        requestBody: {
            name: newName,
        },
    });
}

/**
 * Save destination metadata as a JSON file in the destination folder
 */
export async function saveDestinationMetadata(
    drive: any,
    destinationFolderId: string,
    metadata: any
): Promise<void> {
    const fileName = 'metadata.json';

    // Check if metadata file exists
    const response = await drive.files.list({
        q: `name='${fileName}' and '${destinationFolderId}' in parents and trashed=false`,
        fields: 'files(id)',
    });

    const fileMetadata: any = {
        name: fileName,
        mimeType: 'application/json',
    };

    const media = {
        mimeType: 'application/json',
        body: JSON.stringify(metadata, null, 2),
    };

    if (response.data.files && response.data.files.length > 0) {
        // Update existing file
        await drive.files.update({
            fileId: response.data.files[0].id,
            media: media,
        });
    } else {
        // Create new file
        fileMetadata.parents = [destinationFolderId];
        await drive.files.create({
            requestBody: fileMetadata,
            media: media,
        });
    }
}

/**
 * Load destination metadata from JSON file
 */
export async function loadDestinationMetadata(
    drive: any,
    destinationFolderId: string
): Promise<any | null> {
    const fileName = 'metadata.json';

    const response = await drive.files.list({
        q: `name='${fileName}' and '${destinationFolderId}' in parents and trashed=false`,
        fields: 'files(id)',
    });

    if (!response.data.files || response.data.files.length === 0) {
        return null;
    }

    const fileId = response.data.files[0].id;
    const file = await drive.files.get({
        fileId: fileId,
        alt: 'media',
    });

    return file.data;
}
