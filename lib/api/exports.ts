import { API_BASE_URL } from "@/lib/config";
import { useAuthStore } from "@/lib/store/auth-store";
import { authedFetch } from "./http";
import type { CvExport, ExportFormat } from "./types";

export function createExport(cvId: string, format: ExportFormat) {
  return authedFetch<CvExport>(`/cvs/${cvId}/exports`, {
    method: "POST",
    body: { format },
  });
}

export function listExports(cvId: string) {
  return authedFetch<CvExport[]>(`/cvs/${cvId}/exports`);
}

/** Downloading a file needs the Authorization header, so a plain <a href> won't work. */
export async function downloadExportFile(
  downloadUrl: string,
  filename: string,
) {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(`${API_BASE_URL}${downloadUrl}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
