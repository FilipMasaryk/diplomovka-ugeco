import { createContext, useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import {
  fetchBrandsForSelect,
  type BrandSelectOption,
} from "../../../shared/api/brands/brands";

interface BrandContextType {
  brands: BrandSelectOption[];
  selectedBrand: BrandSelectOption | null;
  setSelectedBrand: (brand: BrandSelectOption) => void;
  loading: boolean;
  refreshBrands: () => Promise<void>;
}

export const BrandContext = createContext<BrandContextType | null>(null);

export const BrandProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [brands, setBrands] = useState<BrandSelectOption[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandSelectOption | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const loadBrands = useCallback(async () => {
    if (user?.role !== "brand_manager") {
      setLoading(false);
      return;
    }

    try {
      // Backend GET /brands already returns only the brands this manager has access to
      const freshBrands = await fetchBrandsForSelect();
      setBrands(freshBrands);
      setSelectedBrand((prev) => {
        if (!prev) return freshBrands.length > 0 ? freshBrands[0] : null;
        // Update selected brand with fresh data (e.g. new logo) or reset if removed
        const updated = freshBrands.find((b) => b._id === prev._id);
        return updated ?? (freshBrands.length > 0 ? freshBrands[0] : null);
      });
    } catch (error) {
      console.error("Failed to load brands:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  return (
    <BrandContext.Provider
      value={{ brands, selectedBrand, setSelectedBrand, loading, refreshBrands: loadBrands }}
    >
      {children}
    </BrandContext.Provider>
  );
};
