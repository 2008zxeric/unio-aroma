import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { seriesService, countryService, productService, bannerService, siteTextService, recommendService } from './dataService';
import type { Series, Country, Product, Banner } from './database.types';

interface DataType {
  // 数据
  series: Series[];
  countries: Country[];
  products: Product[];
  banners: Record<string, Banner[]>;
  
  // 状态
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // 操作
  refresh: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshCountries: () => Promise<void>;
}

const DataContext = createContext<DataType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [series, setSeries] = useState<Series[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Record<string, Banner[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 并行加载所有数据
      const [seriesData, countriesData, productsData] = await Promise.all([
        seriesService.getAllActive().catch(() => []),
        countryService.getAllActive().catch(() => []),
        productService.getAllActive().catch(() => []),
      ]);

      setSeries(seriesData);
      setCountries(countriesData);
      setProducts(productsData);

      // 加载海报
      const positions = ['home', 'story', 'collections', 'atlas', 'footer'];
      const bannerMap: Record<string, Banner[]> = {};
      for (const pos of positions) {
        try {
          bannerMap[pos] = await bannerService.getByPosition(pos);
        } catch {
          bannerMap[pos] = [];
        }
      }
      setBanners(bannerMap);

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('数据加载失败:', err);
      setError(err.message || '数据加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshProducts = async () => {
    try {
      const data = await productService.getAllActive();
      setProducts(data);
    } catch (err: any) {
      console.error('产品刷新失败:', err);
    }
  };

  const refreshCountries = async () => {
    try {
      const data = await countryService.getAllActive();
      setCountries(data);
    } catch (err: any) {
      console.error('国家刷新失败:', err);
    }
  };

  return (
    <DataContext.Provider
      value={{
        series,
        countries,
        products,
        banners,
        loading,
        error,
        lastUpdated,
        refresh: loadData,
        refreshProducts,
        refreshCountries,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

// 便捷 hooks
export function useProducts() {
  const { products, loading, refreshProducts } = useData();
  return { products, loading, refreshProducts };
}

export function useCountries() {
  const { countries, loading, refreshCountries } = useData();
  return { countries, loading, refreshCountries };
}

export function useSeries() {
  const { series, loading } = useData();
  return { series, loading };
}

export function useBanners() {
  const { banners } = useData();
  return banners;
}
