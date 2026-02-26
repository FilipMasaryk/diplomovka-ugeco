import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./packagespage.css";
import { Button } from "../../components/ui/Button/Button";
import { FiPlus, FiEdit3, FiChevronRight, FiTrash2 } from "react-icons/fi";
import { InputField } from "../../components/ui/InputField/InputField";
import { CustomSelect } from "../../components/ui/CustomSelectMenu/CustomSelect";
import {
  fetchPackages,
  createPackage,
  updatePackage,
  deletePackage,
  type PackageTableData,
} from "../../../../shared/api/packages/packages";
import { ConfirmModal } from "../../components/ui/ConfirmModal/ConfirmModal";
import { CreatePackageModal } from "../../components/ui/CreatePackageModal/CreatePackageModal";
import { UpdatePackageModal } from "../../components/ui/CreatePackageModal/UpdatePackageModal";

export type PackageFormState = {
  name: string;
  validityMonths: number | "";
  offersCount: number | "";
  type: "creator" | "brand" | "";
};

export const PackagesPage: React.FC = () => {
  const { t } = useTranslation();
  const [packages, setPackages] = useState<PackageTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [packageToUpdate, setPackageToUpdate] = useState<
    (PackageFormState & { id: string }) | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    packageId: string;
    packageName: string;
  }>({ isOpen: false, packageId: "", packageName: "" });

  const typeOptions = useMemo(
    () => [
      { value: "", label: t("packagesPage.allTypes") },
      { value: "creator", label: t("packagesPage.typeCreator") },
      { value: "brand", label: t("packagesPage.typeBrand") },
    ],
    [t],
  );

  const filteredPackages = useMemo(() => {
    const searchStr = searchTerm.toLowerCase();
    return packages.filter(
      (pkg) =>
        (!selectedType || pkg.type === selectedType) &&
        pkg.name.toLowerCase().includes(searchStr),
    );
  }, [packages, searchTerm, selectedType]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPackages();
      setPackages(data);
    } catch (error) {
      console.error("Error loading packages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [loadData]);

  const handleEditClick = (pkg: PackageTableData) => {
    setPackageToUpdate({
      id: pkg.id,
      name: pkg.name,
      validityMonths: pkg.validityMonths,
      offersCount: pkg.offersCount,
      type: pkg.type,
    });
    setIsUpdateModalOpen(true);
  };

  const handleCreateSubmit = useCallback(
    async (formData: PackageFormState) => {
      try {
        await createPackage({
          name: formData.name,
          validityMonths: formData.validityMonths as number,
          offersCount:
            formData.type === "brand"
              ? (formData.offersCount as number)
              : undefined,
          type: formData.type as "creator" | "brand",
        });
        setIsCreateModalOpen(false);
        loadData();
      } catch (error: any) {
        console.error("Error creating package:", error);
        throw error;
      }
    },
    [loadData],
  );

  const openDeleteConfirm = (pkg: PackageTableData) => {
    setModalData({
      isOpen: true,
      packageId: pkg.id,
      packageName: pkg.name,
    });
  };

  const closeConfirm = () => {
    setModalData((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDeleteConfirm = async () => {
    const { packageId } = modalData;
    closeConfirm();
    const success = await deletePackage(packageId);
    if (success) {
      loadData();
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentPackages = filteredPackages.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPackages.length / rowsPerPage);

  return (
    <div className="users-page">
      {isCreateModalOpen && (
        <CreatePackageModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {isUpdateModalOpen && packageToUpdate && (
        <UpdatePackageModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onSubmit={async (id, data) => {
            await updatePackage(id, {
              name: data.name,
              validityMonths: data.validityMonths as number,
              offersCount: data.offersCount as number,
            });
            setIsUpdateModalOpen(false);
            loadData();
          }}
          packageData={packageToUpdate}
        />
      )}

      <ConfirmModal
        isOpen={modalData.isOpen}
        title={t("packagesPage.deleteConfirm", {
          name: modalData.packageName,
        })}
        confirmLabel={t("packagesPage.deleteBtn")}
        cancelLabel={t("modals.archiveBrand.cancelBtn")}
        onConfirm={handleDeleteConfirm}
        onCancel={closeConfirm}
      />

      <div className="header">
        <div className="header-left-group">
          <h1>{t("packagesPage.title")}</h1>
        </div>
      </div>

      <div className="toolbar">
        <div
          className="filters"
          style={{ display: "flex", gap: "12px", alignItems: "center" }}
        >
          <div className="filter-item">
            <CustomSelect
              options={typeOptions}
              value={typeOptions.find((o) => o.value === selectedType)}
              onChange={(val) => {
                setSelectedType(val?.value || "");
                setCurrentPage(1);
              }}
              placeholder={t("packagesPage.allTypes")}
            />
          </div>
        </div>

        <div className="right-tools">
          <InputField
            className="search-field"
            placeholder={t("packagesPage.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            className="btn-create"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FiPlus className="icon" />
            {t("packagesPage.createBtn")}
          </Button>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">{t("packagesPage.loading")}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t("packagesPage.table.name")}</th>
                <th>{t("packagesPage.table.type")}</th>
                <th>{t("packagesPage.table.validityMonths")}</th>
                <th>{t("packagesPage.table.offersCount")}</th>
                <th className="text-right"></th>
              </tr>
            </thead>
            <tbody>
              {currentPackages.length > 0 ? (
                currentPackages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td className="link">{pkg.name}</td>
                    <td>
                      {pkg.type === "creator"
                        ? t("packagesPage.typeCreator")
                        : t("packagesPage.typeBrand")}
                    </td>
                    <td>
                      {pkg.validityMonths} {t("packagesPage.table.months")}
                    </td>
                    <td>{pkg.type === "brand" ? pkg.offersCount : "-"}</td>
                    <td className="actions">
                      <FiEdit3
                        className="action-icon edit"
                        onClick={() => handleEditClick(pkg)}
                      />
                      <FiTrash2
                        className="action-icon delete"
                        onClick={() => openDeleteConfirm(pkg)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="no-data-text">
                    {t("packagesPage.noData")}
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
