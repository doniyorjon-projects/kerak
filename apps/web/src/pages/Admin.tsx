import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Ban,
  Banknote,
  Check,
  ChevronDown,
  ChevronUp,
  Flag,
  ImageIcon,
  Inbox,
  Images,
  Pencil,
  Plus,
  ShieldCheck,
  Star,
  Tags,
  Trash2,
  UserCog,
  UserRoundCheck,
  Users,
  UserX,
  X,
} from "lucide-react";
import { CategoryType } from "@kerak/shared";
import type { PricingConfigDto } from "@kerak/shared";
import {
  addAdmin,
  approveListing,
  blockUser,
  dismissReport,
  fetchAdminStats,
  fetchAdmins,
  fetchPendingListings,
  fetchPendingReports,
  fetchUserListings,
  fetchUsers,
  rejectListing,
  removeAdmin,
  resolveReport,
  unblockUser,
} from "../api/admin";
import {
  createBanner,
  deleteBanner,
  fetchAllBannersAdmin,
  updateBanner,
} from "../api/banners";
import { createCategory, deleteCategory, fetchCategories, updateCategory } from "../api/categories";
import { CATEGORY_ICONS } from "../data/categoryIcons";
import { uploadPhoto } from "../api/listings";
import { fetchPricing, updatePricing } from "../api/pricing";
import { ImageLightbox } from "../components/ImageLightbox";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { useBackButton } from "../hooks/useBackButton";
import { useTranslation } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";

function ModerationTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: listings, isLoading } = useQuery({
    queryKey: ["admin", "pending-listings"],
    queryFn: fetchPendingListings,
  });
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "pending-listings"] });
  const approveMutation = useMutation({ mutationFn: approveListing, onSuccess: invalidate });
  const rejectMutation = useMutation({ mutationFn: rejectListing, onSuccess: invalidate });

  if (isLoading) return <Spinner label={t("loading")} />;
  if (listings?.length === 0) return <EmptyState icon={Inbox} title={t("admin.noPending")} />;

  return (
    <div className="flex flex-col gap-3">
      {listings?.map((listing) => (
        <div key={listing.id} className="card flex flex-col gap-2">
          {listing.photos.length > 0 && (
            <div className="no-scrollbar -mx-4 -mt-4 flex gap-1.5 overflow-x-auto px-4 pb-1 pt-0">
              {listing.photos.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setLightbox({ photos: listing.photos, index: i })}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-secondary"
                >
                  <img src={url} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
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
      {lightbox && (
        <ImageLightbox
          photos={lightbox.photos}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
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

function CategoriesTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const [parentId, setParentId] = useState("");
  const [nameUz, setNameUz] = useState("");
  const [icon, setIcon] = useState("");
  const [type, setType] = useState<CategoryType>(CategoryType.SERVICE);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  const roots = (categories ?? []).filter((c) => !c.parentId);
  const childrenOf = (id: string) => (categories ?? []).filter((c) => c.parentId === id);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["categories"] });

  const createMutation = useMutation({
    mutationFn: () =>
      createCategory({
        nameUz,
        type: parentId ? (roots.find((r) => r.id === parentId)?.type ?? type) : type,
        icon: icon || undefined,
        parentId: parentId || undefined,
      }),
    onSuccess: () => {
      setNameUz("");
      setIcon("");
      invalidate();
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => updateCategory(id, { nameUz: editName, icon: editIcon || undefined }),
    onSuccess: () => {
      setEditingId(null);
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: invalidate,
  });

  const startEdit = (id: string, nameUz: string, icon: string | null) => {
    setEditingId(id);
    setEditName(nameUz);
    setEditIcon(icon ?? "");
  };

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setFormError(null);
          createMutation.mutate();
        }}
        className="card flex flex-col gap-3"
      >
        <span className="section-title">{t("admin.addCategory")}</span>
        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="input">
          <option value="">{t("admin.newRootCategory")}</option>
          {roots.map((r) => (
            <option key={r.id} value={r.id}>
              {r.icon} {r.nameUz}
            </option>
          ))}
        </select>
        {!parentId && (
          <div className="flex overflow-hidden rounded-full border border-divider bg-app p-0.5">
            <button
              type="button"
              onClick={() => setType(CategoryType.SERVICE)}
              className={`flex-1 rounded-full py-1.5 text-xs font-medium transition ${type === CategoryType.SERVICE ? "bg-brand text-brand-contrast" : "text-hint"}`}
            >
              {t("admin.typeService")}
            </button>
            <button
              type="button"
              onClick={() => setType(CategoryType.PRODUCT)}
              className={`flex-1 rounded-full py-1.5 text-xs font-medium transition ${type === CategoryType.PRODUCT ? "bg-brand text-brand-contrast" : "text-hint"}`}
            >
              {t("admin.typeProduct")}
            </button>
          </div>
        )}
        <input
          value={nameUz}
          onChange={(e) => setNameUz(e.target.value)}
          placeholder={t("admin.categoryName")}
          className="input"
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-hint">{t("admin.categoryIcon")}</span>
          <div className="grid grid-cols-8 gap-1.5 rounded-xl bg-app p-2">
            {CATEGORY_ICONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg transition active:scale-90 ${icon === emoji ? "bg-brand/20 ring-2 ring-brand" : "bg-surface"}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder={t("admin.categoryIconCustom")}
            className="input"
          />
        </div>
        {formError && <span className="text-xs text-destructive">{formError}</span>}
        <button
          type="submit"
          disabled={nameUz.trim().length < 2 || createMutation.isPending}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          {t("admin.addCategory")}
        </button>
      </form>

      {isLoading && <Spinner label={t("loading")} />}

      <div className="flex flex-col gap-3">
        {roots.map((root) => (
          <div key={root.id} className="card flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-ink">
                {root.icon} {root.nameUz}
              </span>
              <button
                onClick={() => deleteMutation.mutate(root.id)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex flex-col gap-1.5 border-l-2 border-divider pl-3">
              {childrenOf(root.id).map((c) =>
                editingId === c.id ? (
                  <div key={c.id} className="flex items-center gap-1.5">
                    <input
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                      className="input w-14 px-2 text-center"
                    />
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input flex-1"
                    />
                    <button
                      onClick={() => updateMutation.mutate(c.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-hint"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div key={c.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-ink">
                      {c.icon} {c.nameUz}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(c.id, c.nameUz, c.icon)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-hint"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(c.id)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
      {deleteMutation.error && (
        <span className="text-xs text-destructive">{deleteMutation.error.message}</span>
      )}
    </div>
  );
}

function StatsTab() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useQuery({ queryKey: ["admin", "stats"], queryFn: fetchAdminStats });

  if (isLoading) return <Spinner label={t("loading")} />;
  if (!stats) return null;

  const cards: { label: string; value: number | string }[] = [
    { label: t("admin.statUsers"), value: stats.users.total },
    { label: t("admin.statNewUsersWeek"), value: stats.users.newThisWeek },
    { label: t("admin.statListings"), value: stats.listings.total },
    { label: t("admin.statActiveListings"), value: stats.listings.active },
    { label: t("admin.statPendingListings"), value: stats.listings.pending },
    { label: t("admin.statNewListingsWeek"), value: stats.listings.newThisWeek },
    { label: t("admin.statCategories"), value: stats.categories.total },
    { label: t("admin.statPendingReports"), value: stats.reports.pending },
    { label: t("admin.statFavorites"), value: stats.favorites },
    { label: t("admin.statMessages"), value: stats.messages },
    { label: t("admin.statPaidBoosts"), value: stats.boosts.paidCount },
    { label: t("admin.statRevenue"), value: `${stats.boosts.totalRevenue.toLocaleString("uz-UZ")} ${t("som")}` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="card flex flex-col gap-1">
          <span className="text-2xl font-bold text-ink">{c.value}</span>
          <span className="text-xs text-hint">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

function AdminsTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: admins, isLoading } = useQuery({ queryKey: ["admin", "admins"], queryFn: fetchAdmins });
  const [identifier, setIdentifier] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });

  const addMutation = useMutation({
    mutationFn: () => addAdmin(identifier),
    onSuccess: () => {
      setIdentifier("");
      setFormError(null);
      invalidate();
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: removeAdmin,
    onSuccess: invalidate,
    onError: (err: Error) => setFormError(err.message),
  });

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setFormError(null);
          addMutation.mutate();
        }}
        className="card flex flex-col gap-3"
      >
        <span className="section-title">{t("admin.addAdmin")}</span>
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={t("admin.addAdminPlaceholder")}
          className="input"
        />
        {formError && <span className="text-xs text-destructive">{formError}</span>}
        <button type="submit" disabled={identifier.trim().length < 2 || addMutation.isPending} className="btn-primary">
          <UserCog className="h-4 w-4" />
          {t("admin.addAdmin")}
        </button>
      </form>

      {isLoading && <Spinner label={t("loading")} />}

      <div className="flex flex-col gap-2">
        {admins?.map((a) => (
          <div key={a.id} className="card flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-ink">{a.username ? `@${a.username}` : a.firstName}</span>
              <span className="text-xs text-hint">{a.telegramId}</span>
            </div>
            <button
              onClick={() => removeMutation.mutate(a.id)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
            >
              <UserX className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const USER_LISTING_STATUS_CLASS: Record<string, string> = {
  PENDING: "text-amber-500",
  ACTIVE: "text-emerald-500",
  PAUSED: "text-hint",
  SOLD: "text-link",
  REJECTED: "text-destructive",
};

function UserListingsPanel({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const { data: listings, isLoading } = useQuery({
    queryKey: ["admin", "user-listings", userId],
    queryFn: () => fetchUserListings(userId),
  });

  if (isLoading) return <Spinner label={t("loading")} />;
  if (listings?.length === 0) {
    return <span className="text-xs text-hint">{t("admin.userNoListings")}</span>;
  }

  return (
    <div className="flex flex-col gap-2">
      {listings?.map((l) => (
        <Link
          key={l.id}
          to={`/listings/${l.id}`}
          className="flex items-center justify-between gap-2 rounded-xl bg-surface-secondary px-3 py-2 transition active:scale-[0.98]"
        >
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-medium text-ink">{l.title}</span>
            <span className="text-[11px] text-hint">
              {l.category.icon} {l.category.nameUz} ·{" "}
              {l.isNegotiable || l.price == null ? t("negotiable") : `${l.price.toLocaleString("uz-UZ")} ${t("som")}`}
            </span>
          </div>
          <span className={`shrink-0 text-[11px] font-semibold ${USER_LISTING_STATUS_CLASS[l.status] ?? "text-hint"}`}>
            {t(`status.${l.status.toLowerCase()}` as TranslationKey)}
          </span>
        </Link>
      ))}
    </div>
  );
}

function UsersTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({ queryKey: ["admin", "users"], queryFn: fetchUsers });
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  const blockMutation = useMutation({ mutationFn: blockUser, onSuccess: invalidate });
  const unblockMutation = useMutation({ mutationFn: unblockUser, onSuccess: invalidate });

  const filtered = (users ?? []).filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.telegramId.includes(q)
    );
  });

  if (isLoading) return <Spinner label={t("loading")} />;

  return (
    <div className="flex flex-col gap-3">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("admin.searchUsers")}
        className="input"
      />

      {filtered.length === 0 && <EmptyState icon={Users} title={t("admin.noUsers")} />}

      <div className="flex flex-col gap-2">
        {filtered.map((u) => (
          <div key={u.id} className="card flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-base font-bold text-brand-contrast">
                {u.firstName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-1 flex-col">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  {u.firstName}
                  {u.isAdmin && <ShieldCheck className="h-3.5 w-3.5 text-brand" />}
                  {u.isBlocked && <Ban className="h-3.5 w-3.5 text-destructive" />}
                </span>
                <span className="text-xs text-hint">
                  {u.username ? `@${u.username}` : u.telegramId} · {u.telegramId}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-hint">
              <span>
                {t("admin.userListings")}: <span className="font-medium text-ink">{u.listingsCount}</span>
              </span>
              {u.rating.count > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <span className="font-medium text-ink">{u.rating.avg?.toFixed(1)}</span> ({u.rating.count})
                </span>
              )}
              {u.phone && <span>{u.phone}</span>}
              <span>{new Date(u.createdAt).toLocaleDateString("uz-UZ")}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExpandedId((id) => (id === u.id ? null : u.id))}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-surface-secondary py-2.5 text-xs font-semibold text-ink transition active:scale-[0.98]"
              >
                {expandedId === u.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {t("admin.viewListings")}
              </button>
              {u.isBlocked ? (
                <button
                  onClick={() => unblockMutation.mutate(u.id)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 py-2.5 text-xs font-semibold text-emerald-500 transition active:scale-[0.98]"
                >
                  <UserRoundCheck className="h-3.5 w-3.5" />
                  {t("admin.unblockUser")}
                </button>
              ) : (
                <button
                  onClick={() => blockMutation.mutate(u.id)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive/10 py-2.5 text-xs font-semibold text-destructive transition active:scale-[0.98]"
                >
                  <Ban className="h-3.5 w-3.5" />
                  {t("admin.blockUser")}
                </button>
              )}
            </div>

            {expandedId === u.id && <UserListingsPanel userId={u.id} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: pricing, isLoading } = useQuery({ queryKey: ["pricing"], queryFn: fetchPricing });

  const [form, setForm] = useState<Partial<PricingConfigDto>>({});

  useEffect(() => {
    if (pricing) setForm(pricing);
  }, [pricing]);

  const saveMutation = useMutation({
    mutationFn: () => updatePricing(form),
    onSuccess: (updated) => queryClient.setQueryData(["pricing"], updated),
  });

  const fields: { key: keyof PricingConfigDto; labelKey: TranslationKey }[] = [
    { key: "boostDays3", labelKey: "admin.priceBoost3" },
    { key: "boostDays7", labelKey: "admin.priceBoost7" },
    { key: "boostDays30", labelKey: "admin.priceBoost30" },
    { key: "planStandard", labelKey: "admin.pricePlanStandard" },
    { key: "planBusiness", labelKey: "admin.pricePlanBusiness" },
  ];

  if (isLoading) return <Spinner label={t("loading")} />;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveMutation.mutate();
      }}
      className="card flex flex-col gap-3"
    >
      <span className="section-title">{t("admin.pricing")}</span>
      {fields.map((field) => (
        <label key={field.key} className="label">
          {t(field.labelKey)}
          <input
            type="number"
            min={0}
            value={form[field.key] ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, [field.key]: Number(e.target.value) }))}
            className="input"
          />
        </label>
      ))}
      <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
        {saveMutation.isPending ? t("saving") : t("save")}
      </button>
      {saveMutation.isSuccess && <span className="text-xs text-emerald-500">{t("admin.pricingSaved")}</span>}
    </form>
  );
}

export function Admin() {
  useBackButton("/profile");
  const { t } = useTranslation();
  const [tab, setTab] = useState<
    "moderation" | "reports" | "banners" | "categories" | "stats" | "admins" | "users" | "pricing"
  >("moderation");

  return (
    <div className="page">
      <PageHeader title={t("admin.title")} backTo="/profile" />

      <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
        <div className="flex w-fit gap-1 rounded-full border border-divider bg-surface p-1 shadow-soft">
          <button
            onClick={() => setTab("moderation")}
            className={`flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition ${tab === "moderation" ? "bg-brand text-brand-contrast" : "text-hint"}`}
          >
            <ShieldCheck className="h-4 w-4" />
            {t("admin.moderation")}
          </button>
          <button
            onClick={() => setTab("reports")}
            className={`flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition ${tab === "reports" ? "bg-brand text-brand-contrast" : "text-hint"}`}
          >
            <Flag className="h-4 w-4" />
            {t("admin.reports")}
          </button>
          <button
            onClick={() => setTab("banners")}
            className={`flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition ${tab === "banners" ? "bg-brand text-brand-contrast" : "text-hint"}`}
          >
            <Images className="h-4 w-4" />
            {t("admin.banners")}
          </button>
          <button
            onClick={() => setTab("categories")}
            className={`flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition ${tab === "categories" ? "bg-brand text-brand-contrast" : "text-hint"}`}
          >
            <Tags className="h-4 w-4" />
            {t("admin.categories")}
          </button>
          <button
            onClick={() => setTab("stats")}
            className={`flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition ${tab === "stats" ? "bg-brand text-brand-contrast" : "text-hint"}`}
          >
            <BarChart3 className="h-4 w-4" />
            {t("admin.stats")}
          </button>
          <button
            onClick={() => setTab("admins")}
            className={`flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition ${tab === "admins" ? "bg-brand text-brand-contrast" : "text-hint"}`}
          >
            <UserCog className="h-4 w-4" />
            {t("admin.admins")}
          </button>
          <button
            onClick={() => setTab("users")}
            className={`flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition ${tab === "users" ? "bg-brand text-brand-contrast" : "text-hint"}`}
          >
            <Users className="h-4 w-4" />
            {t("admin.users")}
          </button>
          <button
            onClick={() => setTab("pricing")}
            className={`flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition ${tab === "pricing" ? "bg-brand text-brand-contrast" : "text-hint"}`}
          >
            <Banknote className="h-4 w-4" />
            {t("admin.pricing")}
          </button>
        </div>
      </div>

      {tab === "moderation" && <ModerationTab />}
      {tab === "reports" && <ReportsTab />}
      {tab === "banners" && <BannersTab />}
      {tab === "categories" && <CategoriesTab />}
      {tab === "stats" && <StatsTab />}
      {tab === "admins" && <AdminsTab />}
      {tab === "users" && <UsersTab />}
      {tab === "pricing" && <PricingTab />}
    </div>
  );
}
