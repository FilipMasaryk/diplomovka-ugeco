import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "../UsersPage/UsersPage.css";
import { Button } from "../../components/ui/Button/Button";
import {
  FiPlus,
  FiEdit3,
  FiUserMinus,
  FiChevronRight,
} from "react-icons/fi";
import { InputField } from "../../components/ui/InputField/InputField";
import {
  fetchManagersByBrand,
  createManager,
  updateManager,
  removeManagerAccess,
  type ManagerTableData,
} from "../../../../shared/api/managers/managers";
import { ConfirmModal } from "../../components/ui/ConfirmModal/ConfirmModal";
import {
  CreateManagerModal,
  type ManagerFormState,
} from "../../components/ui/CreateManagerModal/CreateManagerModal";
import { UpdateManagerModal } from "../../components/ui/CreateManagerModal/UpdateManagerModal";
import { useBrand } from "../../context/useBrand";
import { useToast } from "../../context/useToast";
import { useAuth } from "../../context/useAuth";

export const ManagersPage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user: authUser } = useAuth();
  const { selectedBrand } = useBrand();
  const [managers, setManagers] = useState<ManagerTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [managerToUpdate, setManagerToUpdate] = useState<{
    id: string;
    name: string;
    surName: string;
  } | null>(null);
  const [removeModal, setRemoveModal] = useState<{
    isOpen: boolean;
    managerId: string;
    managerName: string;
  }>({ isOpen: false, managerId: "", managerName: "" });

  const loadData = useCallback(async () => {
    if (!selectedBrand) return;
    setLoading(true);
    try {
      const data = await fetchManagersByBrand(selectedBrand._id);
      setManagers(data);
    } catch (error) {
      console.error("Error loading managers:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedBrand]);

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [loadData]);

  const filteredManagers = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return managers.filter(
      (m) =>
        m.name.toLowerCase().includes(search) ||
        m.surName.toLowerCase().includes(search) ||
        m.email.toLowerCase().includes(search),
    );
  }, [managers, searchTerm]);

  const totalPages = Math.ceil(filteredManagers.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentManagers = filteredManagers.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleCreateSubmit = async (formData: ManagerFormState) => {
    if (!selectedBrand) return;
    await createManager(selectedBrand._id, formData);
    setIsCreateModalOpen(false);
    loadData();
    showToast(t("toasts.managerCreated"), "success");
  };

  const handleUpdateSubmit = async (
    id: string,
    data: { name: string; surName: string },
  ) => {
    await updateManager(id, data);
    setIsUpdateModalOpen(false);
    loadData();
    showToast(t("toasts.managerUpdated"), "success");
  };

  const handleRemoveAccess = async () => {
    if (!selectedBrand) return;
    setRemoveModal((prev) => ({ ...prev, isOpen: false }));

    const success = await removeManagerAccess(
      removeModal.managerId,
      selectedBrand._id,
    );
    if (success) {
      loadData();
      showToast(t("toasts.managerAccessRemoved"), "success");
    }
  };

  if (!selectedBrand) {
    return (
      <div className="users-page">
        <div className="no-data-text" style={{ padding: "2rem", textAlign: "center" }}>
          {t("noBrandSelected")}
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      {isCreateModalOpen && (
        <CreateManagerModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {isUpdateModalOpen && managerToUpdate && (
        <UpdateManagerModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onSubmit={handleUpdateSubmit}
          managerData={managerToUpdate}
        />
      )}

      <ConfirmModal
        isOpen={removeModal.isOpen}
        title={t("managersPage.removeConfirm", {
          name: removeModal.managerName,
        })}
        confirmLabel={t("managersPage.removeConfirmBtn")}
        cancelLabel={t("modals.archive.cancelBtn")}
        variant="primary"
        onConfirm={handleRemoveAccess}
        onCancel={() => setRemoveModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <div className="header">
        <div className="header-left-group">
          <h1>{t("managersPage.title")}</h1>
        </div>
      </div>

      <div className="toolbar">
        <div className="filters" />
        <div className="right-tools">
          <InputField
            className="search-field"
            placeholder={t("usersPage.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            className="btn-create"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FiPlus className="icon" />
            {t("managersPage.createBtn")}
          </Button>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">{t("managersPage.loading")}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>{t("usersPage.table.name")}</th>
                <th>{t("usersPage.table.email")}</th>
                <th>{t("usersPage.table.brand")}</th>
                <th className="text-right"></th>
              </tr>
            </thead>
            <tbody>
              {currentManagers.length > 0 ? (
                currentManagers.map((manager, index) => (
                  <tr key={manager.id}>
                    <td>{indexOfFirst + index + 1}</td>
                    <td className="link">
                      {manager.name} {manager.surName}
                    </td>
                    <td>{manager.email}</td>
                    <td>{manager.brand}</td>
                    <td className="actions">
                      <FiEdit3
                        className="action-icon edit"
                        onClick={() => {
                          setManagerToUpdate({
                            id: manager.id,
                            name: manager.name,
                            surName: manager.surName,
                          });
                          setIsUpdateModalOpen(true);
                        }}
                      />
                      <FiUserMinus
                        className="action-icon delete"
                        title={t("managersPage.removeAccess")}
                        onClick={() =>
                          setRemoveModal({
                            isOpen: true,
                            managerId: manager.id,
                            managerName: `${manager.name} ${manager.surName}`,
                          })
                        }
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="no-data-text">
                    {t("managersPage.noData")}
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
