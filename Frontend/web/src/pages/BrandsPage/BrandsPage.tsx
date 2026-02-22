import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./brandspage.css";
import { Button } from "../../components/ui/Button/Button";
import { FiPlus, FiEdit3, FiChevronRight } from "react-icons/fi";
import { InputField } from "../../components/ui/InputField/InputField";
import { CustomSelect } from "../../components/ui/CustomSelectMenu/CustomSelect";
import {
  fetchBrandsAdmin,
  createBrand,
  updateBrand,
  type BrandTableData,
} from "../../../../shared/api/brands/brands";
import { Countries } from "../../types/countryEnum";
import {
  CreateBrandModal,
  type BrandFormState,
} from "../../components/ui/CreateBrandModal/CreateBrandModal";
import { UpdateBrandModal } from "../../components/ui/CreateBrandModal/UpdateBrandModal";

export const BrandsPage: React.FC = () => {
  const { t } = useTranslation();
  const [brands, setBrands] = useState<BrandTableData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [brandToUpdate, setBrandToUpdate] = useState<
    (BrandFormState & { id: string }) | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const countryOptions = useMemo(
    () => [
      { value: "", label: t("usersPage.selectCountry") },
      ...Object.values(Countries).map((code) => ({
        value: code,
        label: t(`countries.${code}`),
      })),
    ],
    [t],
  );

  const filteredBrands = useMemo(() => {
    const searchStr = searchTerm.toLowerCase();
    return brands.filter(
      (brand) =>
        (!selectedCountry || brand.country === selectedCountry) &&
        brand.name.toLowerCase().includes(searchStr),
    );
  }, [brands, searchTerm, selectedCountry]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBrandsAdmin();
      setBrands(data);
    } catch (error) {
      console.error("Error loading brands:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [loadData]);

  const handleEditClick = (brand: BrandTableData) => {
    setBrandToUpdate({
      id: brand.id,
      name: brand.name,
      ico: brand.ico === "-" ? "" : brand.ico,
      address: brand.address,
      city: brand.city,
      zip: brand.zip,
      country: brand.country as (typeof Countries)[keyof typeof Countries],
      categories: brand.categories as any,
      package: brand.packageId,
      mainContact: brand.contactId,
    });
    setIsUpdateModalOpen(true);
  };

  const handleCreateSubmit = useCallback(
    async (formData: BrandFormState) => {
      try {
        await createBrand(formData);
        setIsCreateModalOpen(false);
        loadData();
      } catch (error: any) {
        console.error("Error creating brand:", error);
        throw error;
      }
    },
    [loadData],
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentBrands = filteredBrands.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBrands.length / rowsPerPage);

  return (
    <div className="users-page">
      {isCreateModalOpen && (
        <CreateBrandModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {isUpdateModalOpen && brandToUpdate && (
        <UpdateBrandModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onSubmit={async (id, data) => {
            await updateBrand(id, data);
            setIsUpdateModalOpen(false);
            loadData();
          }}
          brandData={brandToUpdate}
        />
      )}

      <div className="header">
        <div className="header-left-group">
          <h1>{t("brandsPage.title")}</h1>
        </div>
      </div>

      <div className="toolbar">
        <div
          className="filters"
          style={{ display: "flex", gap: "12px", alignItems: "center" }}
        >
          <div className="filter-item">
            <CustomSelect
              options={countryOptions}
              value={countryOptions.find((o) => o.value === selectedCountry)}
              onChange={(val) => {
                setSelectedCountry(val?.value || "");
                setCurrentPage(1);
              }}
              placeholder={t("usersPage.selectCountry")}
            />
          </div>
        </div>

        <div className="right-tools">
          <InputField
            className="search-field"
            placeholder={t("brandsPage.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            className="btn-create"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FiPlus className="icon" />
            {t("brandsPage.createBtn")}
          </Button>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">{t("brandsPage.loading")}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t("brandsPage.table.name")}</th>
                <th>{t("brandsPage.table.activeOffers")}</th>
                <th>{t("brandsPage.table.totalOffers")}</th>
                <th>{t("brandsPage.table.contact")}</th>
                <th>{t("brandsPage.table.country")}</th>
                <th>{t("brandsPage.table.package")}</th>
                <th>{t("brandsPage.table.purchased")}</th>
                <th>{t("brandsPage.table.expiration")}</th>
                <th className="text-right"></th>
              </tr>
            </thead>
            <tbody>
              {currentBrands.length > 0 ? (
                currentBrands.map((brand) => (
                  <tr key={brand.id}>
                    <td className="link">{brand.name}</td>
                    <td>{brand.activeOffers}</td>
                    <td>{brand.totalOffers}</td>
                    <td>{brand.contact}</td>
                    <td>
                      {t(`countries.${brand.country}`, {
                        defaultValue: brand.country,
                      })}
                    </td>
                    <td>{brand.package}</td>
                    <td>{brand.purchased}</td>
                    <td>{brand.expiration}</td>
                    <td className="actions">
                      <FiEdit3
                        className="action-icon edit"
                        onClick={() => handleEditClick(brand)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="no-data-text">
                    {t("brandsPage.noData")}
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
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
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
