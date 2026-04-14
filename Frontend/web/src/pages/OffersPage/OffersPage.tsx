import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./offerspage.css";
import { Button } from "../../components/ui/Button/Button";
import { FiPlus, FiChevronRight } from "react-icons/fi";
import { PencilIcon, ArchiveIcon, ArchiveRestoreIcon, TrashIcon, CopyIcon } from "../../components/ui/Icons/Icons";
import { InputField } from "../../components/ui/InputField/InputField";
import { CustomSelect } from "../../components/ui/CustomSelectMenu/CustomSelect";
import {
  fetchOffersAdmin,
  archiveOffer,
  restoreOffer,
  deleteOffer,
  fetchOfferById,
  createOffer,
  type OfferTableData,
} from "../../../../shared/api/offers/offers";
import { BrandCategory } from "../../types/brandCategories";
import { OfferTarget } from "../../types/offerTarget";
import { OfferLanguage } from "../../types/offerLanguage";
import { ConfirmModal } from "../../components/ui/ConfirmModal/ConfirmModal";
import { useToast } from "../../context/useToast";

interface OffersPageProps {
  brandId?: string;
}

export const OffersPage: React.FC<OffersPageProps> = ({ brandId }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<OfferTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isArchivedView, setIsArchivedView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [filterTarget, setFilterTarget] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [archiveModal, setArchiveModal] = useState<{
    isOpen: boolean;
    offerId: string;
    offerName: string;
  }>({ isOpen: false, offerId: "", offerName: "" });
  const [restoreModal, setRestoreModal] = useState<{
    isOpen: boolean;
    offerId: string;
    offerName: string;
  }>({ isOpen: false, offerId: "", offerName: "" });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    offerId: string;
    offerName: string;
  }>({ isOpen: false, offerId: "", offerName: "" });

  const loadData = useCallback(async (archived: boolean) => {
    setLoading(true);
    try {
      const data = await fetchOffersAdmin(archived);
      setOffers(data);
    } catch (error) {
      console.error("Error loading offers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(isArchivedView);
  }, [loadData, isArchivedView]);

  const categoryOptions = useMemo(
    () => [
      { value: "", label: t("offersPage.allCategories") },
      ...Object.values(BrandCategory).map((c) => ({
        value: c,
        label: t(`categories.${c}`, { defaultValue: c }),
      })),
    ],
    [t],
  );

  const languageOptions = useMemo(
    () => [
      { value: "", label: t("offersPage.allLanguages") },
      ...Object.values(OfferLanguage).map((l) => ({
        value: l,
        label: t(`languages.${l}`, { defaultValue: l.toUpperCase() }),
      })),
    ],
    [t],
  );

  const targetOptions = useMemo(
    () => [
      { value: "", label: t("offersPage.allTargets") },
      ...Object.values(OfferTarget).map((tgt) => ({
        value: tgt,
        label: t(`targets.${tgt}`, { defaultValue: tgt }),
      })),
    ],
    [t],
  );

  const statusOptions = useMemo(
    () => [
      { value: "", label: t("offersPage.allStatuses") },
      { value: "active", label: t("offersPage.statusActive") },
      { value: "prepared", label: t("offersPage.statusPrepared") },
      { value: "concept", label: t("offersPage.statusConcept") },
      { value: "ended", label: t("offersPage.statusEnded") },
    ],
    [t],
  );

  const filteredOffers = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return offers.filter((o) => {
      if (brandId && o.brandId !== brandId) return false;
      if (filterCategory && !o.categories.includes(filterCategory))
        return false;
      if (filterLanguage && !o.languages.includes(filterLanguage)) return false;
      if (filterTarget && !o.targets.includes(filterTarget)) return false;
      if (filterStatus && o.status !== filterStatus) return false;
      if (search && !o.name.toLowerCase().includes(search)) return false;
      return true;
    });
  }, [
    offers,
    searchTerm,
    brandId,
    filterCategory,
    filterLanguage,
    filterTarget,
    filterStatus,
  ]);

  const totalPages = Math.ceil(filteredOffers.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentOffers = filteredOffers.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleArchiveConfirm = async () => {
    const ok = await archiveOffer(archiveModal.offerId);
    if (ok) {
      loadData(false);
      showToast(t("toasts.offerArchived"), "success");
    }
    setArchiveModal({ isOpen: false, offerId: "", offerName: "" });
  };

  const handleRestoreConfirm = async () => {
    const ok = await restoreOffer(restoreModal.offerId);
    if (ok) {
      loadData(true);
      showToast(t("toasts.offerRestored"), "success");
    }
    setRestoreModal({ isOpen: false, offerId: "", offerName: "" });
  };

  const handleDeleteConfirm = async () => {
    const ok = await deleteOffer(deleteModal.offerId);
    if (ok) {
      loadData(isArchivedView);
      showToast(t("toasts.offerDeleted"), "success");
    }
    setDeleteModal({ isOpen: false, offerId: "", offerName: "" });
  };

  const handleDuplicate = async (offerId: string) => {
    try {
      const offer = await fetchOfferById(offerId);
      if (!offer) return;

      const fd = new FormData();
      fd.append("name", `Copy_${offer.name}`);
      fd.append("brand", typeof offer.brand === "string" ? offer.brand : (offer.brand as any)._id);
      fd.append("paidCooperation", String(offer.paidCooperation));
      fd.append("status", "concept");
      fd.append("description", offer.description || "");
      fd.append("contact", offer.contact || "");
      fd.append("website", offer.website || "");
      fd.append("facebook", offer.facebook || "");
      fd.append("instagram", offer.instagram || "");
      fd.append("tiktok", offer.tiktok || "");
      fd.append("pinterest", offer.pinterest || "");
      offer.categories?.forEach((c) => fd.append("categories", c));
      offer.languages?.forEach((l) => fd.append("languages", l));
      offer.targets?.forEach((t) => fd.append("targets", t));

      // Skopírovať obrázok ponuky
      if (offer.image) {
        const imgResponse = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}${offer.image}`);
        const blob = await imgResponse.blob();
        const ext = offer.image.split(".").pop() || "jpg";
        fd.append("image", blob, `copy.${ext}`);
      }

      await createOffer(fd);
      loadData(false);
      showToast(t("toasts.offerDuplicated"), "success");
    } catch (err) {
      showToast(t("errors.somethingWentWrong"), "error");
    }
  };

  return (
    <div className="users-page">
      <ConfirmModal
        isOpen={archiveModal.isOpen}
        title={t("modals.archiveOffer.message")}
        confirmLabel={t("modals.archiveOffer.confirmBtn")}
        cancelLabel={t("modals.archiveOffer.cancelBtn")}
        onConfirm={handleArchiveConfirm}
        onCancel={() =>
          setArchiveModal({ isOpen: false, offerId: "", offerName: "" })
        }
      />
      <ConfirmModal
        isOpen={restoreModal.isOpen}
        title={t("modals.restoreOffer.message")}
        confirmLabel={t("modals.restoreOffer.confirmBtn")}
        cancelLabel={t("modals.restoreOffer.cancelBtn")}
        onConfirm={handleRestoreConfirm}
        onCancel={() =>
          setRestoreModal({ isOpen: false, offerId: "", offerName: "" })
        }
      />
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title={t("modals.deleteOffer.message")}
        confirmLabel={t("modals.deleteOffer.confirmBtn")}
        cancelLabel={t("modals.deleteOffer.cancelBtn")}
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setDeleteModal({ isOpen: false, offerId: "", offerName: "" })
        }
      />

      <div className="header">
        <div className="header-left-group">
          <h1>
            {isArchivedView
              ? t("offersPage.archiveTitle")
              : t("offersPage.title")}
          </h1>
          {isArchivedView ? (
            <Button
              variant="outlined"
              className="archive-btn"
              onClick={() => {
                setIsArchivedView(false);
                setCurrentPage(1);
              }}
            >
              {t("offersPage.activeOffersBtn")}
            </Button>
          ) : (
            <Button
              variant="outlined"
              className="archive-btn"
              onClick={() => {
                setIsArchivedView(true);
                setCurrentPage(1);
              }}
            >
              {t("offersPage.archiveBtn")}
            </Button>
          )}
        </div>
      </div>

      <div className="toolbar">
        <div
          className="filters"
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            width: "auto",
          }}
        >
          <div className="filter-item">
            <CustomSelect
              options={categoryOptions}
              value={categoryOptions.find((o) => o.value === filterCategory)}
              onChange={(val) => {
                setFilterCategory(val?.value ?? "");
                setCurrentPage(1);
              }}
              placeholder={t("offersPage.allCategories")}
            />
          </div>
          <div className="filter-item">
            <CustomSelect
              options={languageOptions}
              value={languageOptions.find((o) => o.value === filterLanguage)}
              onChange={(val) => {
                setFilterLanguage(val?.value ?? "");
                setCurrentPage(1);
              }}
              placeholder={t("offersPage.allLanguages")}
            />
          </div>
          <div className="filter-item">
            <CustomSelect
              options={targetOptions}
              value={targetOptions.find((o) => o.value === filterTarget)}
              onChange={(val) => {
                setFilterTarget(val?.value ?? "");
                setCurrentPage(1);
              }}
              placeholder={t("offersPage.allTargets")}
            />
          </div>
          <div className="filter-item">
            <CustomSelect
              options={statusOptions}
              value={statusOptions.find((o) => o.value === filterStatus)}
              onChange={(val) => {
                setFilterStatus(val?.value ?? "");
                setCurrentPage(1);
              }}
              placeholder={t("offersPage.allStatuses")}
            />
          </div>
        </div>

        <div className="right-tools">
          <InputField
            className="search-field"
            placeholder={t("offersPage.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {!isArchivedView && (
            <Button
              className="btn-create"
              onClick={() => navigate("/offers/new")}
            >
              <FiPlus className="icon" />
              {t("offersPage.createBtn")}
            </Button>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">{t("offersPage.loading")}</div>
        ) : (
          <table className="offers-table">
            <thead>
              <tr>
                <th>{t("offersPage.table.name")}</th>
                <th>{t("offersPage.table.brand")}</th>
                <th>{t("offersPage.table.targets")}</th>
                <th>{t("offersPage.table.country")}</th>
                <th>{t("offersPage.table.status")}</th>
                <th>{t("offersPage.table.activeFrom")}</th>
                <th>{t("offersPage.table.activeTo")}</th>
                <th className="text-right"></th>
              </tr>
            </thead>
            <tbody>
              {currentOffers.length > 0 ? (
                currentOffers.map((offer) => (
                  <tr key={offer.id}>
                    <td
                      className="link"
                      onClick={() => navigate(`/offers/${offer.id}`)}
                    >
                      {offer.name}
                    </td>
                    <td>{offer.brandName}</td>
                    <td>
                      {offer.targets
                        .map((tgt) =>
                          t(`targets.${tgt}`, { defaultValue: tgt }),
                        )
                        .join(", ")}
                    </td>
                    <td>
                      {offer.brandCountry}
                    </td>
                    <td>
                      <span className={`status-badge ${offer.status}`}>
                        {offer.status === "active"
                          ? t("offersPage.statusActive")
                          : offer.status === "prepared"
                            ? t("offersPage.statusPrepared")
                            : offer.status === "ended"
                              ? t("offersPage.statusEnded")
                              : t("offersPage.statusConcept")}
                      </span>
                    </td>
                    <td>{offer.activeFrom}</td>
                    <td>{offer.activeTo}</td>
                    <td className="actions">
                      {isArchivedView ? (
                        <ArchiveRestoreIcon
                          className="action-icon edit"
                          onClick={() =>
                            setRestoreModal({
                              isOpen: true,
                              offerId: offer.id,
                              offerName: offer.name,
                            })
                          }
                        />
                      ) : (
                        <>
                          <PencilIcon
                            className="action-icon edit"
                            onClick={() => navigate(`/offers/${offer.id}/edit`)}
                          />
                          <CopyIcon
                            className="action-icon edit"
                            onClick={() => handleDuplicate(offer.id)}
                          />
                          {offer.status === "concept" ? (
                            <TrashIcon
                              className="action-icon delete"
                              onClick={() =>
                                setDeleteModal({
                                  isOpen: true,
                                  offerId: offer.id,
                                  offerName: offer.name,
                                })
                              }
                            />
                          ) : (
                            <ArchiveIcon
                              className="action-icon delete"
                              onClick={() =>
                                setArchiveModal({
                                  isOpen: true,
                                  offerId: offer.id,
                                  offerName: offer.name,
                                })
                              }
                            />
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="no-data-text">
                    {t("offersPage.noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="pagination-footer">
        <div className="rows-selection">
          <span className="rows-text">
            {t("usersPage.pagination.rowsPerPage")}
          </span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rows-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div className="pagination-nav">
          <button
            className={`nav-btn ${currentPage === 1 ? "disabled" : ""}`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            {t("usersPage.pagination.prev")}
          </button>
          <div className="page-numbers">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            className={`nav-btn-next ${currentPage === totalPages || totalPages === 0 ? "disabled" : ""}`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            {t("usersPage.pagination.next")} <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};
