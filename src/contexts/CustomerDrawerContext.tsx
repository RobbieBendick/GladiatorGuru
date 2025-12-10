import { createContext, useContext, useState, ReactNode } from 'react';

interface CustomerDrawerContextType {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const CustomerDrawerContext = createContext<
  CustomerDrawerContextType | undefined
>(undefined);

export function CustomerDrawerProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <CustomerDrawerContext.Provider value={{ drawerOpen, setDrawerOpen }}>
      {children}
    </CustomerDrawerContext.Provider>
  );
}

export function useCustomerDrawer() {
  const context = useContext(CustomerDrawerContext);
  if (context === undefined) {
    throw new Error(
      'useCustomerDrawer must be used within a CustomerDrawerProvider'
    );
  }
  return context;
}
