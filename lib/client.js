window.__ModuleLoader__.load({
	id: "dsh-hub",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region hub css（upd_* = 插件更新引擎样式，hb_* = 插件中枢卡片样式）
		const css = ".upd_section{width:100%;max-width:760px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:14px;display:flex}.upd_bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.upd_barInfo{margin:0;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px;flex:1;min-width:0}.upd_btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:8px;height:34px;padding:0 14px;font-size:13px}.upd_btn:hover{border-color:var(--dsw-alias-label-dimmed)}.upd_btn:disabled{opacity:.5;cursor:default}.upd_primary{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-inverse,#fff)}.upd_danger{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary);background:0 0}.upd_notice{margin:0;font-size:13px;line-height:20px}.upd_notice[data-kind=error]{color:var(--dsw-alias-state-error-primary)}.upd_notice[data-kind=success]{color:var(--dsw-alias-state-success-primary)}.upd_heading{display:flex;align-items:baseline;gap:7px;padding:0 2px;margin:0}.upd_heading h3{margin:0;font-size:13px;font-weight:600;line-height:20px}.upd_heading span{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;font-size:12px}.upd_list{margin:0;padding:0;list-style:none;flex-direction:column;gap:8px;display:flex}.upd_row{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:12px;min-width:0}.upd_row[data-updateable=true]{border-color:var(--dsw-alias-state-business-primary)}.upd_main{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.upd_name{font-weight:600;font-size:13px;line-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.upd_meta{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:16px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}.upd_tag{border:1px solid var(--dsw-alias-border-l2);border-radius:4px;padding:0 5px;font-size:11px;line-height:16px}.upd_versions{display:flex;align-items:baseline;gap:8px;white-space:nowrap;font-variant-numeric:tabular-nums;font-size:12px}.upd_current{color:var(--dsw-alias-label-tertiary)}.upd_latest{color:var(--dsw-alias-state-business-primary);font-weight:600}.upd_state{font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}.upd_state[data-kind=update]{color:var(--dsw-alias-state-business-primary);font-weight:600}.upd_actions{display:flex;gap:8px;flex-shrink:0}.upd_restart{display:flex;align-items:center;gap:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:8px;padding:8px 12px;font-size:13px}.upd_restart span{flex:1}.hb_section{width:100%;max-width:760px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:14px;display:flex}.hb_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;padding:12px 14px;flex-direction:column;gap:8px;display:flex;min-width:0}.hb_heading{display:flex;align-items:baseline;gap:7px;padding:0 2px;margin:0}.hb_heading h3{margin:0;font-size:13px;font-weight:600;line-height:20px}.hb_heading span{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;font-size:12px}.hb_info{margin:0;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}.hb_bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.hb_btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:8px;height:34px;padding:0 14px;font-size:13px}.hb_btn:hover{border-color:var(--dsw-alias-label-dimmed)}.hb_btn:disabled{opacity:.5;cursor:default}.hb_primary{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-inverse,#fff)}.hb_ok{color:var(--dsw-alias-state-success-primary);font-size:13px;line-height:20px}.hb_warn{color:var(--dsw-alias-state-warning-primary,var(--dsw-alias-state-error-primary));font-size:13px;line-height:20px}.hb_err{color:var(--dsw-alias-state-error-primary);font-size:13px;line-height:20px}.hb_notice{margin:0;font-size:13px;line-height:20px}.hb_notice[data-kind=error]{color:var(--dsw-alias-state-error-primary)}.hb_notice[data-kind=success]{color:var(--dsw-alias-state-success-primary)}.hb_kv{display:flex;gap:6px;align-items:baseline;font-size:13px;line-height:20px;flex-wrap:wrap}.hb_kv b{font-weight:600}.hb_code{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:6px;padding:2px 8px;font:12px/18px ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--dsw-alias-label-secondary);user-select:all}";
		const tagId = "dsh-hub/hub.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-hub";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		const s = {
			section: "upd_section", bar: "upd_bar", barInfo: "upd_barInfo", btn: "upd_btn",
			primary: "upd_primary", danger: "upd_danger", notice: "upd_notice", heading: "upd_heading",
			list: "upd_list", row: "upd_row", main: "upd_main", name: "upd_name", meta: "upd_meta",
			tag: "upd_tag", versions: "upd_versions", current: "upd_current", latest: "upd_latest",
			state: "upd_state", actions: "upd_actions", restart: "upd_restart",
			card: "hb_card", info: "hb_info", ok: "hb_ok", warn: "hb_warn",
			err: "hb_err", kv: "hb_kv", code: "hb_code"
		};
		const zh = {
			// 插件更新引擎（旧 dsh-plugin-updates keys）
			tab: "插件中枢",
			title: "已安装的插件",
			loading: "正在检查插件更新…",
			lastChecked: "上次检查",
			never: "尚未检查",
			checking: "正在检查…",
			recheck: "重新检查",
			current: "当前",
			latest: "最新",
			update: "更新",
			updating: "更新中…",
			uninstall: "卸载",
			uninstalling: "卸载中…",
			stateUpToDate: "已是最新",
			stateUpdate: "有更新",
			stateGithubUpdate: "GitHub 有新版本",
			stateGithubUpToDate: "已是最新（GitHub）",
			stateLocal: "本地源码，手动更新",
			stateGit: "Git 源，手动更新",
			stateNoRegistry: "registry 上未发布",
			stateSourceMissing: "作者已更改或未找到更新源",
			tagLocal: "本地源码",
			tagGithub: "GitHub",
			tagGit: "Git 源",
			tagBundle: "bundle",
			tagDeveloper: "开发者",
			updateDone: "更新成功：",
			updateFailed: "更新失败：",
			uninstallDone: "已卸载：",
			uninstallFailed: "卸载失败：",
			uninstallConfirm: "确定卸载该插件吗？卸载后需要重启服务才完全生效。",
			githubUpdateConfirm: "将从国内镜像自动下载新版本并覆盖本地源码（会丢弃本地未提交的改动）。确定更新吗？",
			openGithub: "GitHub",
			desktopTitle: "DSH Desktop 客户端",
			desktopSummary: "内置核心包：",
			desktopClientLatest: "客户端最新版本",
			desktopClientUpToDate: "客户端已是最新",
			desktopClientSource: "来源",
			desktopOpenGitee: "打开 Gitee 发布页",
			desktopOpenGithub: "打开 GitHub 发布页",
			assetPluginsTitle: "客户端插件",
			assetPluginsSummary: "客户端内置插件：",
			checkFailed: "检查更新失败：",
			restartHint: "更新/卸载将在服务重启后生效。",
			restartManual: "未检测到客户端重启接口，请手动重启 DSH 服务（终端里重启 dsh，或重启 DSH Desktop）。",
			restartConfirm: "重启会中断当前正在运行的会话（历史记录保留）。确定现在重启服务吗？",
			restartNow: "立即重启服务",
			empty: "当前 profile 没有从依赖安装的插件。",
			filterAll: "全部",
			filterNpm: "npm",
			filterGithub: "GitHub",
			filterLocal: "本地源码",
			filterGit: "Git 源",
			filterClient: "客户端",
			showDescription: "说明",
			hideDescription: "收起说明",
			noDescription: "（没有说明）",
			enable: "启用",
			disable: "停用",
			enabling: "启用中…",
			disabling: "停用中…",
			enableDone: "已启用：",
			disableDone: "已停用：",
			enableFailed: "启用失败：",
			disableFailed: "停用失败：",
			disabledTag: "已停用",
			repairTitle: "启动自检已修复：",
			updateAll: "全部更新",
			updateAllDone: "批量更新完成：",
			updateAllConfirm: "确定依次更新所有有新版本的插件（含客户端插件）吗？（覆盖源码的会逐个再确认）",
			// 插件中枢卡片（dsh-hub keys；与引擎冲突的 key 用 hub* 前缀）
			hubTitle: "dsh-hub 插件中枢",
			hubLoading: "正在读取状态…",
			hubRestartHint: "装配/更新将在 DSH 服务重启后生效。",
			hubRestartNow: "立即重启服务",
			hubRestartManual: "未检测到客户端重启接口，请手动重启 DSH。",
			loadFailed: "读取状态失败：",
			memoryTitle: "全局记忆",
			memoryDesc: "5 个 memory_* 工具（memory_save / memory_search / memory_list / memory_get / memory_delete），所有会话共享。",
			memoryRecords: "记忆条数",
			memoryFile: "数据文件",
			gmTitle: "graph-memory（记忆图谱）",
			gmSourceMissing: "未在 plugin-src 找到 graph-memory 源码",
			gmSourceBundled: "内置",
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
			zatEngineTitle: "zat-dsh-engine（插件市场引擎）",
			zatEngineInstalled: "已安装",
			zatEngineNotInstalled: "未安装",
			zatEngineRemind: "未检测到 zat-dsh-engine（插件市场引擎）。安装后可自动下载与安装社区插件。安装命令：",
			zatEngineOpenRepo: "打开仓库",
			zatEngineGoMarket: "已安装：插件市场引擎已就绪。",
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
			selfUpdate: "更新到最新",
			selfUpdating: "更新中…",
			selfUpdateDone: "已更新到 v{0}，重启 DSH 后生效。",
			selfUpdateFailed: "更新失败：",
			selfUpdateRestart: "已是最新版本。"
		};
		const en = {
			// Plugin update engine (legacy dsh-plugin-updates keys)
			tab: "Plugin hub",
			title: "Installed plugins",
			loading: "Checking plugin updates…",
			lastChecked: "Last checked",
			never: "Not checked yet",
			checking: "Checking…",
			recheck: "Check again",
			current: "current",
			latest: "latest",
			update: "Update",
			updating: "Updating…",
			uninstall: "Uninstall",
			uninstalling: "Uninstalling…",
			stateUpToDate: "Up to date",
			stateUpdate: "Update available",
			stateGithubUpdate: "New version on GitHub",
			stateGithubUpToDate: "Up to date (GitHub)",
			stateLocal: "Local source, update manually",
			stateGit: "Git source, update manually",
			stateNoRegistry: "Not published on registry",
			stateSourceMissing: "Source changed or not found",
			tagLocal: "local",
			tagGithub: "GitHub",
			tagGit: "git",
			tagBundle: "bundle",
			tagDeveloper: "Developer",
			updateDone: "Updated: ",
			updateFailed: "Update failed: ",
			uninstallDone: "Uninstalled: ",
			uninstallFailed: "Uninstall failed: ",
			uninstallConfirm: "Uninstall this plugin? A service restart is needed to fully apply.",
			githubUpdateConfirm: "Download the new version from a China mirror and overwrite local source? Uncommitted local changes will be lost.",
			openGithub: "GitHub",
			desktopTitle: "DSH Desktop client",
			desktopSummary: "Built-in core packages: ",
			desktopClientLatest: "Client latest version",
			desktopClientUpToDate: "Client is up to date",
			desktopClientSource: "Source",
			desktopOpenGitee: "Open Gitee releases",
			desktopOpenGithub: "Open GitHub releases",
			assetPluginsTitle: "Client plugins",
			assetPluginsSummary: "Client built-in plugins: ",
			checkFailed: "Update check failed: ",
			restartHint: "Changes take effect after the service restarts.",
			restartManual: "No client restart bridge detected. Restart the DSH service manually (restart dsh in terminal, or restart DSH Desktop).",
			restartConfirm: "Restarting interrupts the running session (history is kept). Restart the service now?",
			restartNow: "Restart service now",
			empty: "No plugins installed as profile dependencies.",
			filterAll: "All",
			filterNpm: "npm",
			filterGithub: "GitHub",
			filterLocal: "Local",
			filterGit: "Git",
			filterClient: "Client",
			showDescription: "Info",
			hideDescription: "Hide info",
			noDescription: "(no description)",
			enable: "Enable",
			disable: "Disable",
			enabling: "Enabling…",
			disabling: "Disabling…",
			enableDone: "Enabled: ",
			disableDone: "Disabled: ",
			enableFailed: "Enable failed: ",
			disableFailed: "Disable failed: ",
			disabledTag: "Disabled",
			repairTitle: "Startup repair: ",
			updateAll: "Update all",
			updateAllDone: "Batch update done: ",
			updateAllConfirm: "Update all plugins with available updates (client plugins included)? (source-overwriting ones will confirm individually)",
			// Plugin hub cards (dsh-hub keys)
			hubTitle: "dsh-hub",
			hubLoading: "Loading status…",
			hubRestartHint: "Mount/update takes effect after DSH restarts.",
			hubRestartNow: "Restart service now",
			hubRestartManual: "No restart bridge detected; restart DSH manually.",
			loadFailed: "Failed to load status: ",
			memoryTitle: "Global memory",
			memoryDesc: "5 memory_* tools shared across all sessions.",
			memoryRecords: "Records",
			memoryFile: "File",
			gmTitle: "graph-memory",
			gmSourceMissing: "graph-memory source not found in plugin-src",
			gmSourceBundled: "Built-in",
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
			zatEngineTitle: "zat-dsh-engine (plugin market engine)",
			zatEngineInstalled: "Installed",
			zatEngineNotInstalled: "Not installed",
			zatEngineRemind: "zat-dsh-engine (plugin market engine) not detected. Install command:",
			zatEngineOpenRepo: "Open repo",
			zatEngineGoMarket: "Installed: plugin market engine is ready.",
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
			selfUpdate: "Update now",
			selfUpdating: "Updating…",
			selfUpdateDone: "Updated to v{0}. Restart DSH to apply.",
			selfUpdateFailed: "Update failed: ",
			selfUpdateRestart: "Up to date."
		};
		const CACHE_STALE_MS = 12 * 60 * 60 * 1000;
		const NS = "settings.dshHub";
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
				descriptor("checkNow", []),
				descriptor("update", ["name"]),
				descriptor("updateAll", []),
				descriptor("uninstall", ["name"]),
				descriptor("setEnabled", ["name", "enabled"]),
				descriptor("updateAssetPlugin", ["name"]),
				descriptor("mountGraphMemory", []),
				descriptor("checkUpdate", []),
				descriptor("updateSelf", []),
				descriptor("repairNow", [])
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
			if (!ts) return t("never");
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
		function HubCards(props) {
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
				else setNotice({ kind: "error", text: t("hubRestartManual") });
			};
			const doUpdateSelf = () => {
				setBusy((current) => ({ ...current, self: true }));
				setNotice(null);
				props.updateSelf().then((result) => {
					setBusy((current) => { const next = { ...current }; delete next.self; return next; });
					const value = result.ok !== false ? result.value : null;
					if (result.ok === false || value === null) {
						setNotice({ kind: "error", text: t("selfUpdateFailed") + (result.error?.message ?? String(result.error ?? "failed")) });
						return;
					}
					if (value.ok === false) {
						setNotice({ kind: "error", text: t("selfUpdateFailed") + (value.error ?? "failed") });
						return;
					}
					const version = value.version ?? "?";
					setNotice({ kind: "success", text: t("selfUpdateDone").replace("{0}", version) });
					refresh(true);
				}).catch((error) => {
					setBusy((current) => { const next = { ...current }; delete next.self; return next; });
					setNotice({ kind: "error", text: t("selfUpdateFailed") + String(error?.message ?? error) });
				});
			};
			if (state.status === "loading") {
				return (0, react_jsx_runtime.jsx)("div", { className: s.section, children: (0, react_jsx_runtime.jsx)("p", { className: s.info, children: t("hubLoading") }) });
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
			const zatEngine = data.zatEngine || {};
			const update = data.update || {};
			const mountResult = gm.mountResult || null;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: s.section,
				children: [
					(0, react_jsx_runtime.jsxs)("div", { className: s.heading, children: [
						(0, react_jsx_runtime.jsx)("h3", { children: t("hubTitle") }),
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
								? (0, react_jsx_runtime.jsx)("span", { children: (gmSrc.source === "bundled" ? t("gmSourceBundled") : t("gmSourceVersion")) + " " + (gmSrc.version ?? "?") })
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
							(0, react_jsx_runtime.jsx)("p", { className: s.warn, children: t("hubRestartHint") }),
							(0, react_jsx_runtime.jsx)("button", { type: "button", className: s.btn, onClick: doRestart, children: t("hubRestartNow") })
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
  						(0, react_jsx_runtime.jsx)("h3", { children: t("zatEngineTitle") }),
  						(0, react_jsx_runtime.jsx)("span", { children: zatEngine.installed === true ? t("zatEngineInstalled") + (zatEngine.version ? " v" + zatEngine.version : "") : t("zatEngineNotInstalled") })
  					] }),
  					zatEngine.installed === true
  						? (0, react_jsx_runtime.jsx)("p", { className: s.ok, children: "✓ " + t("zatEngineGoMarket") })
  						: (0, react_jsx_runtime.jsxs)("div", { className: s.bar, children: [
  							(0, react_jsx_runtime.jsx)("p", { className: s.warn, children: t("zatEngineRemind") }),
  							(0, react_jsx_runtime.jsx)("span", { className: s.code, children: zatEngine.installHint || "dsh plugin --profile web add zat-dsh-engine" }),
  							(0, react_jsx_runtime.jsx)("button", { type: "button", className: s.btn, onClick: () => window.open(zatEngine.repo || "https://github.com/mishibeikejie/zat-dsh-engine", "_blank", "noopener,noreferrer"), children: t("zatEngineOpenRepo") })
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
								(0, react_jsx_runtime.jsx)("span", { className: s.code, children: "ARFCON/dsh-hub-DSH" })
							] }),
							(0, react_jsx_runtime.jsx)("button", { type: "button", className: s.btn + " " + s.primary, disabled: busy.check === true, onClick: doCheck, children: busy.check === true ? t("selfChecking") : t("selfCheck") })
						] }),
						update.hasUpdate === true
							? (0, react_jsx_runtime.jsxs)("div", { className: s.bar, children: [
								(0, react_jsx_runtime.jsx)("p", { className: s.warn, children: "↑ " + t("selfHasUpdate") }),
								(0, react_jsx_runtime.jsx)("button", { type: "button", className: s.btn + " " + s.primary, disabled: busy.self === true, onClick: doUpdateSelf, children: busy.self === true ? t("selfUpdating") : t("selfUpdate") + " v" + (update.latest ?? "") })
							] })
							: update.error !== null && update.error !== undefined && update.error !== ""
								? (0, react_jsx_runtime.jsx)("p", { className: s.err, children: t("selfCheckFailed") + update.error })
								: update.checkedAt > 0 ? (0, react_jsx_runtime.jsx)("p", { className: s.ok, children: "✓ " + t("selfUpToDate") }) : null
					] })
				]
			});
		}
		function UpdatesSection(props) {
			const t = props.t;
			const [state, setState] = react.useState({ status: "loading", entries: [], desktop: null, desktopPlugins: null, checkedAt: null, checking: false, error: null, filters: [], expandedDesc: null, repair: null });
			const [busy, setBusy] = react.useState({});
			const [updatingAll, setUpdatingAll] = react.useState(false);
			const [notice, setNotice] = react.useState(null);
			const [restart, setRestart] = react.useState({ needed: false, available: false });
			react.useEffect(() => {
				const bridge = typeof window !== "undefined" ? window.dshDesktop : undefined;
				setRestart((current) => ({ ...current, available: bridge !== undefined && typeof bridge.restartService === "function" }));
			}, []);
			const refresh = react.useCallback((silent) => {
				if (!silent) setState((current) => ({ ...current, checking: true, error: null }));
				props.checkNow().then((result) => {
					const snapshot = unwrap(result);
					setState((current) => ({
						...current,
						status: "ready",
						entries: Array.isArray(snapshot.entries) ? snapshot.entries : [],
						desktop: snapshot.desktop ?? null,
						desktopPlugins: snapshot.desktopPlugins ?? null,
						checkedAt: snapshot.checkedAt ?? null,
						checking: false,
						error: snapshot.error ?? null
					}));
				}).catch((error) => {
					setState((current) => ({ ...current, checking: false, error: String(error?.message ?? error) }));
				});
			}, [props.checkNow]);
			react.useEffect(() => {
				let alive = true;
				let pollTimer = null;
				const applyStatus = (snapshot) => setState((current) => ({
					...current,
					status: "ready",
					entries: Array.isArray(snapshot.entries) ? snapshot.entries : [],
					desktop: snapshot.desktop ?? null,
					desktopPlugins: snapshot.desktopPlugins ?? null,
					checkedAt: snapshot.checkedAt ?? null,
					checking: snapshot.checking === true,
					repair: snapshot.repair ?? null
				}));
				// 宿主后台检查进行中时轮询，完成后自动把最新结果显示到页面
				const pollUntilDone = () => {
					if (pollTimer !== null) return;
					pollTimer = setInterval(() => {
						props.status().then((result) => {
							if (!alive) return;
							const snapshot = unwrap(result);
							applyStatus(snapshot);
							if (snapshot.checking !== true && pollTimer !== null) {
								clearInterval(pollTimer);
								pollTimer = null;
							}
						}).catch(() => {});
					}, 2500);
				};
				props.status().then((result) => {
					if (!alive) return;
					const snapshot = unwrap(result);
					applyStatus(snapshot);
					if (snapshot.checking === true) pollUntilDone();
					// 缓存新鲜（12 小时内）就不重复全量检查；过期/缺失才后台刷新
					const checkedAtMs = Number(snapshot.checkedAt ?? 0);
					if (checkedAtMs === 0 || Date.now() - checkedAtMs > CACHE_STALE_MS) refresh(true);
				}).catch(() => {
					if (alive) {
						setState((current) => ({ ...current, status: "error" }));
						refresh(true);
					}
				});
				return () => {
					alive = false;
					if (pollTimer !== null) clearInterval(pollTimer);
				};
			}, [refresh]);
			const run = (name, verb, call, successPrefix, failPrefix) => {
				setBusy((current) => ({ ...current, [name]: verb }));
				setNotice(null);
				call(name).then((result) => {
					setBusy((current) => { const next = { ...current }; delete next[name]; return next; });
					if (result.ok === false) { setNotice({ kind: "error", text: failPrefix + (result.error?.message ?? String(result.error ?? "failed")) }); return; }
					setNotice({ kind: "success", text: successPrefix + name + (result.value?.version ? " v" + result.value.version : "") });
					setRestart((current) => ({ ...current, needed: true }));
					refresh(true);
				}, (error) => {
					setBusy((current) => { const next = { ...current }; delete next[name]; return next; });
					setNotice({ kind: "error", text: failPrefix + String(error?.message ?? error) });
				});
			};
			const doUpdateAll = () => {
			const targets = state.entries.filter((entry) => entry.updateable).map((entry) => ({ name: entry.name, source: entry.source, github: entry.github ?? null, kind: "dep" })).concat((Array.isArray(state.desktopPlugins) ? state.desktopPlugins : []).filter((ap) => ap.updateable).map((ap) => ({ name: ap.name, source: "local", github: ap.github ?? null, kind: "asset" })));
			if (targets.length === 0 || updatingAll) return;
			if (typeof window !== "undefined" && !window.confirm(t("updateAllConfirm"))) return;
			setUpdatingAll(true);
			const results = [];
			let failed = 0;
			(async () => {
				// registry 插件走宿主批量：一条 pnpm add 更新全部（一个进程，快得多）
				const registryTargets = targets.filter((e) => e.kind === "dep" && e.source === "registry");
				const others = targets.filter((e) => !(e.kind === "dep" && e.source === "registry"));
				if (registryTargets.length > 0) {
					for (const e of registryTargets) setBusy((current) => ({ ...current, [e.name]: "updating" }));
					try {
						const result = await props.updateAll();
						const list = result.ok !== false && Array.isArray(result.value?.results) ? result.value.results : null;
						if (list === null) {
							failed += registryTargets.length;
							results.push(t("updateFailed") + (result.error?.message ?? String(result.error ?? "failed")));
						} else if (list.length === 0) {
							results.push(t("stateUpToDate"));
						} else {
							for (const r of list) {
								if (r.ok === false) { failed += 1; results.push(t("updateFailed") + r.name); }
								else { setRestart((current) => ({ ...current, needed: true })); results.push(r.name + (r.version ? " v" + r.version : "")); }
							}
						}
					} catch (error) {
						failed += registryTargets.length;
						results.push(t("updateFailed") + String(error?.message ?? error));
					} finally {
						setBusy((current) => { const next = { ...current }; for (const e of registryTargets) delete next[e.name]; return next; });
					}
				}
				// 本地 GitHub 源 / 客户端插件逐个更新（宿主互斥锁串行）
				for (const entry of others) {
					if ((entry.kind === "asset" || (entry.source === "local" && entry.github !== null)) && typeof window !== "undefined" && !window.confirm(t("githubUpdateConfirm"))) continue;
					setBusy((current) => ({ ...current, [entry.name]: "updating" }));
					try {
						const result = entry.kind === "asset" ? await props.updateAssetPlugin(entry.name) : await props.update(entry.name);
						if (result.ok === false) {
							failed += 1;
							results.push(t("updateFailed") + entry.name);
						} else {
							setRestart((current) => ({ ...current, needed: true }));
							results.push(entry.name + (result.value?.version ? " v" + result.value.version : ""));
						}
					} catch (error) {
						failed += 1;
						results.push(t("updateFailed") + entry.name);
					} finally {
						setBusy((current) => { const next = { ...current }; delete next[entry.name]; return next; });
					}
				}
				setNotice({ kind: failed > 0 ? "error" : "success", text: t("updateAllDone") + results.join("；").slice(0, 600) });
				refresh(true);
			})().finally(() => setUpdatingAll(false));
		};
		const doUpdate = (name) => {
				const entry = state.entries.find((item) => item.name === name);
				if (entry?.source === "local" && entry.github && typeof window !== "undefined") {
					if (!window.confirm(t("githubUpdateConfirm"))) return;
				}
				run(name, "updating", props.update, t("updateDone"), t("updateFailed"));
			};
			const doUninstall = (name) => {
				if (typeof window !== "undefined" && !window.confirm(t("uninstallConfirm"))) return;
				run(name, "uninstalling", props.uninstall, t("uninstallDone"), t("uninstallFailed"));
			};
			const doSetEnabled = (name, enabled) => {
				setBusy((current) => ({ ...current, [name]: "toggle" }));
				setNotice(null);
				props.setEnabled(name, enabled).then((result) => {
					setBusy((current) => { const next = { ...current }; delete next[name]; return next; });
					if (result.ok === false) { setNotice({ kind: "error", text: (enabled ? t("enableFailed") : t("disableFailed")) + (result.error?.message ?? String(result.error ?? "failed")) }); return; }
					setNotice({ kind: "success", text: (enabled ? t("enableDone") : t("disableDone")) + name });
					setRestart((current) => ({ ...current, needed: true }));
					refresh(true);
				}, (error) => {
					setBusy((current) => { const next = { ...current }; delete next[name]; return next; });
					setNotice({ kind: "error", text: (enabled ? t("enableFailed") : t("disableFailed")) + String(error?.message ?? error) });
				});
			};
			const doUpdateAssetPlugin = (name) => {
				if (typeof window !== "undefined" && !window.confirm(t("githubUpdateConfirm"))) return;
				run(name, "updating", props.updateAssetPlugin, t("updateDone"), t("updateFailed"));
			};
			const requestRestart = () => {
				if (typeof window !== "undefined" && window.confirm(t("restartConfirm"))) props.restartService().catch(() => {});
			};
			const updateCount = state.entries.filter((entry) => entry.updateable).length + (Array.isArray(state.desktopPlugins) ? state.desktopPlugins.filter((p) => p.updateable).length : 0);
			const categoryOf = (entry) => {
				if (entry.source === "registry") return "npm";
				if (entry.source === "local" && entry.github) return "github";
				if (entry.source === "local") return "local";
				if (entry.source === "git") return "git";
				return "all";
			};
			const toggleFilter = (key) => {
				setState((current) => {
					const has = current.filters.includes(key);
					const filters = has ? current.filters.filter((f) => f !== key) : [...current.filters, key];
					return { ...current, filters };
				});
			};
			const filteredEntries = state.entries.filter((entry) => {
				if (state.filters.length === 0) return true;
				return state.filters.includes(categoryOf(entry));
			}).slice().sort((a, b) => (b.updateable === true) - (a.updateable === true) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
			return (0, react_jsx_runtime.jsxs)("div", {
				className: s.section,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: s.bar,
						children: [
							(0, react_jsx_runtime.jsx)("p", {
								className: s.barInfo,
								children: t("lastChecked") + "：" + formatTime(state.checkedAt, t) + (state.checking ? "（" + t("checking") + "）" : "") + (updateCount > 0 ? " · " + updateCount + " " + t("stateUpdate") : "")
							}),
							updateCount > 0 ? (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: s.btn + " " + s.primary,
								disabled: updatingAll || state.checking,
								onClick: doUpdateAll,
								children: updatingAll ? t("updating") : t("updateAll") + " (" + updateCount + ")"
							}) : null,
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: s.btn,
								disabled: state.checking,
								onClick: () => refresh(false),
								children: t("recheck")
							})
						]
					}),
					state.error ? (0, react_jsx_runtime.jsx)("p", { className: s.notice, "data-kind": "error", role: "alert", children: t("checkFailed") + state.error }) : null,
					notice !== null ? (0, react_jsx_runtime.jsx)("p", { className: s.notice, "data-kind": notice.kind, role: "status", children: notice.text }) : null,
					state.repair !== null && Array.isArray(state.repair.actions) && state.repair.actions.length > 0 ? (0, react_jsx_runtime.jsx)("p", { className: s.notice, "data-kind": "success", role: "status", children: t("repairTitle") + state.repair.actions.join("；") }) : null,
					restart.needed ? (0, react_jsx_runtime.jsxs)("div", {
						className: s.restart,
						role: "status",
						children: [
							(0, react_jsx_runtime.jsx)("span", { children: t("restartHint") + (restart.available ? "" : " " + t("restartManual")) }),
							restart.available ? (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: s.btn,
								onClick: requestRestart,
								children: t("restartNow")
							}) : null
						]
					}) : null,
					(0, react_jsx_runtime.jsxs)("div", {
						className: s.heading,
						children: [
							(0, react_jsx_runtime.jsx)("h3", { children: t("title") }),
							(0, react_jsx_runtime.jsx)("span", { children: filteredEntries.length })
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: s.bar,
						children: [
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: s.btn + (state.filters.length === 0 ? " " + s.primary : ""),
								onClick: () => setState((current) => ({ ...current, filters: [] })),
								children: t("filterAll")
							}),
							["npm", "github", "local", "git", "client"].map((key) => (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: s.btn + (state.filters.includes(key) ? " " + s.primary : ""),
								onClick: () => toggleFilter(key),
								children: t("filter" + key.charAt(0).toUpperCase() + key.slice(1))
							}, key))
						]
					}),
					state.status === "loading" && state.entries.length === 0 ? (0, react_jsx_runtime.jsx)("p", { className: s.barInfo, children: t("loading") }) : null,
					state.entries.length === 0 && state.status !== "loading" ? (0, react_jsx_runtime.jsx)("p", { className: s.barInfo, children: t("empty") }) : null,
					filteredEntries.length > 0 ? (0, react_jsx_runtime.jsx)("ul", {
						className: s.list,
						children: filteredEntries.map((entry) => {
							const github = entry.source === "local" && entry.github ? entry.github : null;
							const upToDate = entry.source === "registry" && entry.latest !== null && !entry.updateable;
							const githubUpToDate = github !== null && github.latestTag !== null && !entry.updateable;
							const stateText = !entry.enabled ? t("disabledTag")
								: entry.updateable ? (github !== null ? t("stateGithubUpdate") : t("stateUpdate"))
								: githubUpToDate ? t("stateGithubUpToDate")
								: entry.source === "local" ? t("stateLocal")
								: entry.source === "git" ? t("stateGit")
								: upToDate ? t("stateUpToDate") : t("stateNoRegistry");
							const openUpdateUrl = () => {
								if (github !== null && typeof github.updateUrl === "string" && github.updateUrl !== "") {
									window.open(github.updateUrl, "_blank", "noopener,noreferrer");
								}
							};
							return (0, react_jsx_runtime.jsxs)("li", {
								className: s.row,
								"data-updateable": entry.updateable ? "true" : "false",
								"data-plugin-name": entry.name,
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: s.main,
										children: [
											(0, react_jsx_runtime.jsx)("span", { className: s.name, title: entry.name, children: entry.name }),
											(0, react_jsx_runtime.jsxs)("span", {
												className: s.meta,
												children: [
													entry.source === "local" ? (0, react_jsx_runtime.jsx)("span", { className: s.tag, children: github !== null ? t("tagGithub") : t("tagLocal") }) : null,
													entry.source === "git" ? (0, react_jsx_runtime.jsx)("span", { className: s.tag, children: t("tagGit") }) : null,
													entry.isBundle ? (0, react_jsx_runtime.jsx)("span", { className: s.tag, children: t("tagBundle") }) : null,
													entry.isDeveloper ? (0, react_jsx_runtime.jsx)("span", { className: s.tag, children: t("tagDeveloper") }) : null,
													(0, react_jsx_runtime.jsxs)("span", {
														className: s.versions,
														children: [
															(0, react_jsx_runtime.jsx)("span", { className: s.current, children: t("current") + " v" + (entry.current || "?") }),
															entry.latest !== null ? (0, react_jsx_runtime.jsx)("span", { className: s.latest, children: github !== null ? "GitHub " + entry.latest : t("latest") + " v" + entry.latest }) : null
														]
													})
												]
											}),
											state.expandedDesc === entry.name ? (0, react_jsx_runtime.jsxs)("span", {
												className: s.meta,
												"data-description": "true",
												children: [
													(0, react_jsx_runtime.jsx)("span", { children: entry.description || t("noDescription") }),
													github !== null ? (0, react_jsx_runtime.jsx)("a", {
														className: s.btn,
														href: github.htmlUrl,
														target: "_blank",
														rel: "noreferrer noopener",
														children: t("openGithub")
													}) : null
												]
											}) : null
										]
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: s.state,
										"data-kind": entry.updateable ? "update" : "plain",
										children: stateText
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: s.actions,
										children: [
											(0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: s.btn,
												onClick: () => setState((current) => ({ ...current, expandedDesc: current.expandedDesc === entry.name ? null : entry.name })),
												children: state.expandedDesc === entry.name ? t("hideDescription") : t("showDescription")
											}),
											entry.entryId ? (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: s.btn,
												disabled: busy[entry.name] !== undefined,
												onClick: () => doSetEnabled(entry.name, !entry.enabled),
												children: busy[entry.name] === "toggle" ? (entry.enabled ? t("disabling") : t("enabling")) : (entry.enabled ? t("disable") : t("enable"))
											}) : null,
											entry.updateable ? (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: s.btn + " " + s.primary,
												disabled: busy[entry.name] !== undefined,
												onClick: () => doUpdate(entry.name),
												children: busy[entry.name] === "updating" ? t("updating") : t("update")
											}) : null,
											github !== null ? (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: s.btn,
												onClick: openUpdateUrl,
												children: t("openGithub")
											}) : null,
											(0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: s.btn + " " + s.danger,
												disabled: busy[entry.name] !== undefined,
												onClick: () => doUninstall(entry.name),
												children: busy[entry.name] === "uninstalling" ? t("uninstalling") : t("uninstall")
											})
										]
									})
								]
							}, entry.name);
						})
					}) : null,
					state.desktop !== null && state.desktop !== undefined ? (0, react_jsx_runtime.jsxs)("div", {
						className: s.section,
						"data-desktop-block": "true",
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: s.heading,
								children: [
									(0, react_jsx_runtime.jsx)("h3", { children: t("desktopTitle") }),
									(0, react_jsx_runtime.jsx)("span", { children: "v" + (state.desktop.appVersion || "?") })
								]
							}),
							(0, react_jsx_runtime.jsx)("p", {
								className: s.barInfo,
								children: t("desktopSummary") + " " + state.desktop.packages.length + " · " + state.desktop.packages.filter((p) => p.updateable).length + " " + t("stateUpdate")
							}),
							state.desktop.clientUpdate ? (0, react_jsx_runtime.jsxs)("p", {
								className: s.barInfo,
								"data-client-update": "true",
								children: [
									(0, react_jsx_runtime.jsx)("span", { children: t("desktopClientLatest") + " v" + state.desktop.clientUpdate.latest + " (" + t("desktopClientSource") + ": " + state.desktop.clientUpdate.source + ")" }),
									state.desktop.clientUpdate.updateable ? (0, react_jsx_runtime.jsx)("a", {
										className: s.btn,
										href: state.desktop.clientUpdate.htmlUrl || (state.desktop.clientUpdate.source === "gitee" ? "https://gitee.com/my-yang-yunfan/dsh_desktop/releases" : "https://github.com/myYangyunfan/dsh_desktop/releases"),
										target: "_blank",
										rel: "noreferrer",
										children: state.desktop.clientUpdate.source === "gitee" ? t("desktopOpenGitee") : t("desktopOpenGithub")
									}) : (0, react_jsx_runtime.jsx)("span", { children: t("desktopClientUpToDate") })
								]
							}) : null,
							state.desktop.packages.length > 0 ? (0, react_jsx_runtime.jsx)("ul", {
								className: s.list,
								children: state.desktop.packages.map((pkg) => {
									const pkgUpToDate = pkg.latest !== null && !pkg.updateable;
									const pkgState = pkg.updateable ? t("stateUpdate") : pkgUpToDate ? t("stateUpToDate") : t("stateNoRegistry");
									return (0, react_jsx_runtime.jsxs)("li", {
										className: s.row,
										"data-desktop-package": pkg.name,
										children: [
											(0, react_jsx_runtime.jsxs)("div", {
												className: s.main,
												children: [
													(0, react_jsx_runtime.jsx)("span", { className: s.name, title: pkg.name, children: pkg.name }),
													(0, react_jsx_runtime.jsxs)("span", {
														className: s.versions,
														children: [
															(0, react_jsx_runtime.jsx)("span", { className: s.current, children: t("current") + " v" + (pkg.current || "?") }),
															pkg.latest !== null ? (0, react_jsx_runtime.jsx)("span", { className: s.latest, children: t("latest") + " v" + pkg.latest }) : null
														]
													})
												]
											}),
											(0, react_jsx_runtime.jsx)("span", {
												className: s.state,
												"data-kind": pkg.updateable ? "update" : "plain",
												children: pkgState
											})
										]
									}, pkg.name);
								})
							}) : null
						]
					}) : null,
					state.desktopPlugins !== null && state.desktopPlugins !== undefined && (state.filters.length === 0 || state.filters.includes("client")) ? (0, react_jsx_runtime.jsxs)("div", {
						className: s.section,
						"data-asset-plugins-block": "true",
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: s.heading,
								children: [
									(0, react_jsx_runtime.jsx)("h3", { children: t("assetPluginsTitle") }),
									(0, react_jsx_runtime.jsx)("span", { children: state.desktopPlugins.length })
								]
							}),
							(0, react_jsx_runtime.jsx)("p", {
								className: s.barInfo,
								children: t("assetPluginsSummary") + " " + state.desktopPlugins.filter((p) => p.updateable).length + " " + t("stateUpdate")
							}),
							state.desktopPlugins.length > 0 ? (0, react_jsx_runtime.jsx)("ul", {
								className: s.list,
								children: state.desktopPlugins.map((ap) => {
									const gh = ap.github;
									const apState = ap.updateable ? t("stateUpdate") : ap.latest ? t("stateUpToDate") : (gh !== null && gh !== undefined ? t("stateSourceMissing") : t("stateNoRegistry"));
									return (0, react_jsx_runtime.jsxs)("li", {
										className: s.row,
										"data-asset-plugin": ap.name,
										children: [
											(0, react_jsx_runtime.jsxs)("div", {
												className: s.main,
												children: [
													(0, react_jsx_runtime.jsx)("span", { className: s.name, title: ap.name, children: ap.name }),
													(0, react_jsx_runtime.jsxs)("span", {
														className: s.meta,
														children: [
															gh !== null && gh !== undefined ? (0, react_jsx_runtime.jsx)("span", { className: s.tag, children: t("tagGithub") }) : null,
															(0, react_jsx_runtime.jsxs)("span", {
																className: s.versions,
																children: [
																	(0, react_jsx_runtime.jsx)("span", { className: s.current, children: t("current") + " v" + (ap.current || "?") }),
																	ap.latest ? (0, react_jsx_runtime.jsx)("span", { className: s.latest, children: (gh !== null && gh !== undefined ? "GitHub " : t("latest") + " ") + "v" + ap.latest }) : null
																]
															})
														]
													})
												]
											}),
											(0, react_jsx_runtime.jsx)("span", {
												className: s.state,
												"data-kind": ap.updateable ? "update" : "plain",
												children: apState
											}),
											(0, react_jsx_runtime.jsxs)("div", {
												className: s.actions,
												children: [
													ap.updateable ? (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: s.btn + " " + s.primary,
														disabled: busy[ap.name] !== undefined,
														onClick: () => doUpdateAssetPlugin(ap.name),
														children: busy[ap.name] === "updating" ? t("updating") : t("update")
													}) : null,
													gh !== null && gh !== undefined ? (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: s.btn,
														onClick: () => window.open(gh.htmlUrl, "_blank", "noopener,noreferrer"),
														children: t("openGithub")
													}) : null
												]
											})
										]
									}, ap.name);
								})
							}) : null
						]
					}) : null
				]
			});
		}
		function HubTab(props) {
			return (0, react_jsx_runtime.jsxs)("div", { className: s.section, children: [
				(0, react_jsx_runtime.jsx)(HubCards, Object.assign({}, props)),
				(0, react_jsx_runtime.jsx)(UpdatesSection, Object.assign({}, props))
			] });
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
				checkNow: () => remote().then((face) => face.checkNow()),
				update: (name) => remote().then((face) => face.update(name)),
				updateAll: () => remote().then((face) => face.updateAll()),
				uninstall: (name) => remote().then((face) => face.uninstall(name)),
				setEnabled: (name, enabled) => remote().then((face) => face.setEnabled(name, enabled)),
				updateAssetPlugin: (name) => remote().then((face) => face.updateAssetPlugin(name)),
				mountGraphMemory: () => remote().then((face) => face.mountGraphMemory()),
				checkUpdate: () => remote().then((face) => face.checkUpdate()),
				updateSelf: () => remote().then((face) => face.updateSelf()),
				repairNow: () => remote().then((face) => face.repairNow()),
				restartService: () => {
					const bridge = typeof window !== "undefined" ? window.dshDesktop : undefined;
					if (bridge !== undefined && typeof bridge.restartService === "function") return bridge.restartService();
					return Promise.resolve({ available: false });
				}
			});
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				name: "settings.plugins.tab",
				id: "dsh-hub",
				order: 30,
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
