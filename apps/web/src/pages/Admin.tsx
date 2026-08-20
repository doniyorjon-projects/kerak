import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  BarChart3,
  Ban,
  Banknote,
  BellOff,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Database,
  DollarSign,
  Flag,
  HeadphonesIcon,
  ImageIcon,
  Inbox,
  Images,
  Infinity as InfinityIcon,
  KeyRound,
  Link2,
  Megaphone,
  MessageSquareText,
  Pencil,
  Plus,
  Send,
  Settings,
  ShieldCheck,
  Star,
  Tags,
  Trash2,
  UserCog,
  UserRoundCheck,
  Users,
  UserX,
  Wallet,
  X,
} from "lucide-react";
import { CategoryType, UNLIMITED_LISTINGS } from "@kerak/shared";
import type { CategoryDto, PricingConfigDto } from "@kerak/shared";
import {
  addAdmin,
  approveListing,
  blockUser,
  broadcastMessage,
  deleteRequestAdmin,
  deleteUser,
  dismissReport,
  fetchAdminStats,
  fetchAdmins,
  fetchAllRequestsAdmin,
  fetchBotSettings,
  fetchPendingListings,
  fetchPendingReports,
  fetchStorageUsage,
  fetchUserListings,
  fetchUsers,
  rejectListing,
  removeAdmin,
  resolveReport,
  refreshUsdRate,
  setAnthropicApiKey,
  setChannel,
  setListingsLimit,
  setStarsRate,
  setSupportUrl,
  setTelegramChannelUrl,
  setUserPlan,
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
import { StorageMeter } from "../components/StorageMeter";
import { useBackButton } from "../hooks/useBackButton";
import { useTranslation } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";
import { formatRelativeDate } from "../utils/formatRelativeDate";

function ModerationTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: listings, isLoading } = useQuery({
    queryKey: ["admin", "pending-listings"],
    queryFn: fetchPendingListings,
  });
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "pending-listings"] });
  const approveMutation = useMutation({ mutationFn: approveListing, onSuccess: invalidate });
  const rejectMutation = useMutation({
    mutationFn: () => rejectListing(rejectingId!, rejectReason.trim() || undefined),
    onSuccess: () => {
      setRejectingId(null);
      setRejectReason("");
      invalidate();
    },
  });

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
          {rejectingId === listing.id ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t("admin.rejectReasonPlaceholder")}
                className="input min-h-16"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setRejectingId(null);
                    setRejectReason("");
                  }}
                  className="flex-1 rounded-xl bg-surface-secondary py-2.5 text-sm font-semibold text-hint transition active:scale-[0.98]"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending}
                  className="flex-1 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
                >
                  {t("admin.confirmReject")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => approveMutation.mutate(listing.id)}
                className="flex-1 rounded-xl bg-success/10 py-2.5 text-sm font-semibold text-success transition active:scale-[0.98]"
              >
                {t("admin.approve")}
              </button>
              <button
                onClick={() => setRejectingId(listing.id)}
                className="flex-1 rounded-xl bg-destructive/10 py-2.5 text-sm font-semibold text-destructive transition active:scale-[0.98]"
              >
                {t("admin.reject")}
              </button>
            </div>
          )}
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
              className="flex-1 rounded-xl bg-success/10 py-2.5 text-sm font-semibold text-success transition active:scale-[0.98]"
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
              <span className="truncate text-xs text-hint">{banner.linkUrl ?? "вЂ”"}</span>
              <button
                onClick={() => toggleMutation.mutate({ id: banner.id, isActive: !banner.isActive })}
                className={`pill w-fit ${banner.isActive ? "bg-success/10 text-success" : "bg-surface-secondary text-hint"}`}
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

interface CategoryNodeProps {
  category: CategoryDto;
  depth: number;
  childrenOf: (id: string) => CategoryDto[];
  expanded: Set<string>;
  toggleExpanded: (id: string) => void;
  editingId: string | null;
  editName: string;
  editNameRu: string;
  editIcon: string;
  setEditName: (v: string) => void;
  setEditNameRu: (v: string) => void;
  setEditIcon: (v: string) => void;
  startEdit: (c: CategoryDto) => void;
  cancelEdit: () => void;
  saveEdit: (id: string) => void;
  deleteCategory: (id: string) => void;
}

