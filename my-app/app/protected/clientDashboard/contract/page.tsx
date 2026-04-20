"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowLeft, Image, CheckCircle2, BookOpen, Package, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DBPlan, DBUser } from "@/components/dashboardComponents/types";

export const PAGE_BG: React.CSSProperties = {
  background: 'linear-gradient(0deg, #000000 80%, #0f262e 87%, #42696a 100%)',
};

// ─── ACCENTS ─────────────────────────────────────────────────────────────────
const ACCENTS = {
  pink:   { text: "text-[#c975b9]", bg: "bg-[#c975b9]/10", border: "border-[#c975b9]/20" },
  blue:   { text: "text-[#629fcc]", bg: "bg-[#629fcc]/10", border: "border-[#629fcc]/20" },
  slate:  { text: "text-[#91bee3]", bg: "bg-[#91bee3]/10", border: "border-[#91bee3]/20" },
  teal:   { text: "text-[#4ecdc4]", bg: "bg-[#4ecdc4]/10", border: "border-[#4ecdc4]/20" },
};
type AccentKey = keyof typeof ACCENTS;

const LOGO_MAX_BYTES = 15 * 1024 * 1024;
const LOGO_ALLOWED_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"] as const;

function LoadingRow() {
  return (
    <div className="px-5 py-4 flex items-center gap-3 animate-pulse border-b border-white/[0.06]">
      <div className="w-9 h-9 rounded-lg bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/5 rounded w-1/3" />
        <div className="h-2.5 bg-white/5 rounded w-1/5" />
      </div>
    </div>
  );
}

