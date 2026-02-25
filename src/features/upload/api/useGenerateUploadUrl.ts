// Upload a file directly via multipart form data to /api/upload
// Returns { url: string } - the public path to the uploaded file
export const useUploadFile = () => {
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url as string;
  };
  return { uploadFile };
};
