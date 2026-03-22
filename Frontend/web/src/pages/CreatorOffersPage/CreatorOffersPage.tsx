import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiChevronRight } from "react-icons/fi";
import {
  fetchOffersForCreator,
  fetchLikedOfferIds,
  toggleOfferLike,
  type CreatorOfferCard,
} from "../../../../shared/api/offers/offers";
import { BrandCategory } from "../../types/brandCategories";
import { OfferLanguage } from "../../types/offerLanguage";
import { OfferTarget } from "../../types/offerTarget";
import { API_URL } from "../../../../shared/config";
import "./creatorofferspage.css";

const CATEGORIES = Object.values(BrandCategory);
const LANGUAGES = Object.values(OfferLanguage);
const TARGETS = Object.values(OfferTarget);

export const CreatorOffersPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [offers, setOffers] = useState<CreatorOfferCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [likedFilter, setLikedFilter] = useState("");
  const [cooperationFilter, setCooperationFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Likes (stored in DB)
  const [likedOffers, setLikedOffers] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Track grid columns so "rows" means actual visual rows
  const getColumns = () => {
    const w = window.innerWidth;
    if (w <= 600) return 1;
    if (w <= 1000) return 2;
    if (w <= 1400) return 3;
    return 4;
  };
  const [columns, setColumns] = useState(getColumns);

  useEffect(() => {
    const onResize = () => setColumns(getColumns());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    const data = await fetchOffersForCreator({
      category: categoryFilter || undefined,
      target: targetFilter || undefined,
      paidCooperation: cooperationFilter || undefined,
      language: languageFilter || undefined,
    });
    setOffers(data);
    setCurrentPage(1);
    setLoading(false);
  }, [categoryFilter, targetFilter, cooperationFilter, languageFilter]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  useEffect(() => {
    fetchLikedOfferIds().then((ids) => setLikedOffers(new Set(ids)));
  }, []);

  const toggleLike = async (offerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic update
    setLikedOffers((prev) => {
      const next = new Set(prev);
      if (next.has(offerId)) {
        next.delete(offerId);
      } else {
        next.add(offerId);
      }
      return next;
    });
    const result = await toggleOfferLike(offerId);
    if (!result) {
      // Revert on failure
      setLikedOffers((prev) => {
        const next = new Set(prev);
        if (next.has(offerId)) {
          next.delete(offerId);
        } else {
          next.add(offerId);
        }
        return next;
      });
    }
  };

  const filteredOffers = useMemo(() => {
    let result = offers;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          o.name.toLowerCase().includes(term) ||
          o.brandName.toLowerCase().includes(term),
      );
    }

    if (likedFilter === "liked") {
      result = result.filter((o) => likedOffers.has(o.id));
    } else if (likedFilter === "not_liked") {
      result = result.filter((o) => !likedOffers.has(o.id));
    }

    return result;
  }, [offers, searchTerm, likedFilter, likedOffers]);

  // Pagination calculations — rowsPerPage means visual rows, each row = columns cards
  const itemsPerPage = rowsPerPage * columns;
  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentOffers = filteredOffers.slice(indexOfFirst, indexOfLast);

  const renderPageNumbers = () => {
    const pages: React.ReactNode[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(
          <button
            key={i}
            className={`page-btn ${currentPage === i ? "active" : ""}`}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </button>,
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(
          <span key={`dots-${i}`} className="dots">
            ...
          </span>,
        );
      }
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="creator-offers-page">
        <div className="loading-state">{t("offersPage.loading")}</div>
      </div>
    );
  }

  return (
    <div className="creator-offers-page">
      <h1>{t("creatorOffersPage.title")}</h1>

      <div className="creator-offers-toolbar">
        <div className="creator-offers-filters">
          <select
            className="creator-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">{t("creatorOffersPage.filterCategory")}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`categories.${c}`)}
              </option>
            ))}
          </select>

          <select
            className="creator-filter-select"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
          >
            <option value="">{t("creatorOffersPage.filterLanguage")}</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {t(`languages.${l}`)}
              </option>
            ))}
          </select>

          <select
            className="creator-filter-select"
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
          >
            <option value="">{t("creatorOffersPage.filterTarget")}</option>
            {TARGETS.map((tgt) => (
              <option key={tgt} value={tgt}>
                {t(`targets.${tgt}`)}
              </option>
            ))}
          </select>

          <select
            className="creator-filter-select"
            value={likedFilter}
            onChange={(e) => setLikedFilter(e.target.value)}
          >
            <option value="">{t("creatorOffersPage.filterLike")}</option>
            <option value="liked">{t("creatorOffersPage.liked")}</option>
            <option value="not_liked">{t("creatorOffersPage.notLiked")}</option>
          </select>

          <select
            className="creator-filter-select"
            value={cooperationFilter}
            onChange={(e) => setCooperationFilter(e.target.value)}
          >
            <option value="">{t("creatorOffersPage.filterCooperation")}</option>
            <option value="true">{t("creatorOffersPage.paid")}</option>
            <option value="false">{t("creatorOffersPage.barter")}</option>
          </select>
        </div>

        <input
          type="text"
          className="creator-offers-search"
          placeholder={t("creatorOffersPage.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredOffers.length === 0 ? (
        <div className="creator-offers-no-data">{t("creatorOffersPage.noData")}</div>
      ) : (
        <>
          <div className="creator-offers-grid">
            {currentOffers.map((offer) => (
              <div
                key={offer.id}
                className="creator-offer-card"
                onClick={() => navigate(`/creator-offers/${offer.id}`)}
              >
                <div className="creator-offer-card-image-wrap">
                  {offer.image ? (
                    <img
                      src={`${API_URL}${offer.image}`}
                      alt={offer.name}
                      className="creator-offer-card-image"
                    />
                  ) : (
                    <div className="creator-offer-card-no-image">
                      {t("offerDetailPage.noImage")}
                    </div>
                  )}

                  <div className="creator-offer-top-right">
                    <button
                      className="creator-offer-like-btn"
                      onClick={(e) => toggleLike(offer.id, e)}
                      title={likedOffers.has(offer.id) ? "Unlike" : "Like"}
                    >
                      <FiHeart
                        className={`heart-icon ${likedOffers.has(offer.id) ? "liked" : ""}`}
                      />
                    </button>
                    {!offer.paidCooperation && (
                      <span className="creator-offer-badge barter">Barter</span>
                    )}
                  </div>

                  <div className="creator-offer-card-bottom-bar">
                    <span className="creator-offer-card-name">{offer.name}</span>
                    {offer.brandLogo && (
                      <img
                        src={`${API_URL}${offer.brandLogo}`}
                        alt={offer.brandName}
                        className="creator-offer-brand-logo"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="creator-offers-pagination">
            <div>
              <span className="rows-text">{t("usersPage.pagination.rowsPerPage")}</span>
              <select
                className="rows-select"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[5, 10, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="pagination-nav">
              <button
                className={`nav-btn ${currentPage === 1 ? "disabled" : ""}`}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                {t("usersPage.pagination.prev")}
              </button>
              <div className="page-numbers">{renderPageNumbers()}</div>
              <button
                className={`nav-btn-next ${currentPage === totalPages ? "disabled" : ""}`}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                {t("usersPage.pagination.next")}
                <FiChevronRight />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
