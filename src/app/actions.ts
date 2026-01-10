"use server";

import { addAttraction, createCategory, removeAttraction, uploadFile, deleteFile, updateDestination, createDestination, renameFile, updatePlan } from "@/lib/driveService";
import { revalidatePath } from "next/cache";

export async function addNewCategory(destId: string, name: string) {
    try {
        await createCategory(destId, name);
        revalidatePath(`/destination/${destId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to add category:", error);
        return { success: false, error: "Failed to add category" };
    }
}

export async function addNewAttraction(destId: string, name: string) {
    try {
        await addAttraction(destId, name);
        revalidatePath(`/destination/${destId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to add attraction:", error);
        return { success: false, error: "Failed to add attraction" };
    }
}

export async function deleteAttraction(destId: string, attrId: string) {
    try {
        await removeAttraction(destId, attrId);
        revalidatePath(`/destination/${destId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete attraction:", error);
        return { success: false, error: "Failed to delete attraction" };
    }
}

export async function uploadFileAction(destId: string, categoryId: string, formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    try {
        await uploadFile(destId, categoryId, file);
        revalidatePath(`/destination/${destId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to upload file:", error);
        return { success: false, error: "Failed to upload file" };
    }
}

export async function updateDestinationAction(destId: string, updates: any) {
    try {
        // Import this from driveService. Wait, I should import it at top or re-export.
        // But better to call the service.
        await updateDestination(destId, updates);
        revalidatePath("/");
        revalidatePath(`/destination/${destId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update destination:", error);
        return { success: false, error: "Failed to update destination" };
    }
}

export async function deleteFileAction(destId: string, categoryId: string, fileId: string) {
    try {
        await deleteFile(destId, categoryId, fileId);
        revalidatePath(`/destination/${destId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete file:", error);
        return { success: false, error: "Failed to delete file" };
    }
}

export async function createDestinationAction(name: string) {
    try {
        const newDest = await createDestination(name);
        revalidatePath("/");
        return { success: true, destinationId: newDest.id };
    } catch (error) {
        console.error("Failed to create destination:", error);
        return { success: false, error: "Failed to create destination" };
    }
}

export async function renameFileAction(destId: string, categoryId: string, fileId: string, newName: string) {
    try {
        await renameFile(destId, categoryId, fileId, newName);
        revalidatePath(`/destination/${destId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to rename file:", error);
        return { success: false, error: "Failed to rename file" };
    }
}

export async function updatePlanAction(destId: string, plan: any[]) {
    try {
        await updatePlan(destId, plan);
        revalidatePath(`/destination/${destId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update plan:", error);
        return { success: false, error: "Failed to update plan" };
    }
}
