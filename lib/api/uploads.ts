import { authedFetch } from "./http";
import type { Upload } from "./types";

export function createUpload(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return authedFetch<Upload>("/uploads", { method: "POST", body: formData });
}
