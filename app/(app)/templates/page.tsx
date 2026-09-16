"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TemplateCard } from "@/components/templates/template-card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import * as cvsApi from "@/lib/api/cvs";
import * as templatesApi from "@/lib/api/templates";
import type { Template } from "@/lib/api/types";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

export default function TemplatesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [atsOnly, setAtsOnly] = useState(false);
  const [sort, setSort] = useState<"recent" | "name">("recent");
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isPending, isError } = useQuery({
    queryKey: ["templates", { search: debouncedSearch, atsOnly, sort }],
    queryFn: () =>
      templatesApi.listTemplates({
        search: debouncedSearch || undefined,
        atsOnly: atsOnly || undefined,
        sort,
        limit: 24,
      }),
  });

  const createCvMutation = useMutation({
    mutationFn: (templateId: string) => cvsApi.createCv({ templateId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cvs"] });
      router.push("/dashboard");
    },
  });

  const handleUse = (template: Template) => {
    createCvMutation.mutate(template.id);
  };

  return (
    <div className="flex flex-col grow max-w-300 mx-auto w-full">
      <div className="mb-lg">
        <h1 className="text-headline-xl text-on-surface mb-sm">
          Template Gallery
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Select a professional template to start building your resume.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md mb-xl flex flex-col md:flex-row gap-md items-center justify-between">
        <div className="relative w-full md:w-64">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-md items-center w-full md:w-auto">
          <label className="flex items-center gap-xs text-body-sm text-on-surface-variant whitespace-nowrap">
            <input
              type="checkbox"
              checked={atsOnly}
              onChange={(e) => setAtsOnly(e.target.checked)}
              className="rounded-sm border-outline-variant text-primary-container focus:ring-primary-container"
            />
            ATS-friendly only
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "recent" | "name")}
            className="border border-outline-variant rounded-lg px-md py-2 text-body-sm bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary-container"
          >
            <option value="recent">Newest first</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>

      {createCvMutation.isError && (
        <p className="mb-md rounded-lg border border-error bg-error-container px-sm py-sm text-body-sm text-on-error-container">
          Couldn't create a CV from that template. Please try again.
        </p>
      )}

      {isPending && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
          {SKELETON_KEYS.map((key) => (
            <div
              key={key}
              className="aspect-[1/1.4] rounded-lg bg-surface-container-low animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-body-md text-on-surface-variant py-xl text-center">
          Couldn't load templates. Please refresh the page.
        </p>
      )}

      {data && data.items.length === 0 && (
        <p className="text-body-md text-on-surface-variant py-xl text-center">
          No templates match your search.
        </p>
      )}

      {data && data.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-lg">
          {data.items.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={handleUse}
              isCreating={
                createCvMutation.isPending &&
                createCvMutation.variables === template.id
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

const SKELETON_KEYS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"];
