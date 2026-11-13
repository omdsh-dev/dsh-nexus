window.__ModuleLoader__.load({id:"pkg-placeholder",factory:(require)=>{var module={exports:{}};var exports=module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
// \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);
let react = require("react");
let react_jsx_runtime = require("react/jsx-runtime");
// src/config/constants.ts
/**
* Client-safe constants only: this module is bundled into the browser Client
* artifact, so it must never import Node builtins. Host-only paths live in
* `./paths`.
*/
const PANEL_ID = "dsh-nexus";
const NS = "dshNexus";
Map.prototype;
Set.prototype;
function noop() {}
// src/client/config/context.ts
const PluginContext = (0, react.createContext)({
	ctx: {},
	t: noop
});
// src/client/locale/index.ts
const dicts = {
	zh: {
		panel: "Nexus",
		sessionListNotReady: "会话列表未就绪",
		sessionNotListed: "会话未被列出"
	},
	en: {
		panel: "Nexus",
		sessionListNotReady: "Session list not ready",
		sessionNotListed: "Session not listed"
	}
};
/**
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*
* @lightSyntaxTransform
* @noflow
* @nolint
* @preventMunge
* @preserve-invariant-messages
*/
// src/client/panel.tsx
var import_dist = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var index_exports = {};
	__export(index_exports, {
		$dispatcherGuard: () => $dispatcherGuard,
		$makeReadOnly: () => $makeReadOnly,
		$reset: () => $reset,
		$structuralCheck: () => $structuralCheck,
		c: () => c,
		clearRenderCounterRegistry: () => clearRenderCounterRegistry,
		renderCounterRegistry: () => renderCounterRegistry,
		useRenderCounter: () => useRenderCounter
	});
	module.exports = __toCommonJS(index_exports);
	var React = __toESM(require("react"));
	var { useRef, useEffect, isValidElement } = React;
	var _a;
	var ReactSecretInternals = (_a = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) != null ? _a : React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
	var $empty = Symbol.for("react.memo_cache_sentinel");
	var _a2;
	var c = typeof ((_a2 = React.__COMPILER_RUNTIME) == null ? void 0 : _a2.c) === "function" ? React.__COMPILER_RUNTIME.c : function c2(size) {
		return React.useMemo(() => {
			const $ = new Array(size);
			for (let ii = 0; ii < size; ii++) $[ii] = $empty;
			$[$empty] = true;
			return $;
		}, []);
	};
	var LazyGuardDispatcher = {};
	[
		"readContext",
		"useCallback",
		"useContext",
		"useEffect",
		"useImperativeHandle",
		"useInsertionEffect",
		"useLayoutEffect",
		"useMemo",
		"useReducer",
		"useRef",
		"useState",
		"useDebugValue",
		"useDeferredValue",
		"useTransition",
		"useMutableSource",
		"useSyncExternalStore",
		"useId",
		"unstable_isNewReconciler",
		"getCacheSignal",
		"getCacheForType",
		"useCacheRefresh"
	].forEach((name) => {
		LazyGuardDispatcher[name] = () => {
			throw new Error(`[React] Unexpected React hook call (${name}) from a React compiled function. Check that all hooks are called directly and named according to convention ('use[A-Z]') `);
		};
	});
	var originalDispatcher = null;
	LazyGuardDispatcher["useMemoCache"] = (count) => {
		if (originalDispatcher == null) throw new Error("React Compiler internal invariant violation: unexpected null dispatcher");
		else return originalDispatcher.useMemoCache(count);
	};
	function setCurrent(newDispatcher) {
		ReactSecretInternals.ReactCurrentDispatcher.current = newDispatcher;
		return ReactSecretInternals.ReactCurrentDispatcher.current;
	}
	var guardFrames = [];
	function $dispatcherGuard(kind) {
		const curr = ReactSecretInternals.ReactCurrentDispatcher.current;
		if (kind === 0) {
			guardFrames.push(curr);
			if (guardFrames.length === 1) originalDispatcher = curr;
			if (curr === LazyGuardDispatcher) throw new Error(`[React] Unexpected call to custom hook or component from a React compiled function. Check that (1) all hooks are called directly and named according to convention ('use[A-Z]') and (2) components are returned as JSX instead of being directly invoked.`);
			setCurrent(LazyGuardDispatcher);
		} else if (kind === 1) {
			const lastFrame = guardFrames.pop();
			if (lastFrame == null) throw new Error("React Compiler internal error: unexpected null in guard stack");
			if (guardFrames.length === 0) originalDispatcher = null;
			setCurrent(lastFrame);
		} else if (kind === 2) {
			guardFrames.push(curr);
			setCurrent(originalDispatcher);
		} else if (kind === 3) {
			const lastFrame = guardFrames.pop();
			if (lastFrame == null) throw new Error("React Compiler internal error: unexpected null in guard stack");
			setCurrent(lastFrame);
		} else throw new Error("React Compiler internal error: unreachable block" + kind);
	}
	function $reset($) {
		for (let ii = 0; ii < $.length; ii++) $[ii] = $empty;
	}
	function $makeReadOnly() {
		throw new Error("TODO: implement $makeReadOnly in react-compiler-runtime");
	}
	var renderCounterRegistry = /* @__PURE__ */ new Map();
	function clearRenderCounterRegistry() {
		for (const counters of renderCounterRegistry.values()) counters.forEach((counter) => {
			counter.count = 0;
		});
	}
	function registerRenderCounter(name, val) {
		let counters = renderCounterRegistry.get(name);
		if (counters == null) {
			counters = /* @__PURE__ */ new Set();
			renderCounterRegistry.set(name, counters);
		}
		counters.add(val);
	}
	function removeRenderCounter(name, val) {
		const counters = renderCounterRegistry.get(name);
		if (counters == null) return;
		counters.delete(val);
	}
	function useRenderCounter(name) {
		const val = useRef(null);
		if (val.current != null) val.current.count += 1;
		useEffect(() => {
			if (val.current == null) {
				const counter = { count: 0 };
				registerRenderCounter(name, counter);
				val.current = counter;
			}
			return () => {
				if (val.current !== null) removeRenderCounter(name, val.current);
			};
		});
	}
	var seenErrors = /* @__PURE__ */ new Set();
	function $structuralCheck(oldValue, newValue, variableName, fnName, kind, loc) {
		function error(l, r, path, depth) {
			const str = `${fnName}:${loc} [${kind}] ${variableName}${path} changed from ${l} to ${r} at depth ${depth}`;
			if (seenErrors.has(str)) return;
			seenErrors.add(str);
			console.error(str);
		}
		const depthLimit = 2;
		function recur(oldValue2, newValue2, path, depth) {
			if (depth > depthLimit) return;
			else if (oldValue2 === newValue2) return;
			else if (typeof oldValue2 !== typeof newValue2) error(`type ${typeof oldValue2}`, `type ${typeof newValue2}`, path, depth);
			else if (typeof oldValue2 === "object") {
				const oldArray = Array.isArray(oldValue2);
				const newArray = Array.isArray(newValue2);
				if (oldValue2 === null && newValue2 !== null) error("null", `type ${typeof newValue2}`, path, depth);
				else if (newValue2 === null) error(`type ${typeof oldValue2}`, "null", path, depth);
				else if (oldValue2 instanceof Map) {
					if (!(newValue2 instanceof Map)) error(`Map instance`, `other value`, path, depth);
					else if (oldValue2.size !== newValue2.size) error(`Map instance with size ${oldValue2.size}`, `Map instance with size ${newValue2.size}`, path, depth);
					else for (const [k, v] of oldValue2) if (!newValue2.has(k)) error(`Map instance with key ${k}`, `Map instance without key ${k}`, path, depth);
					else recur(v, newValue2.get(k), `${path}.get(${k})`, depth + 1);
				} else if (newValue2 instanceof Map) error("other value", `Map instance`, path, depth);
				else if (oldValue2 instanceof Set) {
					if (!(newValue2 instanceof Set)) error(`Set instance`, `other value`, path, depth);
					else if (oldValue2.size !== newValue2.size) error(`Set instance with size ${oldValue2.size}`, `Set instance with size ${newValue2.size}`, path, depth);
					else for (const v of newValue2) if (!oldValue2.has(v)) error(`Set instance without element ${v}`, `Set instance with element ${v}`, path, depth);
				} else if (newValue2 instanceof Set) error("other value", `Set instance`, path, depth);
				else if (oldArray || newArray) {
					if (oldArray !== newArray) error(`type ${oldArray ? "array" : "object"}`, `type ${newArray ? "array" : "object"}`, path, depth);
					else if (oldValue2.length !== newValue2.length) error(`array with length ${oldValue2.length}`, `array with length ${newValue2.length}`, path, depth);
					else for (let ii = 0; ii < oldValue2.length; ii++) recur(oldValue2[ii], newValue2[ii], `${path}[${ii}]`, depth + 1);
				} else if (isValidElement(oldValue2) || isValidElement(newValue2)) {
					if (isValidElement(oldValue2) !== isValidElement(newValue2)) error(`type ${isValidElement(oldValue2) ? "React element" : "object"}`, `type ${isValidElement(newValue2) ? "React element" : "object"}`, path, depth);
					else if (oldValue2.type !== newValue2.type) error(`React element of type ${oldValue2.type}`, `React element of type ${newValue2.type}`, path, depth);
					else recur(oldValue2.props, newValue2.props, `[props of ${path}]`, depth + 1);
				} else {
					for (const key in newValue2) if (!(key in oldValue2)) error(`object without key ${key}`, `object with key ${key}`, path, depth);
					for (const key in oldValue2) if (!(key in newValue2)) error(`object with key ${key}`, `object without key ${key}`, path, depth);
					else recur(oldValue2[key], newValue2[key], `${path}.${key}`, depth + 1);
				}
			} else if (typeof oldValue2 === "function") return;
			else if (isNaN(oldValue2) || isNaN(newValue2)) {
				if (isNaN(oldValue2) !== isNaN(newValue2)) error(`${isNaN(oldValue2) ? "NaN" : "non-NaN value"}`, `${isNaN(newValue2) ? "NaN" : "non-NaN value"}`, path, depth);
			} else if (oldValue2 !== newValue2) error(oldValue2, newValue2, path, depth);
		}
		recur(oldValue, newValue, "", 0);
	}
	0 && (module.exports = {
		$dispatcherGuard,
		$makeReadOnly,
		$reset,
		$structuralCheck,
		c,
		clearRenderCounterRegistry,
		renderCounterRegistry,
		useRenderCounter
	});
})))();
function Panel() {
	const $ = (0, import_dist.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {});
		$[0] = t0;
	} else t0 = $[0];
	return t0;
}
function PanelIcon(t0) {
	const $ = (0, import_dist.c)(5);
	const { size } = t0;
	let t1;
	let t2;
	let t3;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 3.5h9l3.5 1.75v2.5L15 9.5H6a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z" });
		t2 = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10 9.5v10.25a1.75 1.75 0 0 0 3.5 0V9.5" });
		t3 = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10 15.5h3.5" });
		$[0] = t1;
		$[1] = t2;
		$[2] = t3;
	} else {
		t1 = $[0];
		t2 = $[1];
		t3 = $[2];
	}
	let t4;
	if ($[3] !== size) {
		t4 = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
			width: size,
			height: size,
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: 1.8,
			strokeLinecap: "round",
			strokeLinejoin: "round",
			"aria-hidden": true,
			children: [
				t1,
				t2,
				t3
			]
		});
		$[3] = size;
		$[4] = t4;
	} else t4 = $[4];
	return t4;
}
// src/client/index.tsx
const inject = [
	"slots",
	"locale",
	"sessions",
	"uiWorkspace"
];
function apply(ctx) {
	ctx.effect(() => ctx.locale.register(NS, dicts), `${NS}: dictionaries`);
	const t = ctx.locale.bind(NS);
	ctx.slots.inject("main", () => ctx.slots.register({
		name: "main",
		key: PANEL_ID,
		locale: NS,
		inject: () => ({})
	}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PluginContext.Provider, {
		value: {
			ctx,
			t: props.t
		},
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Panel, {})
	})));
	ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
		name: "sidebar.panellist",
		id: PANEL_ID,
		order: 10,
		label: () => t("panel"),
		locale: NS
	}, PanelIcon));
}
exports.apply = apply;
exports.inject = inject;

return module.exports;}});
//# sourceMappingURL=client.cjs.map