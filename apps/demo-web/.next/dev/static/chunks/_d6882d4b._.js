(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/packages/sdk/src/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$sdk$2f$src$2f$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/sdk/src/provider.tsx [app-client] (ecmascript)");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/demo-web/components/VocalRouteButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VocalRouteButton",
    ()=>VocalRouteButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$sdk$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/sdk/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$sdk$2f$src$2f$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/sdk/src/provider.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function VocalRouteButton() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(8);
    if ($[0] !== "5b200efc973176306fd5bb7cf4a01e9a053c4a0d2d0d378e85911e5733b806a5") {
        for(let $i = 0; $i < 8; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "5b200efc973176306fd5bb7cf4a01e9a053c4a0d2d0d378e85911e5733b806a5";
    }
    const { startListening, stopListening } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$sdk$2f$src$2f$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useVocalRoute"])();
    let t0;
    if ($[1] !== startListening) {
        t0 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: startListening,
            children: "Start Listening"
        }, void 0, false, {
            fileName: "[project]/apps/demo-web/components/VocalRouteButton.tsx",
            lineNumber: 19,
            columnNumber: 10
        }, this);
        $[1] = startListening;
        $[2] = t0;
    } else {
        t0 = $[2];
    }
    let t1;
    if ($[3] !== stopListening) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: stopListening,
            children: "Stop"
        }, void 0, false, {
            fileName: "[project]/apps/demo-web/components/VocalRouteButton.tsx",
            lineNumber: 27,
            columnNumber: 10
        }, this);
        $[3] = stopListening;
        $[4] = t1;
    } else {
        t1 = $[4];
    }
    let t2;
    if ($[5] !== t0 || $[6] !== t1) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex gap-2",
            children: [
                t0,
                t1
            ]
        }, void 0, true, {
            fileName: "[project]/apps/demo-web/components/VocalRouteButton.tsx",
            lineNumber: 35,
            columnNumber: 10
        }, this);
        $[5] = t0;
        $[6] = t1;
        $[7] = t2;
    } else {
        t2 = $[7];
    }
    return t2;
}
_s(VocalRouteButton, "HBwadmPYXYcjwIK+WVWf5l9SOZE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$sdk$2f$src$2f$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useVocalRoute"]
    ];
});
_c = VocalRouteButton;
var _c;
__turbopack_context__.k.register(_c, "VocalRouteButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_d6882d4b._.js.map