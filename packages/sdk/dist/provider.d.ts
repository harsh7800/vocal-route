import React from 'react';
type ContextType = {
    isListening: boolean;
    transcript: string;
    startListening: () => Promise<void>;
    stopListening: () => Promise<void>;
};
export declare function VocalRouteProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare const useVocalRoute: () => ContextType;
export {};
