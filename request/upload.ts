import axios from "axios";

// FormData carries one or more `file` entries plus a `path` (products/... or
// reviews/...). Resolves to the { url, public_url } image shape the Product
// schema stores; a rejected upload surfaces the route's own message.
export const uploadImages = async (formData: FormData) => {
    try {
        const { data } = await axios.post("/api/cloudinary", formData);

        return data as { url: string; public_url: string }[];
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message);
    }
};

export const deleteImage = async (public_id: string) => {
    const { data } = await axios.delete("/api/cloudinary", { data: { public_id } });

    return data;
};

// Builds the FormData for a set of files, so callers do not repeat it.
export const toUploadForm = (files: File[], path: string) => {
    const form = new FormData();

    files.forEach((file) => form.append("file", file));
    form.append("path", path);

    return form;
};
