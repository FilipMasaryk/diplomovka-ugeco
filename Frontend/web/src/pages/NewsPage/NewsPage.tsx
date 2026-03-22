import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiCheckCircle,
  FiBell,
  FiAlertTriangle,
} from "react-icons/fi";
import { Button } from "../../components/ui/Button/Button";
import {
  CreateNewsModal,
} from "../../components/ui/CreateNewsModal/CreateNewsModal";
import { ConfirmModal } from "../../components/ui/ConfirmModal/ConfirmModal";
import {
  fetchNews,
  fetchPublishedNews,
  createNews,
  updateNews,
  deleteNews,
  type NewsItem,
} from "../../../../shared/api/news/news";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { API_URL } from "../../../../shared/config";
import "./newspage.css";

const targetMap: Record<string, string> = {
  admin: "all",
  creator: "creator",
  brand: "brand_manager",
};

const categoryIcon = (category: string) => {
  switch (category) {
    case "fix":
      return <FiCheckCircle className="news-category-icon fix" />;
    case "feature":
      return <FiBell className="news-category-icon feature" />;
    case "bug":
      return <FiAlertTriangle className="news-category-icon bug" />;
    default:
      return null;
  }
};

export const NewsPage: React.FC = () => {
  const { t } = useTranslation();
  const { target } = useParams<{ target?: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isAdmin = user?.role === "admin" || user?.role === "subadmin";

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin && target) {
        const apiTarget = targetMap[target] || target;
        const data = await fetchNews(apiTarget);
        setNews(data);
      } else if (isAdmin) {
        const data = await fetchNews();
        setNews(data);
      } else {
        const data = await fetchPublishedNews();
        setNews(data);
      }
    } catch (err) {
      console.error("Failed to load news:", err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, target]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateSubmit = useCallback(
    async (formData: FormData) => {
      await createNews(formData);
      showToast(t("toasts.newsCreated"), "success");
      loadData();
    },
    [loadData, showToast, t],
  );

  const handleEditSubmit = useCallback(
    async (formData: FormData) => {
      if (!editItem) return;
      await updateNews(editItem._id, formData);
      showToast(t("toasts.newsUpdated"), "success");
      setEditItem(null);
      loadData();
    },
    [editItem, loadData, showToast, t],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId) return;
    const ok = await deleteNews(deleteId);
    if (ok) {
      showToast(t("toasts.newsDeleted"), "success");
      loadData();
    }
    setDeleteId(null);
  }, [deleteId, loadData, showToast, t]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("sk-SK");
  };

  const getPageTitle = () => {
    if (!target) return t("newsPage.title");
    const labels: Record<string, string> = {
      admin: t("newsPage.titleAdmin"),
      creator: t("newsPage.titleCreator"),
      brand: t("newsPage.titleBrand"),
    };
    return labels[target] || t("newsPage.title");
  };

  const drafts = news.filter((item) => item.status === "draft");
  const published = news.filter((item) => item.status === "published");

  const renderCard = (item: NewsItem) => (
    <div key={item._id} className="news-card">
      <div className="news-card-header">
        <h3 className="news-card-title">{item.title || t("newsPage.noTitle")}</h3>
        <div className="news-card-actions">
          {isAdmin && (
            <FiEdit3
              className="action-icon edit"
              onClick={() => setEditItem(item)}
            />
          )}
          {categoryIcon(item.category)}
          {isAdmin && (
            <FiTrash2
              className="action-icon delete"
              onClick={() => setDeleteId(item._id)}
            />
          )}
        </div>
      </div>
      {item.description && (
        <p className="news-card-description">{item.description}</p>
      )}
      {item.image && (
        <img
          src={`${API_URL}${item.image}`}
          alt={item.title}
          className="news-card-image"
        />
      )}
      <div className="news-card-footer">
        <span className={`news-card-date ${item.status === "draft" ? "draft-label" : ""}`}>
          {item.status === "draft"
            ? t("newsPage.statusDraft")
            : formatDate(item.publishedAt || item.createdAt)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="users-page">
      <div className="header">
        <h1>{getPageTitle()}</h1>
        {isAdmin && (
          <div className="header-actions">
            <Button
              className="btn-create"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <FiPlus /> {t("newsPage.createBtn")}
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-state">{t("newsPage.loading")}</div>
      ) : news.length === 0 ? (
        <div className="no-data-text">{t("newsPage.noData")}</div>
      ) : (
        <>
          {isAdmin && drafts.length > 0 && (
            <div className="news-section">
              <h2 className="news-section-title">
                {t("newsPage.sectionDrafts")}
              </h2>
              <div className="news-cards-grid">
                {drafts.map(renderCard)}
              </div>
            </div>
          )}

          {(isAdmin ? published.length > 0 : true) && (
            <div className="news-section">
              {isAdmin && (
                <h2 className="news-section-title">
                  {t("newsPage.sectionPublished")}
                </h2>
              )}
              <div className="news-cards-grid">
                {(isAdmin ? published : news).map(renderCard)}
              </div>
            </div>
          )}
        </>
      )}

      <CreateNewsModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {editItem && (
        <CreateNewsModal
          isOpen={true}
          onClose={() => setEditItem(null)}
          onSubmit={handleEditSubmit}
          editData={editItem}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title={t("newsPage.deleteConfirm")}
        confirmLabel={t("newsPage.deleteBtn")}
        cancelLabel={t("modals.cancel")}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
