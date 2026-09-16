"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CvCard } from "@/components/dashboard/cv-card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import * as authApi from "@/lib/api/auth";
import * as cvsApi from "@/lib/api/cvs";
import type { CvListItem } from "@/lib/api/types";
import { useAuthStore } from "@/lib/store/auth-store";

const SKELETON_KEYS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"];

export default function DashboardPage() {
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["cvs"],
    queryFn: () => cvsApi.listCvs({ limit: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (cvId: string) => cvsApi.deleteCv(cvId),
    onMutate: (cvId) => {
      queryClient.setQueryData<typeof data>(["cvs"], (prev) =>
        prev
          ? { ...prev, items: prev.items.filter((cv) => cv.id !== cvId) }
          : prev,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
    },
  });

  const handleDelete = (cv: CvListItem) => {
    if (window.confirm(`Delete "${cv.title}"? This can't be undone.`)) {
      deleteMutation.mutate(cv.id);
    }
  };

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    clear();
    router.push("/login");
  };

  return (
    <div className="flex flex-col grow">
      <header className="flex justify-between items-center mb-xl gap-md">
        <div>
          <h1 className="text-headline-xl text-on-surface">My Resumes</h1>
          <p className="text-body-md text-on-surface-variant mt-sm">
            Manage your tailored variants and base templates.
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <Button
            disabled
            title="Template selection is coming soon"
            className="gap-xs"
          >
            <Icon name="add" />
            New Resume
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>

      {isPending && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
          {SKELETON_KEYS.map((key) => (
            <div
              key={key}
              className="h-[260px] rounded-lg bg-surface-container-low animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center gap-sm text-center py-xl">
          <p className="text-body-md text-on-surface-variant">
            Couldn't load your resumes.
          </p>
          <Button variant="secondary" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-sm text-center py-xl border border-dashed border-outline-variant rounded-lg">
          <Icon name="description" className="!text-4xl text-outline-variant" />
          <p className="text-headline-md text-on-surface">No resumes yet</p>
          <p className="text-body-sm text-on-surface-variant max-w-sm">
            Once template selection and the CV editor are wired up, your first
            resume will show up here.
          </p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg auto-rows-max">
          {data.items.map((cv) => (
            <CvCard
              key={cv.id}
              cv={cv}
              onDelete={handleDelete}
              isDeleting={
                deleteMutation.isPending && deleteMutation.variables === cv.id
              }
            />
          ))}
          <button
            type="button"
            disabled
            title="Template selection is coming soon"
            className="border border-dashed border-outline-variant rounded-lg flex flex-col items-center justify-center h-[260px] gap-sm text-on-surface-variant/50 cursor-not-allowed"
          >
            <Icon name="add_circle" className="!text-3xl" />
            <span className="text-headline-md">Create New</span>
          </button>
        </div>
      )}
    </div>
  );
}
