import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag, ImageIcon, Inbox, Images, ShieldCheck, Trash2 } from "lucide-react";
import {
  approveListing,
  dismissReport,
  fetchPendingListings,
  fetchPendingReports,
  rejectListing,
  resolveReport,
} from "../api/admin";
import {
  createBanner,
  deleteBanner,
  fetchAllBannersAdmin,
  updateBanner,
} from "../api/banners";
import { uploadPhoto } from "../api/listings";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { useTranslation } from "../i18n/LanguageContext";

function ModerationTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: listings, isLoading } = useQuery({
    queryKey: ["admin", "pending-listings"],
    queryFn: fetchPendingListings,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "pending-listings"] });
  const approveMutation = useMutation({ mutationFn: approveListing, onSuccess: invalidate });
  const rejectMutation = useMutation({ mutationFn: rejectListing, onSuccess: invalidate });

  if (isLoading) return <Spinner label={t("loading")} />;
  if (listings?.length === 0) return <EmptyState icon={Inbox} title={t("admin.noPending")} />;

  return (
    <div className="flex flex-col gap-3">
      {listings?.map((listing) => (
        <div key={listing.id} className="card flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-ink">{listing.title}</span>
            <span className="pill shrink-0 bg-surface-secondary text-hint">{listing.category.nameUz}</span>
          </div>
          <span className="text-sm text-hint">{listing.description}</span>
          <span className="text-sm font-semibold text-brand">
            {listing.isNegotiable || listing.price == null
              ? t("negotiable")
              : `${listing.price.toLocaleString("uz-UZ")} ${t("som")}`}
          </span>
          <span className="text-xs text-hint">
            {t("admin.seller")}: {listing.seller.username ? `@${listing.seller.username}` : listing.seller.firstName}
          </span>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => approveMutation.mutate(listing.id)}
              className="flex-1 rounded-xl bg-emerald-500/10 py-2.5 text-sm font-semibold text-emerald-500 transition active:scale-[0.98]"
            >
              {t("admin.approve")}
            </button>
            <button
              onClick={() => rejectMutation.mutate(listing.id)}
              className="flex-1 rounded-xl bg-destructive/10 py-2.5 text-sm font-semibold text-destructive transition active:scale-[0.98]"
            >
              {t("admin.reject")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportsTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin", "pending-reports"],
    queryFn: fetchPendingReports,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "pending-reports"] });
  const resolveMutation = useMutation({ mutationFn: resolveReport, onSuccess: invalidate });
  const dismissMutation = useMutation({ mutationFn: dismissReport, onSuccess: invalidate });

  if (isLoading) return <Spinner label={t("loading")} />;
  if (reports?.length === 0) return <EmptyState icon={Flag} title={t("admin.noReports")} />;

  return (
    <div className="flex flex-col gap-3">
      {reports?.map((report) => (
        <div key={report.id} className="card flex flex-col gap-2">
          <Link to={`/listings/${report.listing.id}`} className="font-medium text-brand">
            {report.listing.title}
          </Link>
          <span className="text-sm text-ink">{report.reason}</span>
          <span className="text-xs text-hint">
            {t("admin.reporter")}:{" "}
            {report.reporter.username ? `@${report.reporter.username}` : report.reporter.firstName}
          </span>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => resolveMutation.mutate(report.id)}
              className="flex-1 rounded-xl bg-emerald-500/10 py-2.5 text-sm font-semibold text-emerald-500 transition active:scale-[0.98]"
            >
              {t("admin.resolved")}
            </button>
            <button
              onClick={() => dismissMutation.mutate(report.id)}
              className="flex-1 rounded-xl bg-surface-secondary py-2.5 text-sm font-semibold text-hint transition active:scale-[0.98]"
            >
              {t("admin.dismiss")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function BannersTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [linkUrl, setLinkUrl] = useState("");
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: banners, isLoading } = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: fetchAllBannersAdmin,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });

  const createMutation = useMutation({
    mutationFn: () => createBanner({ imageUrl: pendingImageUrl!, linkUrl: linkUrl || null }),
    onSuccess: () => {
      setPendingImageUrl(null);
      setLinkUrl("");
      invalidate();
    },
  });
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateBanner(id, { isActive }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({ mutationFn: deleteBanner, onSuccess: invalidate });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded = await uploadPhoto(file);
      setPendingImageUrl(uploaded.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t("create.errPhoto"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex flex-col gap-3">
        <span className="section-title">{t("admin.addBanner")}</span>
        {pendingImageUrl ? (
          <img src={pendingImageUrl} className="aspect-[21/9] w-full rounded-xl object-cover" />
        ) : (
          <label className="flex aspect-[21/9] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-divider text-hint">
            <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
            <span className="text-xs">{uploading ? "..." : t("admin.bannerImage")}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleImageChange} />
          </label>
        )}
        {uploadError && <div className="text-xs text-destructive">{uploadError}</div>}
        <input
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder={t("admin.bannerLink")}
          className="input"
        />
        <button
          onClick={() => createMutation.mutate()}
          disabled={!pendingImageUrl || createMutation.isPending}
          className="btn-primary"
        >
          {t("admin.addBanner")}
        </button>
      </div>

      {isLoading && <Spinner label={t("loading")} />}
      {banners?.length === 0 && <EmptyState icon={Images} title={t("admin.noBanners")} />}

      <div className="flex flex-col gap-2">
        {banners?.map((banner) => (
          <div key={banner.id} className="card flex items-center gap-3">
            <img src={banner.imageUrl} className="h-14 w-24 shrink-0 rounded-lg object-cover" />
            <div className="flex flex-1 flex-col gap-1">
              <span className="truncate text-xs text-hint">{banner.linkUrl ?? "—"}</span>
              <button
                onClick={() => toggleMutation.mutate({ id: banner.id, isActive: !banner.isActive })}
                className={`pill w-fit ${banner.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-surface-secondary text-hint"}`}
              >
                {banner.isActive ? t("admin.bannerActive") : t("admin.bannerInactive")}
              </button>
            </div>
            <button
              onClick={() => deleteMutation.mutate(banner.id)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Admin() {
  useBackButton("/profile");
  const { t } = useTranslation();
  const [tab, setTab] = useState<"moderation" | "reports" | "banners">("moderation");

  return (
    <div className="page">
      <PageHeader title={t("admin.title")} backTo="/profile" />

      <div className="flex overflow-hidden rounded-full border border-divider bg-surface p-1 shadow-soft">
        <button
          onClick={() => setTab("moderation")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition ${tab === "moderation" ? "bg-brand text-brand-contrast" : "text-hint"}`}
        >
          <ShieldCheck className="h-4 w-4" />
          {t("admin.moderation")}
        </button>
        <button
          onClick={() => setTab("reports")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition ${tab === "reports" ? "bg-brand text-brand-contrast" : "text-hint"}`}
        >
          <Flag className="h-4 w-4" />
          {t("admin.reports")}
        </button>
        <button
          onClick={() => setTab("banners")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition ${tab === "banners" ? "bg-brand text-brand-contrast" : "text-hint"}`}
        >
          <Images className="h-4 w-4" />
          {t("admin.banners")}
        </button>
      </div>

      {tab === "moderation" && <ModerationTab />}
      {tab === "reports" && <ReportsTab />}
      {tab === "banners" && <BannersTab />}
    </div>
  );
}
