"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UploadDropzone } from "@/components/onboarding/upload-dropzone";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import * as cvsApi from "@/lib/api/cvs";
import * as templatesApi from "@/lib/api/templates";
import type {
  ContactInfo,
  EducationFields,
  ExperienceFields,
  Template,
} from "@/lib/api/types";
import * as uploadsApi from "@/lib/api/uploads";

interface ReviewState {
  contactInfo: ContactInfo;
  summary: string;
  experience: ExperienceFields[];
  education: EducationFields[];
  skills: string[];
}

type Step = "select" | "failed" | "review";

export default function UploadCvPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("select");
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>();
  const [review, setReview] = useState<ReviewState | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);

  const upload = useMutation({
    mutationFn: (file: File) => uploadsApi.createUpload(file),
    onSuccess: (result) => {
      setUploadId(result.id);
      if (result.parsedStatus === "PARSED" && result.parsedData) {
        setReview({
          contactInfo: result.parsedData.contactInfo ?? { fullName: "" },
          summary: result.parsedData.summary ?? "",
          experience: result.parsedData.experience ?? [],
          education: result.parsedData.education ?? [],
          skills: result.parsedData.skills ?? [],
        });
        setStep("review");
      } else {
        setStep("failed");
      }
    },
    onError: () => setStep("failed"),
  });

  const templatesQuery = useQuery({
    queryKey: ["templates", "picker"],
    queryFn: () => templatesApi.listTemplates({ limit: 8, sort: "recent" }),
    enabled: step === "review",
  });

  const createCv = useMutation({
    mutationFn: () => {
      if (!uploadId || !templateId || !review)
        throw new Error("Missing required fields");
      return cvsApi.createCvFromUpload({
        uploadId,
        templateId,
        contactInfo: review.contactInfo,
        summary: review.summary || undefined,
        experience: review.experience,
        education: review.education,
        skills: review.skills,
      });
    },
    onSuccess: (cv) => router.push(`/cvs/${cv.id}`),
  });

  const handleFile = (file: File) => {
    setFileName(file.name);
    setStep("select");
    upload.mutate(file);
  };

  return (
    <div className="min-h-full flex flex-col bg-surface text-on-surface">
      <header className="h-16 flex items-center justify-between px-lg md:px-xl border-b border-outline-variant bg-surface-container-lowest shrink-0">
        <div className="flex items-center gap-sm">
          <Icon name="description" filled className="text-primary !text-2xl" />
          <span className="text-headline-md font-bold text-on-surface">
            ResumeForge
          </span>
        </div>
        <Link
          href="/dashboard"
          className="text-label-md text-secondary hover:text-on-surface transition-colors px-md py-sm rounded hover:bg-surface-container-low"
        >
          Cancel
        </Link>
      </header>

      {step !== "review" && (
        <main className="flex-1 pt-xl pb-xl px-md md:px-xl flex items-center justify-center">
          <div className="w-full max-w-2xl bg-surface-container-lowest rounded-lg border border-outline-variant p-xl shadow-flat-soft flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center mb-lg w-full">
              <h1 className="text-headline-lg text-on-surface mb-sm">
                Upload your existing CV
              </h1>
              <p className="text-body-md text-on-surface-variant">
                We'll parse your data and set up your new profile in seconds.
              </p>
            </div>

            {step === "failed" && (
              <p className="mb-md w-full rounded-lg border border-error bg-error-container px-sm py-sm text-body-sm text-on-error-container text-center">
                We couldn't parse that file. Try another file, or{" "}
                <Link href="/templates" className="underline">
                  start from a blank template
                </Link>
                .
              </p>
            )}

            <UploadDropzone
              onFileSelected={handleFile}
              isUploading={upload.isPending}
              fileName={fileName}
            />
          </div>
        </main>
      )}

      {step === "review" && review && (
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-300 mx-auto px-md md:px-xl py-lg md:py-xl">
            <div className="bg-secondary-fixed border border-secondary-fixed-dim rounded-lg p-md mb-xl flex items-start gap-md">
              <Icon name="warning" filled className="text-secondary mt-0.5" />
              <div>
                <h3 className="text-headline-md text-on-secondary-fixed mb-xs">
                  We've extracted your information
                </h3>
                <p className="text-body-md text-on-secondary-fixed-variant">
                  Please review the fields below for accuracy before creating
                  your CV.
                </p>
              </div>
            </div>

            <div className="space-y-xl max-w-2xl">
              <section className="space-y-md">
                <div className="border-b border-outline-variant pb-sm">
                  <h2 className="text-headline-lg text-on-surface">
                    Personal Details
                  </h2>
                </div>
                <Input
                  label="Full name"
                  value={review.contactInfo.fullName}
                  onChange={(e) =>
                    setReview({
                      ...review,
                      contactInfo: {
                        ...review.contactInfo,
                        fullName: e.target.value,
                      },
                    })
                  }
                />
                <Input
                  label="Professional title"
                  value={review.contactInfo.title ?? ""}
                  onChange={(e) =>
                    setReview({
                      ...review,
                      contactInfo: {
                        ...review.contactInfo,
                        title: e.target.value,
                      },
                    })
                  }
                />
                <div className="grid grid-cols-2 gap-md">
                  <Input
                    label="Email"
                    type="email"
                    value={review.contactInfo.email ?? ""}
                    onChange={(e) =>
                      setReview({
                        ...review,
                        contactInfo: {
                          ...review.contactInfo,
                          email: e.target.value,
                        },
                      })
                    }
                  />
                  <Input
                    label="Phone"
                    value={review.contactInfo.phone ?? ""}
                    onChange={(e) =>
                      setReview({
                        ...review,
                        contactInfo: {
                          ...review.contactInfo,
                          phone: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <Textarea
                  label="Professional Summary"
                  rows={4}
                  value={review.summary}
                  onChange={(e) =>
                    setReview({ ...review, summary: e.target.value })
                  }
                />
              </section>

              <section className="space-y-md">
                <div className="border-b border-outline-variant pb-sm flex justify-between items-center">
                  <h2 className="text-headline-lg text-on-surface">
                    Experience
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      setReview({
                        ...review,
                        experience: [
                          ...review.experience,
                          {
                            jobTitle: "",
                            company: "",
                            startDate: "",
                            description: "",
                          },
                        ],
                      })
                    }
                    className="text-primary hover:text-primary-container transition-colors p-xs rounded hover:bg-surface-container-low"
                  >
                    <Icon name="add" />
                  </button>
                </div>
                {review.experience.map((exp, index) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: entries have no stable id before creation
                    key={index}
                    className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md space-y-md relative"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setReview({
                          ...review,
                          experience: review.experience.filter(
                            (_, i) => i !== index,
                          ),
                        })
                      }
                      className="absolute top-md right-md text-outline hover:text-error transition-colors"
                    >
                      <Icon name="delete" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                      <Input
                        label="Job title"
                        value={exp.jobTitle}
                        onChange={(e) => {
                          const experience = [...review.experience];
                          experience[index] = {
                            ...exp,
                            jobTitle: e.target.value,
                          };
                          setReview({ ...review, experience });
                        }}
                      />
                      <Input
                        label="Company"
                        value={exp.company}
                        onChange={(e) => {
                          const experience = [...review.experience];
                          experience[index] = {
                            ...exp,
                            company: e.target.value,
                          };
                          setReview({ ...review, experience });
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-md">
                      <Input
                        label="Start date"
                        value={exp.startDate}
                        onChange={(e) => {
                          const experience = [...review.experience];
                          experience[index] = {
                            ...exp,
                            startDate: e.target.value,
                          };
                          setReview({ ...review, experience });
                        }}
                      />
                      <Input
                        label="End date"
                        value={exp.endDate ?? ""}
                        onChange={(e) => {
                          const experience = [...review.experience];
                          experience[index] = {
                            ...exp,
                            endDate: e.target.value,
                          };
                          setReview({ ...review, experience });
                        }}
                      />
                    </div>
                    <Textarea
                      label="Description"
                      rows={3}
                      value={exp.description}
                      onChange={(e) => {
                        const experience = [...review.experience];
                        experience[index] = {
                          ...exp,
                          description: e.target.value,
                        };
                        setReview({ ...review, experience });
                      }}
                    />
                  </div>
                ))}
              </section>

              <section className="space-y-md">
                <div className="border-b border-outline-variant pb-sm flex justify-between items-center">
                  <h2 className="text-headline-lg text-on-surface">
                    Education
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      setReview({
                        ...review,
                        education: [
                          ...review.education,
                          { school: "", degree: "", startDate: "" },
                        ],
                      })
                    }
                    className="text-primary hover:text-primary-container transition-colors p-xs rounded hover:bg-surface-container-low"
                  >
                    <Icon name="add" />
                  </button>
                </div>
                {review.education.map((edu, index) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: entries have no stable id before creation
                    key={index}
                    className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md space-y-md relative"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setReview({
                          ...review,
                          education: review.education.filter(
                            (_, i) => i !== index,
                          ),
                        })
                      }
                      className="absolute top-md right-md text-outline hover:text-error transition-colors"
                    >
                      <Icon name="delete" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                      <Input
                        label="Degree"
                        value={edu.degree}
                        onChange={(e) => {
                          const education = [...review.education];
                          education[index] = { ...edu, degree: e.target.value };
                          setReview({ ...review, education });
                        }}
                      />
                      <Input
                        label="School"
                        value={edu.school}
                        onChange={(e) => {
                          const education = [...review.education];
                          education[index] = { ...edu, school: e.target.value };
                          setReview({ ...review, education });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </section>

              <section className="space-y-md">
                <div className="border-b border-outline-variant pb-sm">
                  <h2 className="text-headline-lg text-on-surface">Skills</h2>
                </div>
                <div className="flex flex-wrap gap-xs">
                  {review.skills.map((skill, index) => (
                    <span
                      // biome-ignore lint/suspicious/noArrayIndexKey: skill names have no stable id
                      key={index}
                      className="inline-flex items-center gap-xs bg-surface-container text-on-surface-variant text-label-md px-2 py-1 rounded"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() =>
                          setReview({
                            ...review,
                            skills: review.skills.filter((_, i) => i !== index),
                          })
                        }
                      >
                        <Icon name="close" className="!text-sm" />
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  placeholder="Type a skill and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      e.preventDefault();
                      setReview({
                        ...review,
                        skills: [
                          ...review.skills,
                          e.currentTarget.value.trim(),
                        ],
                      });
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </section>

              <section className="space-y-md">
                <div className="border-b border-outline-variant pb-sm">
                  <h2 className="text-headline-lg text-on-surface">
                    Choose a template
                  </h2>
                </div>
                {templatesQuery.isPending && (
                  <p className="text-body-sm text-on-surface-variant">
                    Loading templates…
                  </p>
                )}
                {templatesQuery.data && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
                    {templatesQuery.data.items.map((template) => (
                      <TemplatePickCard
                        key={template.id}
                        template={template}
                        selected={templateId === template.id}
                        onSelect={() => setTemplateId(template.id)}
                      />
                    ))}
                  </div>
                )}
              </section>

              {createCv.isError && (
                <p className="rounded-lg border border-error bg-error-container px-sm py-sm text-body-sm text-on-error-container">
                  Couldn't create your CV. Please try again.
                </p>
              )}

              <div className="flex justify-end pb-xl">
                <button
                  type="button"
                  disabled={!templateId || createCv.isPending}
                  onClick={() => createCv.mutate()}
                  className="text-label-md text-on-primary bg-primary hover:bg-primary-container transition-colors px-lg py-md rounded-lg flex items-center gap-xs disabled:opacity-50 disabled:pointer-events-none"
                >
                  {createCv.isPending ? "Creating…" : "Create CV"}
                  <Icon name="arrow_forward" />
                </button>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

function TemplatePickCard({
  template,
  selected,
  onSelect,
}: {
  template: Template;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-lg border-2 overflow-hidden transition-colors ${
        selected
          ? "border-primary-container"
          : "border-outline-variant hover:border-outline"
      }`}
    >
      {/** biome-ignore lint/performance/noImgElement: external, unconfigured template thumbnail host */}
      <img
        src={template.thumbnailUrl}
        alt={`${template.name} template preview`}
        className="w-full aspect-[1/1.4] object-cover object-top"
      />
      <div className="p-xs text-label-md text-on-surface truncate">
        {template.name}
      </div>
    </button>
  );
}
