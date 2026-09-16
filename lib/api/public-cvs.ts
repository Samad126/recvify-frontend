import { publicFetch } from "./http";
import type { PublicCv } from "./types";

export function getPublicCv(shareSlug: string) {
  return publicFetch<PublicCv>(`/public/cvs/${shareSlug}`);
}
