import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./UsersPage.css";
import { Button } from "../../components/ui/Button/Button";
import {
  FiPlus,
  FiEdit3,
  FiChevronRight,
  FiArchive,
  FiUpload,
} from "react-icons/fi";
import { InputField } from "../../components/ui/InputField/InputField";
import { CustomSelect } from "../../components/ui/CustomSelectMenu/CustomSelect";
import {
  fetchUsers,
  archiveUser,
  restoreUser,
  type UserTableData,
  createUser,
  fetchPackages,
  fetchBrands,
  updateUser,
} from "../../../../shared/api/users/admin/users";
import { Countries } from "../../types/countryEnum";
import { UserRole } from "../../types/userRoles";
import { ConfirmModal } from "../../components/ui/ConfirmModal/ConfirmModal";
import {
  CreateUserModal,
  type FormState,
} from "../../components/ui/CreateUserModal/CreateUserModal";
import { createUserSchema } from "./schemas/createUserSchema";
import { UpdateUserModal } from "../../components/ui/CreateUserModal/UpdateUserModal";

export const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserTableData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedAccess, setSelectedAccess] = useState("");
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<
    (FormState & { id: string }) | null
  >(null);
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    type: "archive" | "restore";
  }>({ isOpen: false, userId: "", userName: "", type: "archive" });

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

  const roleOptions = useMemo(
    () => [
      { value: "", label: t("usersPage.selectAccess") },
      ...Object.values(UserRole).map((role) => ({
        value: role,
        label:
          t(`roles.${role.toLowerCase()}`).charAt(0).toUpperCase() +
          t(`roles.${role.toLowerCase()}`).slice(1).toLowerCase(),
      })),
    ],
    [t],
  );

  const filteredUsers = useMemo(() => {
    const searchStr = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchStr) ||
        user.email.toLowerCase().includes(searchStr),
    );
  }, [users, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers(
        selectedCountry,
        selectedAccess,
        showArchived,
      );
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleEditClick = (user: UserTableData) => {
    const nameParts = user.name.split(" ");
    const name = nameParts[0] || "";
    const surName = nameParts.slice(1).join(" ") || "";

    setUserToUpdate({
      id: user.id,
      name,
      surName,
      email: user.email,
      password: "",
      role: user.role.toLowerCase() as UserRole,

      countries: user.countryCodes || [],

      brands: user.brandIds || [],

      package: user.packageId || "",

      ico: "",
    });

    setIsUpdateModalOpen(true);
  };

  const handleCreateSubmit = useCallback(
    async (formData: FormState) => {
      try {
        await createUser(formData);
        setIsCreateModalOpen(false);
        loadData();
      } catch (error: any) {
        console.error("Chyba pri vytváraní:", error);
        throw error;
      }
    },
    [loadData],
  );

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [selectedCountry, selectedAccess, showArchived]);

  const openConfirm = (user: UserTableData, type: "archive" | "restore") => {
    setModalData({
      isOpen: true,
      userId: user.id,
      userName: user.name,
      type,
    });
  };

  const closeConfirm = () => {
    setModalData((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmAction = async () => {
    const { userId, type } = modalData;
    closeConfirm();

    const success =
      type === "archive"
        ? await archiveUser(userId)
        : await restoreUser(userId);

    if (success) {
      loadData();
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  return (
    <div className="users-page">
      {isCreateModalOpen && (
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {isUpdateModalOpen && userToUpdate && (
        <UpdateUserModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onSubmit={async (id, data) => {
            await updateUser(id, data);
            setIsUpdateModalOpen(false);
            loadData();
          }}
          userData={userToUpdate}
        />
      )}

      <ConfirmModal
        isOpen={modalData.isOpen}
        title={t(`modals.${modalData.type}.message`, {
          name: modalData.userName,
        })}
        confirmLabel={t(`modals.${modalData.type}.confirmBtn`)}
        cancelLabel={t(`modals.${modalData.type}.cancelBtn`)}
        variant={"primary"}
        onConfirm={handleConfirmAction}
        onCancel={closeConfirm}
      />

      <div className="header">
        <div className="header-left-group">
          <h1>
            {showArchived ? t("usersPage.archiveTitle") : t("usersPage.title")}
          </h1>
          <Button
            variant="outlined"
            className="archive-btn"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived
              ? t("usersPage.activeUsersBtn")
              : t("usersPage.archiveBtn")}
          </Button>
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
              onChange={(val) => setSelectedCountry(val?.value || "")}
              placeholder={t("usersPage.selectCountry")}
            />
          </div>

          <div className="filter-item">
            <CustomSelect
              options={roleOptions}
              value={roleOptions.find((o) => o.value === selectedAccess)}
              onChange={(val) => setSelectedAccess(val ? val.value : "")}
              placeholder={t("usersPage.selectAccess")}
            />
          </div>
        </div>

        <div className="right-tools">
          <InputField
            className="search-field"
            placeholder={t("usersPage.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {!showArchived && (
            <Button
              className="btn-create"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <FiPlus className="icon" />
              {t("usersPage.createBtn")}
            </Button>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">{t("usersPage.loading")}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t("usersPage.table.name")}</th>
                <th>{t("usersPage.table.email")}</th>
                <th>{t("usersPage.table.access")}</th>
                <th>{t("usersPage.table.brand")}</th>
                <th>{t("usersPage.table.country")}</th>
                <th>{t("usersPage.table.profile")}</th>
                <th>{t("usersPage.table.package")}</th>
                <th>{t("usersPage.table.purchased")}</th>
                <th>{t("usersPage.table.expiration")}</th>
                <th className="text-right"></th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="link">{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {t(`roles.${user.role.toLowerCase()}`, {
                        defaultValue: user.role,
                      })}
                    </td>
                    <td>{user.brand || "-"}</td>
                    <td>{user.country || "-"}</td>
                    <td>
                      {user.profile === "Yes"
                        ? t("usersPage.table.yes")
                        : t("usersPage.table.no")}
                    </td>
                    <td>{user.package || "-"}</td>
                    <td>{user.purchased}</td>
                    <td>{user.expiration}</td>
                    <td className="actions">
                      {showArchived ? (
                        <div
                          className="action-icon edit"
                          onClick={() => openConfirm(user, "restore")}
                          title={t("usersPage.restore")}
                        >
                          <FiUpload />
                        </div>
                      ) : (
                        <>
                          <FiEdit3
                            className="action-icon edit"
                            onClick={() => handleEditClick(user)}
                          />
                          <FiArchive
                            className="action-icon delete"
                            onClick={() => openConfirm(user, "archive")}
                          />
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="no-data-text">
                    {t("usersPage.noData")}
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