function CategoryNode({
  category,
  depth,
  childrenOf,
  expanded,
  toggleExpanded,
  editingId,
  editName,
  editNameRu,
  editIcon,
  setEditName,
  setEditNameRu,
  setEditIcon,
  startEdit,
  cancelEdit,
  saveEdit,
  deleteCategory,
}: CategoryNodeProps) {
  const { t } = useTranslation();
  const kids = childrenOf(category.id);
  const isOpen = expanded.has(category.id);
  const isRoot = category.level === 1;
  const isEditing = editingId === category.id;

  return (
    <div className="flex flex-col gap-1.5" style={{ paddingLeft: depth > 0 ? 14 : 0 }}>
      {isEditing ? (
        <div className="flex items-center gap-1.5">
          {isRoot && (
            <input value={editIcon} onChange={(e) => setEditIcon(e.target.value)} className="input w-14 px-2 text-center" />
          )}
          <div className="flex flex-1 flex-col gap-1">
            <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input" placeholder={t("admin.categoryName")} />
            <input value={editNameRu} onChange={(e) => setEditNameRu(e.target.value)} className="input" placeholder={t("admin.categoryNameRu")} />
          </div>
          <button
            onClick={() => saveEdit(category.id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-success"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={cancelEdit}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-hint"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className={`flex items-center justify-between gap-2 ${isRoot ? "card" : ""}`}>
          <button
            type="button"
            onClick={() => kids.length > 0 && toggleExpanded(category.id)}
            className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
          >
            {kids.length > 0 ? (
              isOpen ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-hint" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-hint" />
              )
            ) : (
              <span className="w-3.5 shrink-0" />
            )}
            {isRoot && category.icon && <span className="shrink-0 text-lg">{category.icon}</span>}
            <span className={`truncate ${isRoot ? "font-semibold text-ink" : "text-sm text-ink"}`}>{category.nameUz}</span>
            <span className="shrink-0 text-xs text-hint">({category.listingsCount})</span>
          </button>
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => startEdit(category)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-hint"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={() => deleteCategory(category.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
      {isOpen && kids.length > 0 && (
        <div className="flex flex-col gap-1.5 border-l-2 border-divider pl-2">
          {kids.map((c) => (
            <CategoryNode
              key={c.id}
              category={c}
              depth={depth + 1}
              childrenOf={childrenOf}
              expanded={expanded}
              toggleExpanded={toggleExpanded}
              editingId={editingId}
              editName={editName}
              editNameRu={editNameRu}
              editIcon={editIcon}
              setEditName={setEditName}
              setEditNameRu={setEditNameRu}
              setEditIcon={setEditIcon}
              startEdit={startEdit}
              cancelEdit={cancelEdit}
              saveEdit={saveEdit}
              deleteCategory={deleteCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoriesTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const [id, setId] = useState("");
  const [parentId, setParentId] = useState("");
  const [nameUz, setNameUz] = useState("");
  const [nameRu, setNameRu] = useState("");
  const [icon, setIcon] = useState("");
  const [type, setType] = useState<CategoryType>(CategoryType.SERVICE);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNameRu, setEditNameRu] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const roots = (categories ?? []).filter((c) => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
  const childrenOf = (parentId: string) =>
    (categories ?? []).filter((c) => c.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder);
  const categoriesById = new Map((categories ?? []).map((c) => [c.id, c] as const));

  const toggleExpanded = (catId: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["categories"] });

  const createMutation = useMutation({
    mutationFn: () =>
      createCategory({
        id,
        nameUz,
        nameRu: nameRu || undefined,
        type: parentId ? (categoriesById.get(parentId)?.type ?? type) : type,
        icon: !parentId && icon ? icon : undefined,
        parentId: parentId || undefined,
      }),
    onSuccess: () => {
      setId("");
      setNameUz("");
      setNameRu("");
      setIcon("");
      invalidate();
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (catId: string) =>
      updateCategory(catId, { nameUz: editName, nameRu: editNameRu || undefined, icon: editIcon || undefined }),
    onSuccess: () => {
      setEditingId(null);
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: invalidate,
  });

  const startEdit = (c: CategoryDto) => {
    setEditingId(c.id);
    setEditName(c.nameUz);
    setEditNameRu(c.nameRu ?? "");
    setEditIcon(c.icon ?? "");
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
        <input
          value={id}
          onChange={(e) => setId(e.target.value.toLowerCase())}
          placeholder={t("admin.categoryId")}
          className="input"
        />
        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="input">
          <option value="">{t("admin.newRootCategory")}</option>
          {(categories ?? [])
            .slice()
            .sort((a, b) => a.nameUz.localeCompare(b.nameUz))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {"—".repeat(c.level - 1)} {c.nameUz}
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
        <input
          value={nameRu}
          onChange={(e) => setNameRu(e.target.value)}
          placeholder={t("admin.categoryNameRu")}
          className="input"
        />
        {!parentId && (
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
        )}
        {formError && <span className="text-xs text-destructive">{formError}</span>}
        <button
          type="submit"
          disabled={id.trim().length < 2 || nameUz.trim().length < 2 || createMutation.isPending}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          {t("admin.addCategory")}
        </button>
      </form>

      {isLoading && <Spinner label={t("loading")} />}

      <div className="flex flex-col gap-2">
        {roots.map((root) => (
          <CategoryNode
            key={root.id}
            category={root}
            depth={0}
            childrenOf={childrenOf}
            expanded={expanded}
            toggleExpanded={toggleExpanded}
            editingId={editingId}
            editName={editName}
            editNameRu={editNameRu}
            editIcon={editIcon}
            setEditName={setEditName}
            setEditNameRu={setEditNameRu}
            setEditIcon={setEditIcon}
            startEdit={startEdit}
            cancelEdit={() => setEditingId(null)}
            saveEdit={(catId) => updateMutation.mutate(catId)}
            deleteCategory={(catId) => deleteMutation.mutate(catId)}
          />
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
  const { data: storage } = useQuery({
    queryKey: ["admin", "storage-usage"],
    queryFn: fetchStorageUsage,
    refetchInterval: 5 * 60 * 1000,
  });

  if (isLoading) return <Spinner label={t("loading")} />;
  if (!stats) return null;

  const cards: { label: string; value: number | string }[] = [
    { label: t("admin.statUsers"), value: stats.users.total },
    { label: t("admin.statNewUsersWeek"), value: stats.users.newThisWeek },
    { label: t("admin.statBlockedUsers"), value: stats.users.blocked },
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
    <div className="flex flex-col gap-3">
      {storage && (
        <div className="flex flex-col gap-2.5">
          <span className="section-title">{t("admin.storageTitle")}</span>
          <StorageMeter
            icon={Images}
            label={t("admin.storageR2Label")}
            usedBytes={storage.r2.usedBytes}
            limitBytes={storage.r2.limitBytes}
            hint={t("admin.storageObjectCount").replace("{count}", String(storage.r2.objectCount))}
          />
          <StorageMeter
            icon={Database}
            label={t("admin.storageDbLabel")}
            usedBytes={storage.database.usedBytes}
            limitBytes={storage.database.limitBytes}
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="card flex flex-col gap-1">
            <span className="text-2xl font-bold text-ink">{c.value}</span>
            <span className="text-xs text-hint">{c.label}</span>
          </div>
        ))}
      </div>
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
  PENDING: "text-promo",
  ACTIVE: "text-success",
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
              {l.category.icon} {l.category.nameUz} В·{" "}
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
  const { t, lang } = useTranslation();
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({ queryKey: ["admin", "users"], queryFn: fetchUsers });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"new" | "inactive">("new");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [tariffId, setTariffId] = useState<string | null>(null);
  const [limitDrafts, setLimitDrafts] = useState<Record<string, string>>({});

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  const blockMutation = useMutation({ mutationFn: blockUser, onSuccess: invalidate });
  const unblockMutation = useMutation({ mutationFn: unblockUser, onSuccess: invalidate });
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      setDeletingId(null);
      invalidate();
    },
  });
  const clearDraft = (id: string) =>
    setLimitDrafts((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const planMutation = useMutation({
    mutationFn: ({ id, tier }: { id: string; tier: "STANDARD" | "BUSINESS" }) => setUserPlan(id, tier),
    onSuccess: (_data, variables) => {
      clearDraft(variables.id);
      invalidate();
    },
  });
  const limitMutation = useMutation({
    mutationFn: ({ id, limit }: { id: string; limit: number }) => setListingsLimit(id, limit),
    onSuccess: (_data, variables) => {
      clearDraft(variables.id);
      invalidate();
    },
  });

  const filtered = (users ?? [])
    .filter((u) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        u.firstName.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.telegramId.includes(q)
      );
    })
    .slice()
    .sort((a, b) => {
      if (sortBy === "new") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      // "Kam faol" - hech qachon ko'rinmaganlar birinchi, keyin eng eski faollikdan yangisiga
      const aTime = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0;
      const bTime = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0;
      return aTime - bTime;
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

      <div className="flex gap-1 rounded-full bg-surface-secondary p-0.5">
        <button
          type="button"
          onClick={() => setSortBy("new")}
          className={`flex-1 rounded-full py-1.5 text-xs font-medium transition ${sortBy === "new" ? "bg-brand text-brand-contrast" : "text-hint"}`}
        >
          {t("admin.sortNewest")}
        </button>
        <button
          type="button"
          onClick={() => setSortBy("inactive")}
          className={`flex-1 rounded-full py-1.5 text-xs font-medium transition ${sortBy === "inactive" ? "bg-brand text-brand-contrast" : "text-hint"}`}
        >
          {t("admin.sortInactive")}
        </button>
      </div>

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
                  {u.botBlockedAt && <BellOff className="h-3.5 w-3.5 text-destructive" />}
                </span>
                <span className="text-xs text-hint">
                  {u.username ? `@${u.username}` : u.telegramId} В· {u.telegramId}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-hint">
              <span>
                {t("admin.userListings")}: <span className="font-medium text-ink">{u.listingsCount}</span>
              </span>
              <span>
                {t("admin.listingsLimit")}:{" "}
                <span className="font-medium text-ink">
                  {u.listingsLimit >= UNLIMITED_LISTINGS ? t("admin.unlimited") : u.listingsLimit}
                </span>
              </span>
              {u.rating.count > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-promo text-promo" />
                  <span className="font-medium text-ink">{u.rating.avg?.toFixed(1)}</span> ({u.rating.count})
                </span>
              )}
              {u.phone && <span>{u.phone}</span>}
              <span>{new Date(u.createdAt).toLocaleDateString("uz-UZ")}</span>
              {u.botBlockedAt ? (
                <span className="font-medium text-destructive">{t("admin.botBlocked")}</span>
              ) : (
                <span>
                  {t("admin.lastSeen")}: {u.lastSeenAt ? formatRelativeDate(u.lastSeenAt, t, lang) : t("admin.neverSeen")}
                </span>
              )}
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
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-success/10 py-2.5 text-xs font-semibold text-success transition active:scale-[0.98]"
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

            <button
              onClick={() => setTariffId((id) => (id === u.id ? null : u.id))}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-promo/10 py-2.5 text-xs font-semibold text-promo-dark transition active:scale-[0.98]"
            >
              <Award className="h-3.5 w-3.5" />
              {t("admin.manageTariff")}
              {tariffId === u.id ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {tariffId === u.id && (
              <div className="flex flex-col gap-2 rounded-xl bg-surface-secondary p-3">
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => planMutation.mutate({ id: u.id, tier: "STANDARD" })}
                    disabled={planMutation.isPending}
                    className="rounded-lg bg-surface py-2 text-xs font-semibold text-ink transition active:scale-[0.98] disabled:opacity-50"
                  >
                    {t("admin.tierStandard")}
                  </button>
                  <button
                    onClick={() => planMutation.mutate({ id: u.id, tier: "BUSINESS" })}
                    disabled={planMutation.isPending}
                    className="rounded-lg bg-surface py-2 text-xs font-semibold text-ink transition active:scale-[0.98] disabled:opacity-50"
                  >
                    {t("admin.tierBusiness")}
                  </button>
                  <button
                    onClick={() => limitMutation.mutate({ id: u.id, limit: UNLIMITED_LISTINGS })}
                    disabled={limitMutation.isPending}
                    className="flex items-center justify-center gap-1 rounded-lg bg-surface py-2 text-xs font-semibold text-brand transition active:scale-[0.98] disabled:opacity-50"
                  >
                    <InfinityIcon className="h-3.5 w-3.5" />
                    {t("admin.unlimited")}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={UNLIMITED_LISTINGS}
                    value={limitDrafts[u.id] ?? String(u.listingsLimit)}
                    onChange={(e) => setLimitDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))}
                    className="input flex-1"
                  />
                  <button
                    onClick={() =>
                      limitMutation.mutate({
                        id: u.id,
                        limit: Number(limitDrafts[u.id] ?? u.listingsLimit),
                      })
                    }
                    disabled={limitMutation.isPending}
                    className="btn-secondary px-4 disabled:opacity-50"
                  >
                    {t("save")}
                  </button>
                </div>
                {(planMutation.isError || limitMutation.isError) && (
                  <span className="text-xs text-destructive">
                    {(planMutation.error ?? limitMutation.error)?.message}
                  </span>
                )}
              </div>
            )}

            {!u.isAdmin && (
              deletingId === u.id ? (
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-destructive">{t("admin.confirmDeleteUser")}</span>
                  {deleteMutation.isError && (
                    <span className="text-xs text-destructive">{deleteMutation.error.message}</span>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDeletingId(null)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-surface-secondary py-2.5 text-xs font-semibold text-hint transition active:scale-[0.98]"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(u.id)}
                      disabled={deleteMutation.isPending}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive py-2.5 text-xs font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t("admin.deleteUser")}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setDeletingId(u.id)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive/10 py-2.5 text-xs font-semibold text-destructive transition active:scale-[0.98]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("admin.deleteUser")}
                </button>
              )
            )}

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
      {saveMutation.isSuccess && <span className="text-xs text-success">{t("admin.pricingSaved")}</span>}
    </form>
  );
}

function AdminRequestsTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useQuery({ queryKey: ["admin", "requests"], queryFn: fetchAllRequestsAdmin });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteRequestAdmin,
    onSuccess: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "requests"] });
    },
  });

  if (isLoading) return <Spinner label={t("loading")} />;
  if (!requests || requests.length === 0) {
    return <EmptyState icon={MessageSquareText} title={t("admin.noRequests")} />;
  }

  return (
    <div className="flex flex-col gap-2">
      {requests.map((r) => (
        <div key={r.id} className="card flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-ink">{r.title}</span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                r.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-surface-secondary text-hint"
              }`}
            >
              {r.status === "ACTIVE" ? t("request.statusActive") : t("request.statusClosed")}
            </span>
          </div>
          <p className="line-clamp-2 text-xs text-hint">{r.description}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-hint">
            <span className="flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              {r.budgetMin != null || r.budgetMax != null
                ? `${r.budgetMin?.toLocaleString("uz-UZ") ?? "0"} – ${r.budgetMax?.toLocaleString("uz-UZ") ?? "?"}`
                : t("request.anyBudget")}
            </span>
            <span>{r.category.nameUz}</span>
            <span>{r.author.username ? `@${r.author.username}` : r.author.firstName}</span>
            <span>{new Date(r.createdAt).toLocaleDateString("uz-UZ")}</span>
          </div>

          {deletingId === r.id ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-surface-secondary py-2.5 text-xs font-semibold text-hint transition active:scale-[0.98]"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => deleteMutation.mutate(r.id)}
                disabled={deleteMutation.isPending}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive py-2.5 text-xs font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("delete")}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeletingId(r.id)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-destructive/10 py-2.5 text-xs font-semibold text-destructive transition active:scale-[0.98]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("delete")}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function BroadcastTab() {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [listingId, setListingId] = useState("");

  const sendMutation = useMutation({
    mutationFn: () => broadcastMessage(message.trim(), listingId.trim() || undefined),
    onSuccess: () => {
      setMessage("");
      setListingId("");
    },
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Megaphone className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-ink">{t("admin.broadcastTitle")}</span>
        </div>
        <p className="text-xs text-hint">{t("admin.broadcastHint")}</p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("admin.broadcastPlaceholder")}
          rows={5}
          className="input resize-none"
        />
        <input
          value={listingId}
          onChange={(e) => setListingId(e.target.value)}
          placeholder={t("admin.broadcastListingIdPlaceholder")}
          className="input"
        />
        <button
          onClick={() => sendMutation.mutate()}
          disabled={sendMutation.isPending || !message.trim()}
          className="btn-primary disabled:opacity-50"
        >
          {sendMutation.isPending ? t("admin.broadcastSending") : t("admin.broadcastSend")}
        </button>
        {sendMutation.isSuccess && sendMutation.data && (
          <span className="text-xs text-success">
            {t("admin.broadcastResult")
              .replace("{sent}", String(sendMutation.data.sent))
              .replace("{failed}", String(sendMutation.data.failed))}
          </span>
        )}
        {sendMutation.isError && <span className="text-xs text-destructive">{sendMutation.error.message}</span>}
      </div>
    </div>
  );
}

function SettingsTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ["admin", "settings"], queryFn: fetchBotSettings });
  const [channelId, setChannelId] = useState("");
  const [starsRate, setStarsRateValue] = useState("");
  const [telegramChannelUrl, setTelegramChannelUrlValue] = useState("");
  const [supportUrl, setSupportUrlValue] = useState("");
  const [anthropicApiKey, setAnthropicApiKeyValue] = useState("");

  useEffect(() => {
    if (settings) {
      setChannelId(settings.channelId ?? "");
      setStarsRateValue(String(settings.starsRate));
      setTelegramChannelUrlValue(settings.telegramChannelUrl ?? "");
      setSupportUrlValue(settings.supportUrl ?? "");
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () => setChannel(channelId.trim() || null),
    onSuccess: (updated) => queryClient.setQueryData(["admin", "settings"], updated),
  });

  const saveStarsRateMutation = useMutation({
    mutationFn: () => setStarsRate(Number(starsRate)),
    onSuccess: (updated) => queryClient.setQueryData(["admin", "settings"], updated),
  });

  const refreshUsdRateMutation = useMutation({
    mutationFn: () => refreshUsdRate(),
    onSuccess: (updated) => queryClient.setQueryData(["admin", "settings"], updated),
  });

  const saveTelegramChannelUrlMutation = useMutation({
    mutationFn: () => setTelegramChannelUrl(telegramChannelUrl.trim() || null),
    onSuccess: (updated) => queryClient.setQueryData(["admin", "settings"], updated),
  });

  const saveSupportUrlMutation = useMutation({
    mutationFn: () => setSupportUrl(supportUrl.trim() || null),
    onSuccess: (updated) => queryClient.setQueryData(["admin", "settings"], updated),
  });

  const saveAnthropicApiKeyMutation = useMutation({
    mutationFn: () => setAnthropicApiKey(anthropicApiKey.trim()),
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin", "settings"], updated);
      setAnthropicApiKeyValue("");
    },
  });

  if (isLoading) return <Spinner label={t("loading")} />;

  return (
    <div className="flex flex-col gap-3">
      <div className="card flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Send className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-ink">{t("admin.channelTitle")}</span>
        </div>
        <p className="text-xs text-hint">{t("admin.channelHint")}</p>
        <input
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          placeholder={t("admin.channelPlaceholder")}
          className="input"
        />
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="btn-primary disabled:opacity-50"
        >
          {saveMutation.isPending ? t("saving") : t("save")}
        </button>
        {saveMutation.isSuccess && <span className="text-xs text-success">{t("admin.channelSaved")}</span>}
        {saveMutation.isError && <span className="text-xs text-destructive">{saveMutation.error.message}</span>}
      </div>

      <div className="card flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-promo/10 text-promo-dark">
            <Star className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-ink">{t("admin.starsRateTitle")}</span>
        </div>
        <p className="text-xs text-hint">{t("admin.starsRateHint")}</p>
        <input
          type="number"
          min={1}
          value={starsRate}
          onChange={(e) => setStarsRateValue(e.target.value)}
          className="input"
        />
        <button
          onClick={() => saveStarsRateMutation.mutate()}
          disabled={saveStarsRateMutation.isPending}
          className="btn-primary disabled:opacity-50"
        >
          {saveStarsRateMutation.isPending ? t("saving") : t("save")}
        </button>
        {saveStarsRateMutation.isSuccess && (
          <span className="text-xs text-success">{t("admin.channelSaved")}</span>
        )}
      </div>

      <div className="card flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-success-dark">
            <DollarSign className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-ink">{t("admin.usdRateTitle")}</span>
        </div>
        <p className="text-xs text-hint">{t("admin.usdRateAutoHint")}</p>
        <div className="flex items-center justify-between rounded-xl bg-surface-secondary px-3.5 py-2.5">
          <span className="text-xs text-hint">1 $</span>
          <span className="text-base font-bold text-ink">
            {(settings?.usdRate ?? 0).toLocaleString("uz-UZ")} {t("som")}
          </span>
        </div>
        <button
          onClick={() => refreshUsdRateMutation.mutate()}
          disabled={refreshUsdRateMutation.isPending}
          className="btn-secondary disabled:opacity-50"
        >
          {refreshUsdRateMutation.isPending ? t("saving") : t("admin.usdRateRefreshNow")}
        </button>
        {refreshUsdRateMutation.isSuccess && (
          <span className="text-xs text-success">{t("admin.channelSaved")}</span>
        )}
      </div>

      <div className="card flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Link2 className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-ink">{t("admin.telegramChannelUrlTitle")}</span>
        </div>
        <p className="text-xs text-hint">{t("admin.telegramChannelUrlHint")}</p>
        <input
          value={telegramChannelUrl}
          onChange={(e) => setTelegramChannelUrlValue(e.target.value)}
          placeholder="https://t.me/mening_kanalim"
          className="input"
        />
        <button
          onClick={() => saveTelegramChannelUrlMutation.mutate()}
          disabled={saveTelegramChannelUrlMutation.isPending}
          className="btn-primary disabled:opacity-50"
        >
          {saveTelegramChannelUrlMutation.isPending ? t("saving") : t("save")}
        </button>
        {saveTelegramChannelUrlMutation.isSuccess && (
          <span className="text-xs text-success">{t("admin.channelSaved")}</span>
        )}
      </div>

      <div className="card flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <HeadphonesIcon className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-ink">{t("admin.supportUrlTitle")}</span>
        </div>
        <p className="text-xs text-hint">{t("admin.supportUrlHint")}</p>
        <input
          value={supportUrl}
          onChange={(e) => setSupportUrlValue(e.target.value)}
          placeholder="https://t.me/mening_yordamchim"
          className="input"
        />
        <button
          onClick={() => saveSupportUrlMutation.mutate()}
          disabled={saveSupportUrlMutation.isPending}
          className="btn-primary disabled:opacity-50"
        >
          {saveSupportUrlMutation.isPending ? t("saving") : t("save")}
        </button>
        {saveSupportUrlMutation.isSuccess && (
          <span className="text-xs text-success">{t("admin.channelSaved")}</span>
        )}
      </div>

      <div className="card flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <KeyRound className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-ink">{t("admin.anthropicApiKeyTitle")}</span>
          {settings?.anthropicApiKeySet && (
            <span className="ml-auto rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success-dark">
              {t("admin.anthropicApiKeySet")}
            </span>
          )}
        </div>
        <p className="text-xs text-hint">{t("admin.anthropicApiKeyHint")}</p>
        <input
          type="password"
          value={anthropicApiKey}
          onChange={(e) => setAnthropicApiKeyValue(e.target.value)}
          placeholder="sk-ant-api03-..."
          className="input"
          autoComplete="off"
        />
        <button
          onClick={() => saveAnthropicApiKeyMutation.mutate()}
          disabled={saveAnthropicApiKeyMutation.isPending || anthropicApiKey.trim().length < 20}
          className="btn-primary disabled:opacity-50"
        >
          {saveAnthropicApiKeyMutation.isPending ? t("saving") : t("save")}
        </button>
        {saveAnthropicApiKeyMutation.isSuccess && (
          <span className="text-xs text-success">{t("admin.channelSaved")}</span>
        )}
        {saveAnthropicApiKeyMutation.isError && (
          <span className="text-xs text-destructive">{saveAnthropicApiKeyMutation.error.message}</span>
        )}
      </div>
    </div>
  );
}

export function Admin() {
  useBackButton("/profile");
  const { t } = useTranslation();
  const [tab, setTab] = useState<
    | "moderation"
    | "reports"
    | "banners"
    | "categories"
    | "stats"
    | "admins"
    | "users"
    | "pricing"
    | "requests"
    | "broadcast"
    | "settings"
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
          <button
            onClick={() => setTab("requests")}
            className={`flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition ${tab === "requests" ? "bg-brand text-brand-contrast" : "text-hint"}`}
          >
            <MessageSquareText className="h-4 w-4" />
            {t("admin.requests")}
          </button>
          <button
            onClick={() => setTab("broadcast")}
            className={`flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition ${tab === "broadcast" ? "bg-brand text-brand-contrast" : "text-hint"}`}
          >
            <Megaphone className="h-4 w-4" />
            {t("admin.broadcast")}
          </button>
          <button
            onClick={() => setTab("settings")}
            className={`flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition ${tab === "settings" ? "bg-brand text-brand-contrast" : "text-hint"}`}
          >
            <Settings className="h-4 w-4" />
            {t("admin.settings")}
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
      {tab === "requests" && <AdminRequestsTab />}
      {tab === "broadcast" && <BroadcastTab />}
      {tab === "settings" && <SettingsTab />}
    </div>
  );
}