export default function ContractPage() {
  const supabase = createClient();
  const router = useRouter();
  const [dbPlan, setDbPlan] = useState<DBPlan | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasEnterpriseLogo, setHasEnterpriseLogo] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const refreshEnterpriseLogo = useCallback(async (userId: string) => {
    const { data: files, error } = await supabase.storage
      .from("enterprise-logos")
      .list(userId, { limit: 40 });
    if (error || !files?.length) {
      setHasEnterpriseLogo(false);
      setLogoPreviewUrl(null);
      return;
    }
    const hasLogo = files.some((f) => f.name === "logo");
    if (!hasLogo) {
      setHasEnterpriseLogo(false);
      setLogoPreviewUrl(null);
      return;
    }
    setHasEnterpriseLogo(true);
    const path = `${userId}/logo`;
    const { data: signed, error: signErr } = await supabase.storage
      .from("enterprise-logos")
      .createSignedUrl(path, 60 * 60);
    if (!signErr && signed?.signedUrl) {
      setLogoPreviewUrl(signed.signedUrl);
      return;
    }
    const { data: pub } = supabase.storage.from("enterprise-logos").getPublicUrl(path);
    setLogoPreviewUrl(pub.publicUrl);
  }, [supabase]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { 
        setError("Not authenticated"); 
        setLoading(false); 
        return; 
      }

      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("user_uuid", user.id)
          .single();
        
        if (userError) throw new Error(userError.message);
        
        const enterpriseUuid = userData.user_uuid;
        setDbUser(userData);
        
        const { data: planData, error: planError } = await supabase
          .from("plans")
          .select("*")
          .eq("user_uuid", enterpriseUuid)
          .maybeSingle();
        
        if (planError) throw new Error(planError.message);
        setDbPlan(planData ?? null);
        
        const { count: studentCountData, error: studentError } = await supabase
          .from("enterprise_students")
          .select("*", { count: "exact" })
          .eq("enterprise_uuid", enterpriseUuid);
        
        if (studentError) {
          setStudentCount(0);
        } else {
          setStudentCount(studentCountData ?? 0);
        }
        
        await refreshEnterpriseLogo(enterpriseUuid);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [supabase, refreshEnterpriseLogo]);

  async function handleEnterpriseLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setLogoUploadError(null);

    if (file.size > LOGO_MAX_BYTES) {
      setLogoUploadError("File exceeds the maximum size of 15 MB.");
      return;
    }
    if (file.size === 0) {
      setLogoUploadError("File is empty.");
      return;
    }
    const mime = file.type.trim().toLowerCase();
    if (!mime || !(LOGO_ALLOWED_MIME as readonly string[]).includes(mime)) {
      setLogoUploadError("File type not allowed. Use JPEG, PNG, GIF, WebP, or SVG.");
      return;
    }

    setLogoUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLogoUploadError("Not authenticated.");
        return;
      }
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/enterprise/upload-logo", { method: "POST", body: fd });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setLogoUploadError(typeof json.error === "string" ? json.error : "Upload failed.");
        return;
      }
      await refreshEnterpriseLogo(user.id);
    } catch {
      setLogoUploadError("Something went wrong while uploading.");
    } finally {
      setLogoUploading(false);
    }
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0b081c]">
        <div className="text-center space-y-1">
          <p className="text-[#c975b9] text-xs font-bold uppercase tracking-[0.18em]">Error</p>
          <p className="text-white/50 text-base">{error}</p>
        </div>
      </div>
    );
  }

  const shipped = dbPlan?.robots_shipped ?? 0;
  const allocated = dbPlan?.robots_allocated ?? 0;
  const robotsRemaining = Math.max(0, allocated - shipped);
  const robotPct = allocated > 0 ? Math.min(100, Math.round((shipped / allocated) * 100)) : 0;
  
  const totalLicenses = dbPlan?.curriculums_allocated ?? 0;
  const licensesUsed = studentCount;
  const licensesRemaining = Math.max(0, totalLicenses - licensesUsed);
  const licensePct = totalLicenses > 0 ? Math.min(100, Math.round((licensesUsed / totalLicenses) * 100)) : 0;
  const isAtCapacity = totalLicenses > 0 && licensesUsed >= totalLicenses;

  return (
    <div className="flex-1 px-5 sm:px-8 py-8 space-y-5 overflow-auto min-h-screen" style={PAGE_BG}>
      
      {/* Header */}
      <div className="pb-4 border-b border-white/[0.125] space-y-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/protected/clientDashboard")}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/60 text-[10px] font-bold uppercase tracking-[0.18em] transition"
          >
            <ArrowLeft size={11} />Back
          </button>
        </div>
        <div>
          <h1 className="text-white/75 text-2xl font-bold tracking-wide">Contract Details</h1>
          <p className="text-white/35 text-sm font-light tracking-wide mt-1">Review your agreement and fulfillment status</p>
        </div>
      </div>

      {/* Contract Section */}
      <div className={`rounded-xl bg-[#0d0b1e] border ${ACCENTS.teal.border} overflow-hidden`}>
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg ${ACCENTS.teal.bg} flex items-center justify-center`}>
              <FileText size={14} className={ACCENTS.teal.text} />
            </div>
            <h2 className="text-white/55 text-xs uppercase tracking-[0.18em] font-bold">Active Contract</h2>
          </div>
        </div>

        {loading ? (
          <LoadingRow />
        ) : !dbPlan ? (
          <div className="px-5 py-8 text-center text-white/20 text-xs tracking-[0.18em] uppercase">No contract on file — contact your FBX representative</div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {/* Top Row: Contract Value, Robots Remaining, Licenses Remaining */}
            <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
              {[
                { label: "Contract Value", value: `$${dbPlan.price?.toLocaleString() ?? "—"}`, accent: "teal" as AccentKey },
                { label: "Robots Remaining", value: `${robotsRemaining}`, accent: "blue" as AccentKey },
                { label: "Licenses Remaining", value: `${licensesRemaining}`, accent: "slate" as AccentKey },
              ].map(({ label, value, accent }) => {
                const a = ACCENTS[accent];
                return (
                  <div key={label} className="relative p-5">
                    <div className={`absolute inset-x-0 top-0 h-px ${a.bg}`} />
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold mb-2">{label}</p>
                    <p className={`text-3xl font-light tabular-nums ${a.text}`}>{value}</p>
                  </div>
                );
              })}
            </div>

            {/* Robot Fulfillment Progress */}
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg ${ACCENTS.blue.bg} flex items-center justify-center`}>
                  <Package size={12} className={ACCENTS.blue.text} />
                </div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold">Robot Fulfillment</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold">Progress</span>
                <span className="text-[10px] text-[#629fcc] tabular-nums font-bold">{robotPct}%</span>
              </div>
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-[#629fcc] rounded-full transition-all duration-700" style={{ width: `${robotPct}%` }} />
              </div>
              <p className="text-[10px] text-white/20">{shipped} of {allocated} robots shipped ({robotsRemaining} remaining)</p>
            </div>

            {/* Licenses Fulfillment Progress */}
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg ${ACCENTS.slate.bg} flex items-center justify-center`}>
                  <BookOpen size={12} className={ACCENTS.slate.text} />
                </div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold">Student Licenses</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold">Enrollment</span>
                <span className="text-[10px] text-[#91bee3] tabular-nums font-bold">{licensePct}%</span>
              </div>
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-[#91bee3] rounded-full transition-all duration-700" style={{ width: `${licensePct}%` }} />
              </div>
              <p className="text-[10px] text-white/20">
                {licensesUsed} of {totalLicenses} students enrolled ({licensesRemaining} seats remaining)
                {isAtCapacity && totalLicenses > 0 && (
                  <span className="block text-[#c975b9] mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> At maximum capacity
                  </span>
                )}
                {totalLicenses === 0 && (
                  <span className="block text-[#c975b9] mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> No student licenses allocated
                  </span>
                )}
              </p>
            </div>

            {/* Contract Notes */}
            {dbPlan.description && (
              <div className="px-5 py-4 space-y-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold">Contract Notes</p>
                <p className="text-white/40 text-sm leading-relaxed">{dbPlan.description}</p>
              </div>
            )}
            
            {/* Contract Date */}
            {dbPlan.created_at && (
              <div className="px-5 py-3 border-t border-white/[0.06]">
                <p className="text-[10px] text-white/20">Contract established {new Date(dbPlan.created_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enterprise Logo Section */}
      <div className={`rounded-xl bg-[#0d0b1e] border ${ACCENTS.slate.border} overflow-hidden`}>
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg ${ACCENTS.slate.bg} flex items-center justify-center`}>
              <Image size={14} className={ACCENTS.slate.text} />
            </div>
            <h2 className="text-white/55 text-xs uppercase tracking-[0.18em] font-bold">Invoice Logo</h2>
          </div>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          <div className="flex items-start gap-4 flex-wrap">
            {hasEnterpriseLogo && logoPreviewUrl ? (
              <div className="flex-shrink-0 w-20 h-20 rounded-lg border border-white/[0.08] bg-white/[0.03] overflow-hidden flex items-center justify-center">
                <img src={logoPreviewUrl} alt="Enterprise logo" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-20 h-20 rounded-lg border border-white/[0.06] border-dashed bg-white/[0.02] flex items-center justify-center">
                <Image size={24} className="text-white/15" aria-hidden />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white/45 text-sm">Your logo will appear on all invoices generated by FBX.</p>
              <p className="text-white/25 text-xs mt-1">PNG/JPG/GIF/WebP/SVG · max 15 MB · square recommended</p>
              {logoUploadError && (
                <p className="text-[#c975b9] text-xs mt-2 leading-relaxed">{logoUploadError}</p>
              )}
            </div>
          </div>
          <input
            ref={logoFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleEnterpriseLogoFile}
          />
          <button
            type="button"
            onClick={() => logoFileInputRef.current?.click()}
            disabled={logoUploading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#91bee3]/10 border border-[#91bee3]/20 text-[#91bee3] text-[10px] uppercase tracking-[0.18em] font-bold hover:bg-[#91bee3]/15 transition w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {logoUploading ? "Uploading…" : hasEnterpriseLogo ? "Upload New Logo" : "Upload Logo"}
          </button>
        </div>
      </div>
    </div>
  );
}