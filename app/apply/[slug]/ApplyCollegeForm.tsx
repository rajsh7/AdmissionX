"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ApplyCollegeData {
  slug: string;
  collegeName: string;
  location: string;
  logo: string | null;
}

type StepKey = "personal" | "academic" | "documents" | "payment" | "review";

interface FormState {
  personal: {
    fullName: string;
    email: string;
    countryCode: string;
    phone: string;
    dob: string;
    preferredStartDate: string;
    address: string;
    city: string;
  };
  academic: {
    qualification: string;
    board: string;
    stream: string;
    percentage: string;
    yearOfPassing: string;
    entranceExam: string;
    entrancePercentage: string;
    yearOfExam: string;
  };
  documents: {
    marksheet10: string;
    marksheet12: string;
    entranceScorecard: string;
    photoId: string;
    passportPhoto: string;
  };
  payment: {
    method: string;
    cardName: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
  };
  review: {
    declaration: boolean;
  };
}

const steps: { key: StepKey; label: string; actionLabel: string }[] = [
  { key: "personal", label: "Personal", actionLabel: "Continue to Academic Details" },
  { key: "academic", label: "Academic", actionLabel: "Continue to Documents" },
  { key: "documents", label: "Documents", actionLabel: "Continue to Payment" },
  { key: "payment", label: "Payment", actionLabel: "Continue to Review" },
  { key: "review", label: "Review & Submit", actionLabel: "Submit Application" },
];

const cityOptions = [
  "Jaipur",
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
];

const qualificationOptions = [
  "10th",
  "12th",
  "Diploma",
  "Graduation",
  "Post Graduation",
];

const streamOptions = [
  "Science",
  "Commerce",
  "Arts",
  "Computer Science",
  "Management",
  "Engineering",
];

const entranceExamOptions = [
  "JEE Main",
  "CUET",
  "CAT",
  "MAT",
  "NEET",
  "Other",
];

const defaultFormState: FormState = {
  personal: {
    fullName: "",
    email: "",
    countryCode: "+91",
    phone: "",
    dob: "",
    preferredStartDate: "",
    address: "",
    city: "",
  },
  academic: {
    qualification: "",
    board: "",
    stream: "",
    percentage: "",
    yearOfPassing: "",
    entranceExam: "",
    entrancePercentage: "",
    yearOfExam: "",
  },
  documents: {
    marksheet10: "",
    marksheet12: "",
    entranceScorecard: "",
    photoId: "",
    passportPhoto: "",
  },
  payment: {
    method: "card",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  },
  review: {
    declaration: false,
  },
};

function mergeFormState(raw: Partial<FormState> | null | undefined): FormState {
  return {
    personal: { ...defaultFormState.personal, ...(raw?.personal ?? {}) },
    academic: { ...defaultFormState.academic, ...(raw?.academic ?? {}) },
    documents: { ...defaultFormState.documents, ...(raw?.documents ?? {}) },
    payment: { ...defaultFormState.payment, ...(raw?.payment ?? {}) },
    review: { ...defaultFormState.review, ...(raw?.review ?? {}) },
  };
}

function formatSavedAgo(savedAt: string | null, nowTick: number) {
  if (!savedAt) return "Draft ready";

  const diff = Math.max(
    0,
    Math.floor((nowTick - new Date(savedAt).getTime()) / 60000),
  );

  if (diff === 0) return "Last saved just now";
  if (diff === 1) return "Last saved 1 minute ago";
  return `Last saved ${diff} minutes ago`;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[13px] font-medium text-[#4b5563]">{children}</label>;
}

function FieldInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-[4px] border border-[#e5e7eb] px-4 text-sm text-[#111827] outline-none transition focus:border-[#d1d5db] focus:ring-2 focus:ring-[#ff5757]/15"
    />
  );
}

