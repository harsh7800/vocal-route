import React, { createContext, useContext, ReactNode } from 'react';

interface VocalRouteContextType {
      // Define context state here
}

const VocalRouteContext = createContext<VocalRouteContextType | undefined>(undefined);

export const VocalRouteProvider = ({ children }: { children: ReactNode }) => {
      return (
            <VocalRouteContext.Provider value={{}}>
                  {children}
            </VocalRouteContext.Provider>
      );
};

export const useVocalRouteContext = () => {
      const context = useContext(VocalRouteContext);
      if (!context) {
            throw new Error('useVocalRouteContext must be used within a VocalRouteProvider');
      }
      return context;
};
