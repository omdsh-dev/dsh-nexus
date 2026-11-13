window.__ModuleLoader__.load({id:"dsh-nexus",factory:(require)=>{var module={exports:{}};var exports=module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
// \0rolldown/runtime.js
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);
let react = require("react");
let react_jsx_runtime = require("react/jsx-runtime");
let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
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
	t: noop,
	useStore: {},
	actions: {}
});
// src/client/locale/index.ts
const dicts = {
	zh: {
		panel: "Nexus",
		title: "Nexus",
		desc: "多渠道协作与任务编排",
		openMainSession: "打开主会话",
		tabsLabel: "面板分区",
		tabOverview: "概览",
		tabTickets: "任务",
		tabTriggers: "触发",
		tabChannels: "渠道",
		tabSettings: "设置",
		sessionListNotReady: "会话列表未就绪",
		sessionNotListed: "会话未被列出"
	},
	en: {
		panel: "Nexus",
		title: "Nexus",
		desc: "Multi-channel collaboration and task orchestration",
		openMainSession: "Open main session",
		tabsLabel: "Panel sections",
		tabOverview: "Overview",
		tabTickets: "Tasks",
		tabTriggers: "Triggers",
		tabChannels: "Channels",
		tabSettings: "Settings",
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
// node_modules/.pnpm/react-if-lite@0.1.0_react@18.3.1/node_modules/react-if-lite/dist/index.mjs
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
function wrapper(asChild, props, children) {
	return asChild ? (0, react.createElement)(asChild, props, children) : children;
}
function Case(props) {
	const { cond, children, as, ...rest } = props;
	return wrapper(as, rest, children);
}
function Default(props) {
	const { children, as, ...rest } = props;
	return wrapper(as, rest, children);
}
function Switch(props) {
	const { as, value, children, ...rest } = props;
	const isUseValue = props.value !== void 0;
	let matchingCase;
	let defaultCase;
	react.Children.forEach(children, (child) => {
		if (!(0, react.isValidElement)(child) || matchingCase) return;
		if (child.type === Case) {
			const cond = child?.props?.cond;
			if (isUseValue ? value === cond : cond) {
				matchingCase = child;
				return;
			}
		}
		if (!defaultCase && child.type === Default) defaultCase = child;
	});
	return wrapper(as, rest, matchingCase ?? defaultCase ?? null);
}
// src/client/hooks/use-store.ts
/**
* 从面板 store 里选一片状态。
* @param select - 状态选择器，拿到的就是复合状态。
* @returns 选中的值，按 Object.is 比较。
*/
function useStore(select) {
	return (0, react.useContext)(PluginContext).useStore(select);
}
/**
* 面板 store 的写侧。
* @returns 官方烘焙过的动作集，形参已去掉 draft。
*/
function useActions() {
	return (0, react.useContext)(PluginContext).actions;
}
// src/client/hooks/use-navigation.ts
/**
* 当前路由。
* @returns store 里 `navigation` 那一片的页面值。
*/
function usePage() {
	return useStore(_temp);
}
/**
* 切页面的动作。
* @returns 接收目标页面的回调；详情页也走它。
*/
function _temp(state) {
	return state.navigation.page;
}
function useNavigate() {
	return useActions().go;
}
// src/client/hooks/use-translation.ts
/**
* 面板命名空间的翻译函数。
* @returns 绑定到 `dshNexus` 的 `t`。
*/
function useTranslation() {
	const $ = (0, import_dist.c)(2);
	const t0 = (0, react.useContext)(PluginContext);
	let t1;
	if ($[0] !== t0.t) {
		t1 = { t: t0.t };
		$[0] = t0.t;
		$[1] = t1;
	} else t1 = $[1];
	return t1;
}
// src/client/store/index.ts
/** 页签顺序即数组顺序。`channel/detail` 不在里面，它不是页签。 */
const TABS = [
	{
		kind: "overview",
		label: "tabOverview"
	},
	{
		kind: "ticket",
		label: "tabTickets"
	},
	{
		kind: "trigger",
		label: "tabTriggers"
	},
	{
		kind: "channel",
		label: "tabChannels"
	},
	{
		kind: "setting",
		label: "tabSettings"
	}
];
/**
* 路由归属的页签：取路径第一段，任意 `xxx/yyy` 都落到 `xxx` 页签。
* @param page - 当前路由。
* @returns 要高亮的页签。
*/
function tabOf(page) {
	const [tab] = page.split("/");
	return tab;
}
const store = (0, _deepseek_ai_dsh_client_store.defineStore)({
	init: () => ({ navigation: { page: "overview" } }),
	actions: { go: (draft, page) => {
		draft.navigation.page = page;
	} }
});
// src/client/ui/channel.tsx
function Channel() {
	return "Channel";
}
// src/client/ui/channel-detail.tsx
function ChannelDetail() {
	return "ChannelDetail";
}
// src/client/ui/overview.tsx
function Overflow() {
	return "Overflow";
}
// src/client/ui/setting.tsx
function Setting() {
	return "Setting";
}
// src/client/ui/ticket.tsx
function Ticket() {
	return "Ticket";
}
// src/client/ui/trigger.tsx
function Trigger() {
	return "Trigger";
}
// src/client/panel.tsx
/**
* 把官方的分段控件覆盖成 `soruce/dsh-superagent-prototype` 的下划线页签。
*
* 官方组件把自己的 CSS Modules 类挂在容器和页签上，改不动那层样式，
* 只能从父级后代选择器压过去 —— 带 `!` 的几个是官方也声明了的属性，
* 其余（gap、底边、下划线）是新加的，不需要。
*/
const TABS_CLASS = [
	"flex! gap-5 overflow-x-auto p-0! rounded-none! bg-transparent!",
	"border-b-[0.5px] border-b-[var(--dsw-alias-border-l3)]",
	"[&>span]:hidden",
	"[&>button]:h-[34px]! [&>button]:shrink-0 [&>button]:rounded-none! [&>button]:border-0!",
	"[&>button]:bg-transparent! [&>button]:px-0.5! [&>button]:font-normal!",
	"[&>button]:text-[var(--dsw-alias-label-tertiary)]!",
	"[&>button:hover]:text-[var(--dsw-alias-label-primary)]!",
	"[&>button[aria-selected=true]]:bg-transparent!",
	"[&>button[aria-selected=true]]:font-medium!",
	"[&>button[aria-selected=true]]:text-[var(--dsw-alias-label-primary)]!",
	"[&>button[aria-selected=true]]:shadow-[inset_0_-1.5px_0_var(--dsw-alias-label-primary)]"
].join(" ");
/**
* Nexus 主面板。
*
* 版面照官方管理页：整页滚动、内容列最宽 960px、24–48px 响应式留白、
* 20px 标题加一行 13px 说明。搜索框和标题旁的信息按钮不搬。
*
* 面板不接收任何 props：上下文、翻译、路由都从 `hooks/*` 读。
*/
function Panel() {
	const $ = (0, import_dist.c)(52);
	const { t } = useTranslation();
	const page = usePage();
	const navigate = useNavigate();
	const t0 = (0, react.useId)();
	let t1;
	if ($[0] !== t0) {
		t1 = t0.replaceAll(":", "");
		$[0] = t0;
		$[1] = t1;
	} else t1 = $[1];
	const tabsId = t1;
	let t2;
	if ($[2] !== t || $[3] !== tabsId) {
		t2 = TABS.map((tab) => ({
			value: tab.kind,
			label: t(tab.label),
			id: `${tabsId}-${tab.kind}`,
			panelId: `${tabsId}-${tab.kind}-panel`
		}));
		$[2] = t;
		$[3] = tabsId;
		$[4] = t2;
	} else t2 = $[4];
	const items = t2;
	let t3;
	if ($[5] !== page) {
		t3 = tabOf(page);
		$[5] = page;
		$[6] = t3;
	} else t3 = $[6];
	const tab_0 = t3;
	let t4;
	if ($[7] !== t) {
		t4 = t("title");
		$[7] = t;
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[9] !== t4) {
		t5 = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
			className: "text-xl leading-7 font-medium",
			children: t4
		});
		$[9] = t4;
		$[10] = t5;
	} else t5 = $[10];
	let t6;
	if ($[11] !== t) {
		t6 = t("desc");
		$[11] = t;
		$[12] = t6;
	} else t6 = $[12];
	let t7;
	if ($[13] !== t6) {
		t7 = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
			className: "mt-1 text-[13px] leading-5 text-[var(--dsw-alias-label-secondary)]",
			children: t6
		});
		$[13] = t6;
		$[14] = t7;
	} else t7 = $[14];
	let t8;
	if ($[15] !== t5 || $[16] !== t7) {
		t8 = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [t5, t7]
		});
		$[15] = t5;
		$[16] = t7;
		$[17] = t8;
	} else t8 = $[17];
	let t9;
	if ($[18] !== t) {
		t9 = t("openMainSession");
		$[18] = t;
		$[19] = t9;
	} else t9 = $[19];
	let t10;
	if ($[20] !== t9) {
		t10 = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
			variant: "outline",
			size: "sm",
			children: t9
		});
		$[20] = t9;
		$[21] = t10;
	} else t10 = $[21];
	let t11;
	if ($[22] !== t10 || $[23] !== t8) {
		t11 = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-start justify-between gap-4",
			children: [t8, t10]
		});
		$[22] = t10;
		$[23] = t8;
		$[24] = t11;
	} else t11 = $[24];
	let t12;
	if ($[25] !== navigate) {
		t12 = (kind) => navigate(kind);
		$[25] = navigate;
		$[26] = t12;
	} else t12 = $[26];
	let t13;
	if ($[27] !== t) {
		t13 = t("tabsLabel");
		$[27] = t;
		$[28] = t13;
	} else t13 = $[28];
	let t14;
	if ($[29] !== items || $[30] !== t12 || $[31] !== t13 || $[32] !== tab_0) {
		t14 = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SegmentedTabs, {
			size: "sm",
			items,
			value: tab_0,
			onChange: t12,
			label: t13,
			className: TABS_CLASS
		});
		$[29] = items;
		$[30] = t12;
		$[31] = t13;
		$[32] = tab_0;
		$[33] = t14;
	} else t14 = $[33];
	let t15;
	if ($[34] !== t11 || $[35] !== t14) {
		t15 = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
			className: "flex w-full max-w-[960px] flex-none flex-col gap-4 pt-7",
			children: [t11, t14]
		});
		$[34] = t11;
		$[35] = t14;
		$[36] = t15;
	} else t15 = $[36];
	const t16 = `${tabsId}-${tab_0}-panel`;
	const t17 = `${tabsId}-${tab_0}`;
	let t18;
	if ($[37] === Symbol.for("react.memo_cache_sentinel")) {
		t18 = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Case, {
			cond: "overview",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Overflow, {})
		});
		$[37] = t18;
	} else t18 = $[37];
	let t19;
	if ($[38] === Symbol.for("react.memo_cache_sentinel")) {
		t19 = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Case, {
			cond: "ticket",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Ticket, {})
		});
		$[38] = t19;
	} else t19 = $[38];
	let t20;
	if ($[39] === Symbol.for("react.memo_cache_sentinel")) {
		t20 = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Case, {
			cond: "trigger",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Trigger, {})
		});
		$[39] = t20;
	} else t20 = $[39];
	let t21;
	if ($[40] === Symbol.for("react.memo_cache_sentinel")) {
		t21 = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Case, {
			cond: "channel",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Channel, {})
		});
		$[40] = t21;
	} else t21 = $[40];
	let t22;
	if ($[41] === Symbol.for("react.memo_cache_sentinel")) {
		t22 = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Case, {
			cond: "channel/detail",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChannelDetail, {})
		});
		$[41] = t22;
	} else t22 = $[41];
	let t23;
	if ($[42] === Symbol.for("react.memo_cache_sentinel")) {
		t23 = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Case, {
			cond: "setting",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Setting, {})
		});
		$[42] = t23;
	} else t23 = $[42];
	let t24;
	if ($[43] !== page) {
		t24 = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Switch, {
			value: page,
			children: [
				t18,
				t19,
				t20,
				t21,
				t22,
				t23
			]
		});
		$[43] = page;
		$[44] = t24;
	} else t24 = $[44];
	let t25;
	if ($[45] !== t16 || $[46] !== t17 || $[47] !== t24) {
		t25 = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			id: t16,
			role: "tabpanel",
			"aria-labelledby": t17,
			className: "mt-6 flex w-full max-w-[960px] flex-none flex-col gap-6",
			children: t24
		});
		$[45] = t16;
		$[46] = t17;
		$[47] = t24;
		$[48] = t25;
	} else t25 = $[48];
	let t26;
	if ($[49] !== t15 || $[50] !== t25) {
		t26 = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
			className: "flex h-full w-full flex-col items-center overflow-y-auto px-[clamp(24px,4vw,48px)] text-[var(--dsw-alias-label-primary)]",
			children: [t15, t25]
		});
		$[49] = t15;
		$[50] = t25;
		$[51] = t26;
	} else t26 = $[51];
	return t26;
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
		store
	}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PluginContext.Provider, {
		value: {
			ctx,
			t: props.t,
			useStore: props.useStore,
			actions: props.actions
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