"use strict";
'use client';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVocalRoute = void 0;
exports.VocalRouteProvider = VocalRouteProvider;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const recorder_1 = require("./audio/recorder");
const routeMap_1 = require("./registry/routeMap");
const VocalRouteContext = (0, react_1.createContext)(null);
function VocalRouteProvider({ children }) {
    const [isListening, setIsListening] = react_1.default.useState(false);
    const [transcript, setTranscript] = react_1.default.useState('');
    const recorderRef = (0, react_1.useRef)(new recorder_1.AudioRecorder());
    const router = (0, navigation_1.useRouter)();
    const startListening = async () => {
        setIsListening(true);
        setTranscript('');
        await recorderRef.current.start();
    };
    const stopListening = async () => {
        setIsListening(false);
        const _audio = await recorderRef.current.stop();
        // 🔴 Fake intent for now
        setTranscript('Take me to invoices');
        const intent = {
            intent: 'navigate',
            target: 'invoices',
            confidence: 0.95,
        };
        const route = routeMap_1.routeRegistry[intent.target];
        if (route)
            router.push(route);
    };
    return ((0, jsx_runtime_1.jsx)(VocalRouteContext.Provider, { value: { isListening, transcript, startListening, stopListening }, children: children }));
}
const useVocalRoute = () => {
    const ctx = (0, react_1.useContext)(VocalRouteContext);
    if (!ctx)
        throw new Error('useVocalRoute must be used inside provider');
    return ctx;
};
exports.useVocalRoute = useVocalRoute;
