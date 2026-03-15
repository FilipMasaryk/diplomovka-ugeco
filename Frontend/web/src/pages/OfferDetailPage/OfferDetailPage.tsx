import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import "./offerdetail.css";
import {
  FaGlobe,
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaPinterest,
} from "react-icons/fa6";
import { Button } from "../../components/ui/Button/Button";
import {
  fetchOfferById,
  type ApiOffer,
  type PopulatedBrand,
} from "../../../../shared/api/offers/offers";
import { API_URL } from "../../../../shared/config";

export const OfferDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<ApiOffer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchOfferById(id).then((data) => {
      setOffer(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="offer-detail-page">
        <p className="offer-detail-loading">{t("offerDetailPage.loading")}</p>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="offer-detail-page">
        <p className="offer-detail-loading">{t("offerDetailPage.notFound")}</p>
      </div>
    );
  }

  const brand =
    offer.brand && typeof offer.brand === "object"
      ? (offer.brand as PopulatedBrand)
      : null;

  const imageUrl = offer.image ? `${API_URL}${offer.image}` : null;
  const brandLogoUrl = brand?.logo ? `${API_URL}${brand.logo}` : null;

  const socials = [
    { key: "website", url: offer.website || brand?.website, icon: <FaGlobe color="#4A90D9" /> },
    { key: "instagram", url: offer.instagram || brand?.instagram, icon: <FaInstagram color="#E4405F" /> },
    { key: "facebook", url: offer.facebook || brand?.facebook, icon: <FaFacebook color="#1877F2" /> },
    { key: "tiktok", url: offer.tiktok || brand?.tiktok, icon: <FaTiktok color="#000000" /> },
    { key: "pinterest", url: offer.pinterest || brand?.pinterest, icon: <FaPinterest color="#E60023" /> },
  ].filter((s) => s.url);

  return (
    <div className="offer-detail-page">
      <Button
        variant="outlined"
        className="offer-detail-back-btn"
        onClick={() => navigate(-1)}
      >
        {t("offerDetailPage.backBtn")}
      </Button>

      <h1 className="offer-detail-title">{offer.name}</h1>

      <div className="offer-detail-layout">
        {/* ── LEFT: image + brand + description ── */}
        <div className="offer-detail-main">
          <div className="offer-image-brand-row">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={offer.name}
                className="offer-detail-image"
              />
            )}
            <div className="offer-brand-block">
              {brandLogoUrl ? (
                <img
                  src={brandLogoUrl}
                  alt={brand?.name ?? ""}
                  className="offer-brand-logo"
                />
              ) : (
                <div className="offer-brand-logo-placeholder">
                  {brand?.name?.charAt(0).toUpperCase() ?? "B"}
                </div>
              )}
              <span className="offer-brand-name">{brand?.name ?? "–"}</span>
            </div>
          </div>

          <div className="offer-detail-description">{offer.description}</div>
        </div>

        {/* ── RIGHT: sidebar ── */}
        <div className="offer-detail-sidebar">
          <div className="sidebar-section">
            <span className="sidebar-section-label">
              {t("offerDetailPage.categories")}:
            </span>
            <span className="sidebar-section-value">
              {offer.categories
                .map((c) => t(`categories.${c}`, { defaultValue: c }))
                .join(", ")}
            </span>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-section-label">
              {t("offerDetailPage.languages")}:
            </span>
            <span className="sidebar-section-value">
              {offer.languages
                .map((l) =>
                  t(`languages.${l}`, { defaultValue: l.toUpperCase() }),
                )
                .join(", ")}
            </span>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-section-label">
              {t("offerDetailPage.targets")}:
            </span>
            <span className="sidebar-section-value">
              {offer.targets
                .map((tgt) => t(`targets.${tgt}`, { defaultValue: tgt }))
                .join(", ")}
            </span>
          </div>

          {offer.contact && (
            <div className="offer-contact-card">
              <span className="offer-contact-card-title">
                {t("offerDetailPage.contact")}
              </span>
              <span className="offer-contact-value">{offer.contact}</span>
            </div>
          )}

          <div className="sidebar-section">
            <span className="sidebar-section-label">
              {t("offerDetailPage.cooperationType")}:
            </span>
            <span className="sidebar-section-value">
              {offer.paidCooperation
                ? t("createOfferPage.paidCooperation")
                : t("createOfferPage.barter")}
            </span>
          </div>

          {socials.length > 0 && (
            <div className="offer-social-icons">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="offer-social-icon-link"
                  title={s.key}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
