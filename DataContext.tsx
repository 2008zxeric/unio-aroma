import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ScentItem, Destination } from './types';
import { loadProducts, loadDestinations } from './dataService';

interface DataContextType {
  database: Record<string, ScentItem>;
  destinations: Record<string, Destination>;
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType>({
  database: {},
  destinations: {},
  loading: true,
  error: null,
});

export const useData = () => useContext(DataContext);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [database, setDatabase] = useState<Record<string, ScentItem>>({});
  const [destinations, setDestinations] = useState<Record<string, Destination>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [products, dests] = await Promise.all([
          loadProducts(),
          loadDestinations(),
        ]);
        setDatabase(products);
        setDestinations(dests);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ database, destinations, loading, error }}>
      {children}
    </DataContext.Provider>
  );
};
