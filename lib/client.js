window.__ModuleLoader__.load({
	id: "dsh-hub",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region hub css
		const css = ".hb_section{width:100%;max-width:760px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:14px;display:flex}.hb_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;padding:12px 14px;flex-direction:column;gap:8px;display:flex;min-width:0}.hb_heading{display:flex;align-items:baseline;gap:7px;padding:0 2px;margin:0}.hb_heading h3{margin:0;font-size:13px;font-weight:600;line-height:20px}.hb_heading span{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;font-size:12px}.hb_info{margin:0;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}.hb_bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.hb_btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:8px;height:34px;padding:0 14px;font-size:13px}.hb_btn:hover{border-color:var(--dsw-alias-label-dimmed)}.hb_btn:disabled{opacity:.5;cursor:default}.hb_primary{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-inverse,#fff)}.hb_ok{color:var(--dsw-alias-state-success-primary);font-size:13px;line-height:20px}.hb_warn{color:var(--dsw-alias-state-warning-primary,var(--dsw-alias-state-error-primary));font-size:13px;line-height:20px}.hb_err{color:var(--dsw-alias-state-error-primary);font-size:13px;line-height:20px}.hb_notice{margin:0;font-size:13px;line-height:20px}.hb_notice[data-kind=error]{color:var(--dsw-alias-state-error-primary)}.hb_notice[data-kind=success]{color:var(--dsw-alias-state-success-primary)}.hb_kv{display:flex;gap:6px;align-items:baseline;font-size:13px;line-height:20px;flex-wrap:wrap}.hb_kv b{font-weight:600}.hb_code{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:6px;padding:2px 8px;font:12px/18px ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--dsw-alias-label-secondary);user-select:all}";
		const tagId = "dsh-hub/hub.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-hub";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		const s = {
			section: "hb_section", card: "hb_card", heading: "hb_heading", info: "hb_info",
			bar: "hb_bar", btn: "hb_btn", primary: "hb_primary", ok: "hb_ok", warn: "hb_warn",
			err: "hb_err", notice: "hb_notice", kv: "hb_kv", code: "hb_code"
		};
		//#endregion
		//#region locales
		const zh = {
			tab: "插件中枢",
			title: "dsh-hub 插件中枢",
			loading: "正在读取状态…",
			loadFailed: "读取状态失败：",
			memoryTitle: "全局记忆",
			memoryDesc: "5 个 memory_* 工具（memory_save / memory_search / memory_list / memory_get / memory_delete），所有会话共享。",
			memoryRecords: "记忆条数",
			memoryFile: "数据文件",
			gmTitle: "graph-memory（记忆图谱）",
			gmSourceMissing: "未在 plugin-src 找到 graph-memory 源码",
			gmSourceVersion: "源码版本",
			gmInstalled: "已装配",
			gmNotInstalled: "未装配",
			gmPartial: "装配不完整（bundles/link/node_modules 缺项）",
			gmMount: "立即装配",
			gmMounting: "装配中…",
			gmMounted: "已装配完成，重启 DSH 后生效。",
			gmMountFailed: "装配失败：",
			gmAlready: "已装配，无需重复操作。",
			gmDbEmpty: "记忆库尚未创建（graph-memory 首次运行后生成）",
			gmDbNodes: "节点",
			gmDbEdges: "边",
			gmDbCommunities: "社区",
			gmDbSize: "库大小",
			marketTitle: "dsh-market（插件市场）",
			marketInstalled: "已安装",
			marketNotInstalled: "未安装",
			marketRemind: "未检测到插件市场（dshmarket）。安装后可浏览 800+ 社区插件。安装命令：",
			marketOpenRepo: "打开仓库",
			marketGoMarket: "已安装：可在 设置 → 插件市场 浏览与安装插件。",
			selfTitle: "dsh-hub 自身更新",
			selfVersion: "当前版本",
			selfLatest: "最新版本",
			selfNeverChecked: "尚未检查",
			selfHasUpdate: "发现新版本，可从 GitHub 仓库获取更新。",
			selfUpToDate: "已是最新版本。",
			selfCheck: "检查更新",
			selfChecking: "检查中…",
			selfCheckFailed: "检查失败：",
			selfRepo: "更新仓库",
			restartHint: "装配/更新将在 DSH 服务重启后生效。",
			restartNow: "立即重启服务",
			restartManual: "未检测到客户端重启接口，请手动重启 DSH。"
		};
		const en = {
			tab: "Plugin hub",
			title: "dsh-hub",
			loading: "Loading status…",
			loadFailed: "Failed to load status: ",
			memoryTitle: "Global memory",
			memoryDesc: "5 memory_* tools shared across all sessions.",
			memoryRecords: "Records",
			memoryFile: "File",
			gmTitle: "graph-memory",
			gmSourceMissing: "graph-memory source not found in plugin-src",
			gmSourceVersion: "Source version",
			gmInstalled: "Installed",
			gmNotInstalled: "Not installed",
			gmPartial: "Incomplete assembly (bundles/link/node_modules)",
			gmMount: "Mount now",
			gmMounting: "Mounting…",
			gmMounted: "Mounted. Restart DSH to apply.",
			gmMountFailed: "Mount failed: ",
			gmAlready: "Already mounted.",
			gmDbEmpty: "Database not created yet",
			gmDbNodes: "Nodes",
			gmDbEdges: "Edges",
			gmDbCommunities: "Communities",
			gmDbSize: "Size",
			marketTitle: "dsh-market",
			marketInstalled: "Installed",
			marketNotInstalled: "Not installed",
			marketRemind: "Plugin market (dshmarket) not detected. Install command:",
			marketOpenRepo: "Open repo",
			marketGoMarket: "Installed: browse 800+ plugins under Settings → Plugin market.",
			selfTitle: "dsh-hub updates",
			selfVersion: "Current",
			selfLatest: "Latest",
			selfNeverChecked: "Not checked yet",
			selfHasUpdate: "New version available on GitHub.",
			selfUpToDate: "Up to date.",
			selfCheck: "Check updates",
			selfChecking: "Checking…",
			selfCheckFailed: "Check failed: ",
			selfRepo: "Update repo",
			restartHint: "Mount/update takes effect after DSH restarts.",
			restartNow: "Restart service now",
			restartManual: "No restart bridge detected; restart DSH manually."
		};
		const NS = "settings.dshHub";
		//#endregion
		//#region remote face
		const looseCodec = () => ({
			mode: "strict",
			typeSymbol: "dsh-hub/types#Json",
			schema: { parse: (value) => value }
		});
		const descriptor = (method, parameters) => ({
			id: `dsh-hub#dshHub/${method}`,
			service: "dshHub",
			namespace: "dshHub",
			method,
			invocation: { kind: "direct" },
			parameters: parameters.map((name) => ({ name, wire: name, source: "json", codec: looseCodec() })),
			result: looseCodec()
		});
		const REMOTE = {
			package: "dsh-hub",
			descriptors: [
				descriptor("status", []),
				descriptor("mountGraphMemory", []),
				descriptor("checkUpdate", [])
			]
		};
		//#endregion
		//#region components
		function unwrap(result) {
			if (result && result.ok !== false) return result.value;
			const detail = result?.error?.message ?? String(result?.error ?? "remote failed");
			throw new Error(detail);
		}
		function formatTime(ts, t) {
			if (!ts) return t("selfNeverChecked");
			const d = new Date(ts);
			const pad = (n) => String(n).padStart(2, "0");
			return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
		}
		function fmtBytes(n) {
			if (typeof n !== "number" || !Number.isFinite(n)) return "?";
			if (n < 1024) return n + " B";
			if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
			return (n / 1024 / 1024).toFixed(1) + " MB";
		}
		function HubTab(props) {
			const t = props.t;
			const [state, setState] = react.useState({ status: "loading", data: null, error: null });
			const [busy, setBusy] = react.useState({});
			const [notice, setNotice] = react.useState(null);
			const refresh = react.useCallback((silent) => {
				if (!silent) setState((current) => ({ ...current, status: "loading", error: null }));
				props.status().then((result) => {
					setState({ status: "ready", data: unwrap(result), error: null });
				}).catch((error) => {
					setState({ status: "error", data: null, error: String(error?.message ?? error) });
				});
			}, [props.status]);
			react.useEffect(() => {
				refresh(true);
			}, [refresh]);
			const doMount = () => {
				setBusy((current) => ({ ...current, mount: true }));
				setNotice(null);
				props.mountGraphMemory().then((result) => {
					setBusy((current) => { const next = { ...current }; delete next.mount; return next; });
					const value = result.ok !== false ? result.value : null;
					if (result.ok === false || value === null) {
						setNotice({ kind: "error", text: t("gmMountFailed") + (result.error?.message ?? String(result.error ?? "failed")) });
					} else if (value.ok === false) {
						setNotice({ kind: "error", text: t("gmMountFailed") + (value.message ?? value.reason ?? "failed") });
					} else if (value.already === true) {
						setNotice({ kind: "success", text: t("gmAlready") });
					} else {
						setNotice({ kind: "success", text: t("gmMounted") });
					}
					refresh(true);
				}).catch((error) => {
					setBusy((current) => { const next = { ...current }; delete next.mount; return next; });
					setNotice({ kind: "error", text: t("gmMountFailed") + String(error?.message ?? error) });
				});
			};
			const doCheck = () => {
				setBusy((current) => ({ ...current, check: true }));
				setNotice(null);
				props.checkUpdate().then((result) => {
					setBusy((current) => { const next = { ...current }; delete next.check; return next; });
					refresh(true);
				}).catch((error) => {
					setBusy((current) => { const next = { ...current }; delete next.check; return next; });
					setNotice({ kind: "error", text: t("selfCheckFailed") + String(error?.message ?? error) });
				});
			};
			const doRestart = () => {
				const bridge = typeof window !== "undefined" ? window.dshDesktop : undefined;
				if (bridge !== undefined && typeof bridge.restartService === "function") bridge.restartService();
				else setNotice({ kind: "error", text: t("restartManual") });
			};
			if (state.status === "loading") {
				return (0, react_jsx_runtime.jsx)("div", { className: s.section, children: (0, react_jsx_runtime.jsx)("p", { className: s.info, children: t("loading") }) });
			}
			if (state.status === "error") {
				return (0, react_jsx_runtime.jsx)("div", { className: s.section, children: (0, react_jsx_runtime.jsx)("p", { className: s.err, children: t("loadFailed") + state.error }) });
			}
			const data = state.data || {};
			const memory = data.memory || {};
			const gm = data.graphMemory || {};
			const gmSrc = gm.source || {};
			const gmInst = gm.installed || {};
			const gmDb = gm.db || null;
			const market = data.dshMarket || {};
			const update = data.update || {};
			const mountResult = gm.mountResult || null;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: s.section,
				children: [
					(0, react_jsx_runtime.jsxs)("div", { className: s.heading, children: [
						(0, react_jsx_runtime.jsx)("h3", { children: t("title") }),
						(0, react_jsx_runtime.jsx)("span", { children: "v" + (data.self?.version ?? "?") })
					] }),
					notice !== null ? (0, react_jsx_runtime.jsx)("p", { className: s.notice, "data-kind": notice.kind, children: notice.text }) : null,
					(0, react_jsx_runtime.jsxs)("div", { className: s.card, children: [
						(0, react_jsx_runtime.jsxs)("div", { className: s.heading, children: [
							(0, react_jsx_runtime.jsx)("h3", { children: t("memoryTitle") }),
							(0, react_jsx_runtime.jsx)("span", { children: typeof memory.records === "number" && memory.records >= 0 ? String(memory.records) : "?" })
						] }),
						(0, react_jsx_runtime.jsx)("p", { className: s.info, children: t("memoryDesc") }),
						(0, react_jsx_runtime.jsx)("div", { className: s.kv, children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							(0, react_jsx_runtime.jsx)("b", { children: t("memoryFile") + "：" }),
							(0, react_jsx_runtime.jsx)("span", { className: s.code, children: memory.file || "~/.dsh/memory/memories.jsonl" })
						] }) })
					] }),
					(0, react_jsx_runtime.jsxs)("div", { className: s.card, children: [
						(0, react_jsx_runtime.jsxs)("div", { className: s.heading, children: [
							(0, react_jsx_runtime.jsx)("h3", { children: t("gmTitle") }),
							gmSrc.present === true
								? (0, react_jsx_runtime.jsx)("span", { children: t("gmSourceVersion") + " " + (gmSrc.version ?? "?") })
								: null
						] }),
						gmSrc.present === true ? [
							gmInst.installed === true
								? (0, react_jsx_runtime.jsx)("p", { className: s.ok, children: "✓ " + t("gmInstalled") })
								: (0, react_jsx_runtime.jsxs)("div", { className: s.bar, children: [
									(0, react_jsx_runtime.jsx)("p", { className: s.warn, children: gmInst.inBundles || gmInst.linked || gmInst.nodeModules ? t("gmPartial") : t("gmNotInstalled") }),
									(0, react_jsx_runtime.jsx)("button", { type: "button", className: s.btn + " " + s.primary, disabled: busy.mount === true, onClick: doMount, children: busy.mount === true ? t("gmMounting") : t("gmMount") })
								] }),
							gmDb !== null ? (0, react_jsx_runtime.jsxs)("div", { className: s.kv, children: [
								(0, react_jsx_runtime.jsx)("b", { children: t("gmDbNodes") + "：" }), (0, react_jsx_runtime.jsx)("span", { children: gmDb.nodes ?? "?" }),
								(0, react_jsx_runtime.jsx)("b", { children: t("gmDbEdges") + "：" }), (0, react_jsx_runtime.jsx)("span", { children: gmDb.edges ?? "?" }),
								(0, react_jsx_runtime.jsx)("b", { children: t("gmDbCommunities") + "：" }), (0, react_jsx_runtime.jsx)("span", { children: gmDb.communities ?? "?" }),
								(0, react_jsx_runtime.jsx)("b", { children: t("gmDbSize") + "：" }), (0, react_jsx_runtime.jsx)("span", { children: fmtBytes(gmDb.dbSize) })
							] }) : null
						] : (0, react_jsx_runtime.jsx)("p", { className: s.warn, children: t("gmSourceMissing") }),
						mountResult !== null && mountResult.restartNeeded === true ? (0, react_jsx_runtime.jsxs)("div", { className: s.bar, children: [
							(0, react_jsx_runtime.jsx)("p", { className: s.warn, children: t("restartHint") }),
							(0, react_jsx_runtime.jsx)("button", { type: "button", className: s.btn, onClick: doRestart, children: t("restartNow") })
						] }) : null
					] }),
					(0, react_jsx_runtime.jsxs)("div", { className: s.card, children: [
						(0, react_jsx_runtime.jsxs)("div", { className: s.heading, children: [
							(0, react_jsx_runtime.jsx)("h3", { children: t("marketTitle") }),
							(0, react_jsx_runtime.jsx)("span", { children: market.installed === true ? t("marketInstalled") + (market.version ? " v" + market.version : "") : t("marketNotInstalled") })
						] }),
						market.installed === true
							? (0, react_jsx_runtime.jsx)("p", { className: s.ok, children: "✓ " + t("marketGoMarket") })
							: (0, react_jsx_runtime.jsxs)("div", { className: s.bar, children: [
								(0, react_jsx_runtime.jsx)("p", { className: s.warn, children: t("marketRemind") }),
								(0, react_jsx_runtime.jsx)("span", { className: s.code, children: market.installHint || "dsh plugin --profile web add dshmarket" }),
								(0, react_jsx_runtime.jsx)("button", { type: "button", className: s.btn, onClick: () => window.open(market.repo || "https://github.com/dsh-market/dsh-market", "_blank", "noopener,noreferrer"), children: t("marketOpenRepo") })
							] })
					] }),
					(0, react_jsx_runtime.jsxs)("div", { className: s.card, children: [
						(0, react_jsx_runtime.jsxs)("div", { className: s.heading, children: [
							(0, react_jsx_runtime.jsx)("h3", { children: t("selfTitle") }),
							(0, react_jsx_runtime.jsx)("span", { children: "v" + (update.current ?? "?") })
						] }),
						(0, react_jsx_runtime.jsxs)("div", { className: s.bar, children: [
							(0, react_jsx_runtime.jsxs)("div", { className: s.kv, children: [
								(0, react_jsx_runtime.jsx)("b", { children: t("selfLatest") + "：" }),
								(0, react_jsx_runtime.jsx)("span", { children: update.latest ? "v" + update.latest : t("selfNeverChecked") + "（" + formatTime(update.checkedAt, t) + "）" }),
								(0, react_jsx_runtime.jsx)("b", { children: t("selfRepo") + "：" }),
								(0, react_jsx_runtime.jsx)("span", { className: s.code, children: "ARFCON/DSH_Automatic-update-plugin" })
							] }),
							(0, react_jsx_runtime.jsx)("button", { type: "button", className: s.btn + " " + s.primary, disabled: busy.check === true, onClick: doCheck, children: busy.check === true ? t("selfChecking") : t("selfCheck") })
						] }),
						update.hasUpdate === true
							? (0, react_jsx_runtime.jsx)("p", { className: s.warn, children: "↑ " + t("selfHasUpdate") })
							: update.error !== null && update.error !== undefined && update.error !== ""
								? (0, react_jsx_runtime.jsx)("p", { className: s.err, children: t("selfCheckFailed") + update.error })
								: update.checkedAt > 0 ? (0, react_jsx_runtime.jsx)("p", { className: s.ok, children: "✓ " + t("selfUpToDate") }) : null
					] })
				]
			});
		}
		//#endregion
		//#region client index
		const inject = ["slots", "locale", "remote"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-hub: dictionaries");
			const t = ctx.locale.bind(NS);
			let mountFailure = null;
			const mountPromise = ctx.remote.$mount(REMOTE).then((dispose) => {
				ctx.effect(() => dispose, "dsh-hub: remote face");
				return true;
			}, (error) => {
				mountFailure = String((error && error.message) || error);
				console.error("dsh-hub: remote face mount failed", error);
				return false;
			});
			/** 解析挂载后的 host 服务（与内置插件市场同一模式）。 */
			const remote = async () => {
				await mountPromise;
				if (mountFailure !== null) throw new Error("dshHub 远程接口未就绪: " + mountFailure);
				const service = ctx.get("remote.dshHub");
				if (service === void 0 || service === null || typeof service !== "object") {
					await new Promise((resolve) => setTimeout(resolve, 50));
					const retry = ctx.get("remote.dshHub");
					if (retry === void 0 || retry === null || typeof retry !== "object") throw new Error("dshHub 远程接口未注册");
					return retry;
				}
				return service;
			};
			const injected = () => ({
				status: () => remote().then((face) => face.status()),
				mountGraphMemory: () => remote().then((face) => face.mountGraphMemory()),
				checkUpdate: () => remote().then((face) => face.checkUpdate())
			});
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				name: "settings.plugins.tab",
				id: "dsh-hub",
				order: 40,
				label: () => t("tab"),
				locale: NS,
				inject: injected
			}, HubTab));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
