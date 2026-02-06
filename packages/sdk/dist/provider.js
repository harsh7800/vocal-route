"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVocalRoute = void 0;
exports.VocalRouteProvider = VocalRouteProvider;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const recorder_1 = require("./audio/recorder");
const routeMap_1 = require("./registry/routeMap");
const VocalRouteContext = (0, react_1.createContext)(null);
function VocalRouteProvider({ children }) {
    const recorderRef = (0, react_1.useRef)(new recorder_1.AudioRecorder());
    const router = (0, navigation_1.useRouter)();
    const startListening = async () => {
        await recorderRef.current.start();
    };
    const stopListening = async () => {
        const _audio = await recorderRef.current.stop();
        // 🔴 Fake intent for now
        const intent = {
            intent: 'navigate',
            target: 'invoices',
            confidence: 0.95,
        };
        const route = routeMap_1.routeRegistry[intent.target];
        if (route)
            router.push(route);
    };
    return ((0, jsx_runtime_1.jsx)(VocalRouteContext.Provider, { value: { startListening, stopListening }, children: children }));
}
const useVocalRoute = () => {
    const ctx = (0, react_1.useContext)(VocalRouteContext);
    if (!ctx)
        throw new Error('useVocalRoute must be used inside provider');
    return ctx;
};
exports.useVocalRoute = useVocalRoute;