export default function ApplyCollegeForm({ college }: { college: ApplyCollegeData }) {
  const router = useRouter();
  const storageKey = `admissionx-apply-draft-${college.slug}`;
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());
  // At step 0: line goes halfway to next dot (12.5% of full width)
  // At step N: line reaches dot N center, plus halfway to next
  // At last step: full width
  const progressPercent =
    currentStep === steps.length - 1
      ? 100
      : (currentStep / (steps.length - 1)) * 100 + (1 / (steps.length - 1)) * 50;

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as {
          form?: Partial<FormState>;
          updatedAt?: string;
        };

        setForm(mergeFormState(parsed.form));
        setLastSavedAt(parsed.updatedAt ?? null);
      }
    } catch (loadError) {
      console.error("[apply] failed to load draft:", loadError);
    } finally {
      setIsHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => {
        if (!isMounted || !data?.user || data.user.role !== "student") return;

        setForm((previous) => ({
          ...previous,
          personal: {
            ...previous.personal,
            fullName: previous.personal.fullName || data.user.name || "",
            email: previous.personal.email || data.user.email || "",
          },
        }));
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const timeoutId = window.setTimeout(() => {
      const updatedAt = new Date().toISOString();
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          form,
          updatedAt,
        }),
      );
      setLastSavedAt(updatedAt);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [form, isHydrated, storageKey]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowTick(Date.now());
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  const [docUrls, setDocUrls] = useState<Partial<Record<keyof FormState["documents"], string>>>({});
  const [docUploading, setDocUploading] = useState<Partial<Record<keyof FormState["documents"], boolean>>>({});

  const currentStepConfig = steps[currentStep];
  const collegeInitial = college.collegeName.trim().charAt(0).toUpperCase();

  function updatePersonal<K extends keyof FormState["personal"]>(
    key: K,
    value: FormState["personal"][K],
  ) {
    setForm((previous) => ({
      ...previous,
      personal: {
        ...previous.personal,
        [key]: value,
      },
    }));
  }

  function updateAcademic<K extends keyof FormState["academic"]>(
    key: K,
    value: FormState["academic"][K],
  ) {
    setForm((previous) => ({
      ...previous,
      academic: {
        ...previous.academic,
        [key]: value,
      },
    }));
  }

  function updateDocuments<K extends keyof FormState["documents"]>(
    key: K,
    value: FormState["documents"][K],
    previewUrl?: string,
  ) {
    setForm((previous) => ({
      ...previous,
      documents: { ...previous.documents, [key]: value },
    }));
    setDocUrls((previous) => {
      const next = { ...previous };
      if (previewUrl) {
        next[key] = previewUrl;
      } else {
        delete next[key];
      }
      return next;
    });
  }

  async function handleFileSelect<K extends keyof FormState["documents"]>(
    key: K,
    file: File,
  ) {
    const previewUrl = URL.createObjectURL(file);
    setDocUrls((prev) => ({ ...prev, [key]: previewUrl }));
    setDocUploading((prev) => ({ ...prev, [key]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/student/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "File upload failed.");
        setDocUrls((prev) => { const next = { ...prev }; delete next[key]; return next; });
        return;
      }
      updateDocuments(key, data.url as FormState["documents"][K], previewUrl);
    } catch {
      setError("File upload failed. Please try again.");
      setDocUrls((prev) => { const next = { ...prev }; delete next[key]; return next; });
    } finally {
      setDocUploading((prev) => ({ ...prev, [key]: false }));
    }
  }

  function updatePayment<K extends keyof FormState["payment"]>(
    key: K,
    value: FormState["payment"][K],
  ) {
    setForm((previous) => ({
      ...previous,
      payment: {
        ...previous.payment,
        [key]: value,
      },
    }));
  }

  function validateStep(stepIndex: number) {
    if (stepIndex === 0) {
      const { fullName, email, phone, dob, address, city } = form.personal;
      if (!fullName || !email || !phone || !dob || !address || !city) {
        return "Please complete all personal details before continuing.";
      }
    }

    if (stepIndex === 1) {
      const {
        qualification,
        board,
        stream,
        percentage,
        yearOfPassing,
        entranceExam,
        entrancePercentage,
        yearOfExam,
      } = form.academic;

      if (
        !qualification ||
        !board ||
        !stream ||
        !percentage ||
        !yearOfPassing ||
        !entranceExam ||
        !entrancePercentage ||
        !yearOfExam
      ) {
        return "Please complete all academic details before continuing.";
      }
    }

    if (stepIndex === 2) {
      const {
        marksheet10,
        marksheet12,
        photoId,
        passportPhoto,
      } = form.documents;

      if (
        !marksheet10 ||
        !marksheet12 ||
        !photoId ||
        !passportPhoto
      ) {
        return "Please upload the required documents before continuing.";
      }
    }

    if (stepIndex === 3) {
      const { method, cardName, cardNumber, expiry, cvv } = form.payment;
      if (method === "card" && (!cardName || !cardNumber || !expiry || !cvv)) {
        return "Please complete your card details before continuing.";
      }
    }

    if (stepIndex === 4 && !form.review.declaration) {
      return "Please confirm the declaration before submitting.";
    }

    return "";
  }

  async function handleNext() {
    const validationError = validateStep(currentStep);
    setError(validationError);
    if (validationError) return;

    if (currentStep === steps.length - 1) {
      setSubmitting(true);
      try {
        const docs: { type: string; url: string }[] = [
          { type: "10th Marksheet", url: form.documents.marksheet10 },
          { type: "12th Marksheet", url: form.documents.marksheet12 },
          { type: "ID Proof", url: form.documents.photoId },
          { type: "Passport Photo", url: form.documents.passportPhoto },
          ...(form.documents.entranceScorecard ? [{ type: "Entrance Scorecard", url: form.documents.entranceScorecard }] : []),
        ].filter((d) => d.url);

        const res = await fetch("/api/student/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collegeprofile_id: college.slug,
            college_name: college.collegeName,
            documents: docs,
            personal_info: {
              name: form.personal.fullName,
              email: form.personal.email,
              phone: form.personal.phone,
              dob: form.personal.dob,
              city: form.personal.city,
              address: form.personal.address,
              preferredStartDate: form.personal.preferredStartDate,
              countryCode: form.personal.countryCode,
            },
            academic_info: {
              qualification: form.academic.qualification,
              board: form.academic.board,
              stream: form.academic.stream,
              percentage: form.academic.percentage,
              yearOfPassing: form.academic.yearOfPassing,
              entranceExam: form.academic.entranceExam,
              entrancePercentage: form.academic.entrancePercentage,
              yearOfExam: form.academic.yearOfExam,
            },
            payment_info: {
              method: form.payment.method,
              cardName: form.payment.cardName,
              expiry: form.payment.expiry,
            },
            notes: "",
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Submission failed. Please try again.");
          return;
        }

        setCompleted(true);
        localStorage.removeItem(storageKey);
        // Redirect to student dashboard applications tab after 2s
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meData?.user?.id) {
          setTimeout(() => {
            window.location.href = `/dashboard/student/${meData.user.id}?tab=app-all`;
          }, 2000);
        }
      } catch {
        setError("Network error. Please check your connection and try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setCurrentStep((previous) => previous + 1);
  }

  function handleSaveAndExit() {
    const updatedAt = new Date().toISOString();
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        form,
        updatedAt,
      }),
    );
    setLastSavedAt(updatedAt);
    router.push(`/college/${college.slug}`);
  }

  function renderPersonalStep() {
    return (
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Full Name</FieldLabel>
            <FieldInput
              value={form.personal.fullName}
              onChange={(value) => updatePersonal("fullName", value)}
              placeholder="Full Name ( as per passport )"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Email Address</FieldLabel>
            <FieldInput
              value={form.personal.email}
              onChange={(value) => updatePersonal("email", value)}
              placeholder="Enter your email address"
              type="email"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-[1.1fr_0.58fr_0.58fr]">
          <div className="space-y-2">
            <FieldLabel>Phone number</FieldLabel>
            <div className="flex h-11 overflow-hidden rounded-[4px] border border-[#e5e7eb]">
              <div className="flex items-center gap-2 border-r border-[#e5e7eb] bg-[#fafafa] px-4 text-sm text-[#374151]">
                <span className="text-base">🇮🇳</span>
                <select
                  value={form.personal.countryCode}
                  onChange={(event) => updatePersonal("countryCode", event.target.value)}
                  className="bg-transparent outline-none"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                </select>
              </div>
              <input
                value={form.personal.phone}
                onChange={(event) => updatePersonal("phone", event.target.value)}
                placeholder="XXX-XXX-XXXX"
                className="min-w-0 flex-1 px-4 text-sm text-[#111827] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Date of Birth</FieldLabel>
            <FieldInput
              value={form.personal.dob}
              onChange={(value) => updatePersonal("dob", value)}
              placeholder="DD/MM/YYYY"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Preferred Start Date</FieldLabel>
            <FieldInput
              value={form.personal.preferredStartDate}
              onChange={(value) => updatePersonal("preferredStartDate", value)}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Permanent Address</FieldLabel>
            <textarea
              value={form.personal.address}
              onChange={(event) => updatePersonal("address", event.target.value)}
              placeholder="Enter your permanent full address"
              className="min-h-[92px] w-full rounded-[4px] border border-[#e5e7eb] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#d1d5db] focus:ring-2 focus:ring-[#ff5757]/15"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Current City</FieldLabel>
            <select
              value={form.personal.city}
              onChange={(event) => updatePersonal("city", event.target.value)}
              className="h-11 w-full rounded-[4px] border border-[#e5e7eb] px-4 text-sm text-[#111827] outline-none transition focus:border-[#d1d5db] focus:ring-2 focus:ring-[#ff5757]/15"
            >
              <option value="">Enter your city</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  function renderAcademicStep() {
    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <FieldLabel>Qualification</FieldLabel>
          <select
            value={form.academic.qualification}
            onChange={(event) => updateAcademic("qualification", event.target.value)}
            className="h-11 w-full rounded-[4px] border border-[#e5e7eb] px-4 text-sm text-[#111827] outline-none transition focus:border-[#d1d5db] focus:ring-2 focus:ring-[#ff5757]/15"
          >
            <option value="">Select</option>
            {qualificationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>Board</FieldLabel>
            <FieldInput
              value={form.academic.board}
              onChange={(value) => updateAcademic("board", value)}
              placeholder="Search your board"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Stream</FieldLabel>
            <select
              value={form.academic.stream}
              onChange={(event) => updateAcademic("stream", event.target.value)}
              className="h-11 w-full rounded-[4px] border border-[#e5e7eb] px-4 text-sm text-[#111827] outline-none transition focus:border-[#d1d5db] focus:ring-2 focus:ring-[#ff5757]/15"
            >
              <option value="">Write your stream</option>
              {streamOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-[1fr_0.9fr]">
          <div className="space-y-2">
            <FieldLabel>Percentage</FieldLabel>
            <FieldInput
              value={form.academic.percentage}
              onChange={(value) => updateAcademic("percentage", value)}
              placeholder="Enter your percentage"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Year of passing</FieldLabel>
            <FieldInput
              value={form.academic.yearOfPassing}
              onChange={(value) => updateAcademic("yearOfPassing", value)}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <FieldLabel>Entrance Exams</FieldLabel>
            <select
              value={form.academic.entranceExam}
              onChange={(event) => updateAcademic("entranceExam", event.target.value)}
              className="h-11 w-full rounded-[4px] border border-[#e5e7eb] px-4 text-sm text-[#111827] outline-none transition focus:border-[#d1d5db] focus:ring-2 focus:ring-[#ff5757]/15"
            >
              <option value="">Write your Exams</option>
              {entranceExamOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <FieldLabel>Percentage</FieldLabel>
            <FieldInput
              value={form.academic.entrancePercentage}
              onChange={(value) => updateAcademic("entrancePercentage", value)}
              placeholder="Enter your percentage"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>Year of Exam</FieldLabel>
            <FieldInput
              value={form.academic.yearOfExam}
              onChange={(value) => updateAcademic("yearOfExam", value)}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>
      </div>
    );
  }

  function renderUploadCard({
    title,
    field,
    subtitle,
    accent = "green",
  }: {
    title: string;
    field: keyof FormState["documents"];
    subtitle: string;
    accent?: "green" | "gray";
  }) {
    const isUploaded = Boolean(form.documents[field]);
    const isUploading = Boolean(docUploading[field]);

    return (
      <div className="overflow-hidden rounded-[4px] border border-[#d8d8d8] bg-white shadow-sm">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-md ${
                accent === "green" ? "bg-[#e9f9ee]" : "bg-[#f3f4f6]"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  accent === "green" ? "text-[#22c55e]" : "text-[#9ca3af]"
                }`}
              >
                {isUploaded ? "audio_file" : "description"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[#4b5563]">{title}</p>
              <p className="mt-0.5 text-[11px] leading-4 text-[#9ca3af]">{subtitle}</p>
            </div>
          </div>

          {isUploaded ? (
            <div className="mt-4 flex items-center justify-between rounded-[4px] border border-[#ececec] bg-[#f7f7f7] px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-[#ef4444] text-[10px] font-bold text-white">
                  {form.documents[field].split('.').pop()?.toUpperCase().slice(0,3) || 'FILE'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-[#4b5563]">
                    {form.documents[field].split('/').pop()}
                  </p>
                  <p className="text-[10px] text-[#b0b0b0]">Uploaded successfully</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => window.open(form.documents[field], "_blank")}
                  className="flex h-6 w-6 items-center justify-center rounded border border-[#d7d7d7] bg-white text-[#6b7280] hover:border-[#ff5757] hover:text-[#ff5757] transition-colors"
                  title="View"
                >
                  <span className="material-symbols-outlined text-[13px]">visibility</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateDocuments(field, "")}
                  className="flex h-6 w-6 items-center justify-center rounded border border-[#d7d7d7] bg-white text-[#6b7280] hover:border-[#ef4444] hover:bg-[#fff1f1] hover:text-[#ef4444] transition-colors"
                  title="Remove"
                >
                  <span className="material-symbols-outlined text-[13px]">delete</span>
                </button>
              </div>
            </div>
          ) : null}

          {!isUploaded ? (
            <label className={`mt-4 block ${isUploading ? "pointer-events-none" : "cursor-pointer"}`}>
              <span className="flex h-9 items-center justify-center gap-2 rounded-[4px] border border-[#5aa9ef] bg-[#dff0ff] text-[14px] font-semibold text-[#1883e6]">
                {isUploading ? (
                  <><span className="h-4 w-4 rounded-full border-2 border-[#1883e6]/30 border-t-[#1883e6] animate-spin" />Uploading...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">upload</span>Upload File</>
                )}
              </span>
              <input
                type="file"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  void handleFileSelect(field, file);
                }}
              />
            </label>
          ) : null}
        </div>

        <div
          className={`flex items-center gap-2 border-t px-4 py-3 text-[13px] font-semibold ${
            isUploaded
              ? "border-[#bde8c8] bg-[#d7f3de] text-[#16a34a]"
              : "border-[#ececec] bg-[#f5f5f5] text-[#8b8b8b]"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isUploaded ? "check_circle" : "radio_button_unchecked"}
          </span>
          {isUploaded ? "Uploaded" : "Not Uploaded"}
        </div>
      </div>
    );
  }

  function renderDocumentsStep() {
    const documentCards: {
      title: string;
      field: keyof FormState["documents"];
      subtitle: string;
      accent?: "green" | "gray";
    }[] = [
      {
        title: "10th Mark sheet",
        field: "marksheet10",
        subtitle: "PDF, JPG, PNG. Max 5MB",
      },
      {
        title: "12th Mark sheet",
        field: "marksheet12",
        subtitle: "PDF, JPG, PNG. Max 5MB",
      },
      {
        title: "Entrance Score Card",
        field: "entranceScorecard",
        subtitle: "PDF, JPG, PNG. Max 5MB",
      },
      {
        title: "Photo ID",
        field: "photoId",
        subtitle: "Aadhaar, PAN, or Driving License PDF, JPG, PNG. Max 5MB",
        accent: "gray",
      },
      {
        title: "Passport Photo",
        field: "passportPhoto",
        subtitle: "Recent passport size photo JPG, PNG. Max 5MB",
        accent: "gray",
      },
    ];

    return (
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {documentCards.map((card) => (
            <div key={card.field}>
              {renderUploadCard(card)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderPaymentStep() {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="space-y-3">
            <FieldLabel>Payment Method</FieldLabel>
            <div className="flex flex-wrap gap-3">
              {["card", "upi", "netbanking"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => updatePayment("method", method)}
                  className={`rounded-[4px] border px-4 py-2 text-sm font-medium transition ${
                    form.payment.method === method
                      ? "border-[#ff5757] bg-[#fff1f1] text-[#ff5757]"
                      : "border-[#e5e7eb] bg-white text-[#4b5563]"
                  }`}
                >
                  {method === "card"
                    ? "Credit / Debit Card"
                    : method === "upi"
                      ? "UPI"
                      : "Net Banking"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <FieldLabel>Name on Card</FieldLabel>
              <FieldInput
                value={form.payment.cardName}
                onChange={(value) => updatePayment("cardName", value)}
                placeholder="Enter card holder name"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <FieldLabel>Card Number</FieldLabel>
              <FieldInput
                value={form.payment.cardNumber}
                onChange={(value) => updatePayment("cardNumber", value)}
                placeholder="0000 0000 0000 0000"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Expiry Date</FieldLabel>
              <FieldInput
                value={form.payment.expiry}
                onChange={(value) => updatePayment("expiry", value)}
                placeholder="MM/YY"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>CVV</FieldLabel>
              <FieldInput
                value={form.payment.cvv}
                onChange={(value) => updatePayment("cvv", value)}
                placeholder="123"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[4px] border border-[#e5e7eb] bg-[#fafafa] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff5757]">
            Payment Summary
          </p>
          <h3 className="mt-3 text-xl font-semibold text-[#111827]">
            {college.collegeName}
          </h3>
          <p className="mt-1 text-sm text-[#6b7280]">{college.location}</p>

          <div className="mt-6 space-y-3 border-t border-[#e5e7eb] pt-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#6b7280]">Application Fee</span>
              <span className="font-semibold text-[#111827]">₹499</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6b7280]">Processing Fee</span>
              <span className="font-semibold text-[#111827]">₹0</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-3">
              <span className="font-medium text-[#111827]">Total</span>
              <span className="text-lg font-semibold text-[#ff5757]">₹499</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderReviewStep() {
    const summaryRows = [
      { label: "College", value: college.collegeName },
      { label: "Location", value: college.location },
      { label: "Applicant Name", value: form.personal.fullName || "-" },
      { label: "Email", value: form.personal.email || "-" },
      { label: "Phone", value: form.personal.phone || "-" },
      { label: "Qualification", value: form.academic.qualification || "-" },
      { label: "Board", value: form.academic.board || "-" },
      { label: "Stream", value: form.academic.stream || "-" },
      { label: "Academic Percentage", value: form.academic.percentage || "-" },
      { label: "Entrance Exam", value: form.academic.entranceExam || "-" },
      { label: "Payment Method", value: form.payment.method.toUpperCase() },
    ];

    return (
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          {summaryRows.map((row) => (
            <div
              key={row.label}
              className="rounded-[4px] border border-[#e5e7eb] bg-[#fafafa] px-4 py-3"
            >
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9ca3af]">
                {row.label}
              </p>
              <p className="mt-1 text-sm font-medium text-[#111827]">{row.value}</p>
            </div>
          ))}
        </div>

        <label className="flex items-start gap-3 rounded-[4px] border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#374151]">
          <input
            type="checkbox"
            checked={form.review.declaration}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                review: {
                  declaration: event.target.checked,
                },
              }))
            }
            className="mt-1 h-4 w-4 rounded border-[#d1d5db] text-[#ff5757] focus:ring-[#ff5757]"
          />
          <span>
            I confirm that the information provided above is accurate and I agree to be
            contacted by the admission team for this application.
          </span>
        </label>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-col gap-4 rounded-[6px] border border-[#ececec] bg-white px-5 py-4 shadow-[0_4px_14px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[6px] border border-[#f1f1f1] bg-[#fafafa]">
            {college.logo ? (
              <Image
                src={college.logo}
                alt={college.collegeName}
                width={56}
                height={56}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-xl font-semibold text-[#ff5757]">{collegeInitial}</span>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9ca3af]">
              Application Form
            </p>
            <h1 className="text-xl font-semibold text-[#111827]">{college.collegeName}</h1>
            <p className="text-sm text-[#6b7280]">{college.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/college/${college.slug}`}
            className="inline-flex items-center gap-2 rounded-[4px] border border-[#e5e7eb] px-4 py-2 text-sm font-medium text-[#4b5563] transition hover:bg-[#fafafa]"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to college
          </Link>
        </div>
      </div>

      <div className="rounded-[4px] border border-[#3695ff] bg-white px-4 py-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="min-w-[140px]">
            <p className="text-[18px] font-semibold leading-tight text-[#6C6C6C]">
              Application
              <br />
              Progress
            </p>
            <p className="mt-1 text-xs text-[#9ca3af]">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>

          <div className="relative flex-1">
            {/* Track */}
            <div className="absolute left-0 right-0 top-[14px] h-[4px] bg-[#ececec]" />
            {/* Red progress line */}
            <div
              className="absolute left-0 top-[14px] h-[4px] bg-[#ff5757] transition-[width] duration-500 ease-in-out"
              style={{ width: `calc(${progressPercent}% + 14px)` }}
            />
            {/* Step dots */}
            <div className="relative flex items-start justify-between">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isComplete = index < currentStep;
                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => {
                      if (index <= currentStep) {
                        setCurrentStep(index);
                        setError("");
                      }
                    }}
                    className="flex flex-col items-center gap-2"
                  >
                    <span
                      className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-[4px] border-2 text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? "border-[#FF3C3C] bg-[#FF3C3C] text-white"
                          : isComplete
                            ? "border-[#16a34a] bg-[#16a34a] text-white"
                            : "border-[#e5e7eb] bg-white text-[#9ca3af]"
                      }`}
                    >
                      {isComplete ? "✓" : index + 1}
                    </span>
                    <p className="text-[15px] font-medium leading-tight text-[#4b5563] text-center">
                      {step.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 rounded-[4px] border border-[#ececec] bg-white px-4 py-3 text-xs shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[#6b7280]">
          <span className="material-symbols-outlined text-[18px] text-[#16a34a]">
            check_circle
          </span>
          Auto-save is enabled . Your progress is saved automatically
        </div>
        <div className="flex items-center gap-2 text-[#16a34a]">
          <span className="material-symbols-outlined text-[18px]">done</span>
          <span className="italic">{formatSavedAgo(lastSavedAt, nowTick)}</span>
        </div>
      </div>

      {completed ? (
        <div className="mt-4 rounded-[4px] border border-[#ececec] bg-white px-6 py-10 shadow-sm">
          <div className="mx-auto max-w-xxl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edfdf1]">
              <span className="material-symbols-outlined text-[32px] text-[#16a34a]">
                check_circle
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-[#111827]">
              Application submitted
            </h2>
            <p className="mt-2 text-sm text-[#6b7280]">
              Your application draft for {college.collegeName} has been completed from the
              new public apply flow.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={`/college/${college.slug}`}
                className="rounded-[4px] border border-[#e5e7eb] px-5 py-3 text-sm font-medium text-[#4b5563] transition hover:bg-[#fafafa]"
              >
                Back to college page
              </Link>
              <button
                type="button"
                onClick={() => {
                  setCompleted(false);
                  setCurrentStep(0);
                  setForm(defaultFormState);
                  setError("");
                }}
                className="rounded-[4px] bg-[#ff5757] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ef4444]"
              >
                Start a fresh form
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-[4px] border border-[#ececec] bg-white px-5 py-5 shadow-sm">
            <div className="border-b border-[#ececec] pb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff5757]">
                Step {currentStep + 1} of {steps.length}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#111827]">
                {currentStep === 0
                  ? "Personal Details"
                  : currentStep === 1
                    ? "Academic Details"
                    : currentStep === 2
                      ? "Document Upload"
                      : currentStep === 3
                        ? "Payment"
                        : "Review & Submit"}
              </h2>
              <p className="mt-1 text-sm text-[#9ca3af]">
                {currentStep === 0
                  ? "Let's start with your basic personal information"
                  : currentStep === 1
                    ? "Tell us about your latest qualification and preferred course"
                    : currentStep === 2
                      ? "Upload the required mark sheets, ID proof, and photo for verification"
                      : currentStep === 3
                        ? "Complete the payment section to proceed"
                        : "Check your details carefully before submitting"}
              </p>
            </div>

            <div className="py-6">
              {currentStep === 0 && renderPersonalStep()}
              {currentStep === 1 && renderAcademicStep()}
              {currentStep === 2 && renderDocumentsStep()}
              {currentStep === 3 && renderPaymentStep()}
              {currentStep === 4 && renderReviewStep()}
            </div>

            {error ? (
              <div className="mb-5 rounded-[4px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#b91c1c]">
                {error}
              </div>
            ) : null}

            <div className="border-t border-[#ececec] pt-5">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={currentStep === 0 ? handleSaveAndExit : () => setCurrentStep((previous) => previous - 1)}
                  className="inline-flex items-center justify-center rounded-[4px] border border-[#e5e7eb] px-5 py-3 text-sm font-medium text-[#6b7280] transition hover:bg-[#fafafa]"
                >
                  {currentStep === 0 ? "Save & Exit" : "Back"}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-[4px] bg-[#FF3C3C] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,87,87,0.2)] transition hover:bg-[#ef4444] disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? (
                    <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Submitting...</>
                  ) : currentStepConfig.actionLabel}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 h-[70px] rounded-[4px] bg-[#d9d9d9]" />
        </>
      )}
    </div>
  );
}
