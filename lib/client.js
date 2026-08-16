window.__ModuleLoader__.load({
	id: "dsh-plugin-updates",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region updates css
		const css = ".upd_section{width:100%;max-width:760px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:14px;display:flex}.upd_bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.upd_barInfo{margin:0;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px;flex:1;min-width:0}.upd_btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:8px;height:34px;padding:0 14px;font-size:13px}.upd_btn:hover{border-color:var(--dsw-alias-label-dimmed)}.upd_btn:disabled{opacity:.5;cursor:default}.upd_primary{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-inverse,#fff)}.upd_danger{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary);background:0 0}.upd_notice{margin:0;font-size:13px;line-height:20px}.upd_notice[data-kind=error]{color:var(--dsw-alias-state-error-primary)}.upd_notice[data-kind=success]{color:var(--dsw-alias-state-success-primary)}.upd_heading{display:flex;align-items:baseline;gap:7px;padding:0 2px;margin:0}.upd_heading h3{margin:0;font-size:13px;font-weight:600;line-height:20px}.upd_heading span{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;font-size:12px}.upd_list{margin:0;padding:0;list-style:none;flex-direction:column;gap:8px;display:flex}.upd_row{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:12px;min-width:0}.upd_row[data-updateable=true]{border-color:var(--dsw-alias-state-business-primary)}.upd_main{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.upd_name{font-weight:600;font-size:13px;line-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.upd_meta{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:16px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}.upd_tag{border:1px solid var(--dsw-alias-border-l2);border-radius:4px;padding:0 5px;font-size:11px;line-height:16px}.upd_versions{display:flex;align-items:baseline;gap:8px;white-space:nowrap;font-variant-numeric:tabular-nums;font-size:12px}.upd_current{color:var(--dsw-alias-label-tertiary)}.upd_latest{color:var(--dsw-alias-state-business-primary);font-weight:600}.upd_state{font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}.upd_state[data-kind=update]{color:var(--dsw-alias-state-business-primary);font-weight:600}.upd_actions{display:flex;gap:8px;flex-shrink:0}.upd_restart{display:flex;align-items:center;gap:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:8px;padding:8px 12px;font-size:13px}.upd_restart span{flex:1}";
		const tagId = "dsh-plugin-updates/updates.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-plugin-updates";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		const s = {
			section: "upd_section", bar: "upd_bar", barInfo: "upd_barInfo", btn: "upd_btn",
			primary: "upd_primary", danger: "upd_danger", notice: "upd_notice", heading: "upd_heading",
			list: "upd_list", row: "upd_row", main: "upd_main", name: "upd_name", meta: "upd_meta",
			tag: "upd_tag", versions: "upd_versions", current: "upd_current", latest: "upd_latest",
			state: "upd_state", actions: "upd_actions", restart: "upd_restart"
		};
		//#endregion
		//#region locales
		const zh = {
			tab: "插件更新",
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
			tagLocal: "本地源码",
			tagGithub: "GitHub",
			tagGit: "Git 源",
			tagBundle: "bundle",
			updateDone: "更新成功：",
			updateFailed: "更新失败：",
			uninstallDone: "已卸载：",
			uninstallFailed: "卸载失败：",
			uninstallConfirm: "确定卸载该插件吗？卸载后需要重启服务才完全生效。",
			githubUpdateConfirm: "将从国内镜像自动下载新版本并覆盖本地源码（会丢弃本地未提交的改动）。确定更新吗？",
			openGithub: "GitHub",
			desktopTitle: "DSH Desktop 客户端",
			desktopSummary: "内置核心包：",
			checkFailed: "检查更新失败：",
			restartHint: "更新/卸载将在服务重启后生效。",
			restartConfirm: "重启会中断当前正在运行的会话（历史记录保留）。确定现在重启服务吗？",
			restartNow: "立即重启服务",
			empty: "当前 profile 没有从依赖安装的插件。"
		};
		const en = {
			tab: "Plugin updates",
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
			tagLocal: "local",
			tagGithub: "GitHub",
			tagGit: "git",
			tagBundle: "bundle",
			updateDone: "Updated: ",
			updateFailed: "Update failed: ",
			uninstallDone: "Uninstalled: ",
			uninstallFailed: "Uninstall failed: ",
			uninstallConfirm: "Uninstall this plugin? A service restart is needed to fully apply.",
			githubUpdateConfirm: "Download the new version from a China mirror and overwrite local source? Uncommitted local changes will be lost.",
			openGithub: "GitHub",
			desktopTitle: "DSH Desktop client",
			desktopSummary: "Built-in core packages: ",
			checkFailed: "Update check failed: ",
			restartHint: "Changes take effect after the service restarts.",
			restartConfirm: "Restarting interrupts the running session (history is kept). Restart the service now?",
			restartNow: "Restart service now",
			empty: "No plugins installed as profile dependencies."
		};
		const NS = "settings.pluginUpdates";
		//#endregion
		//#region remote face
		const looseCodec = () => ({
			mode: "strict",
			typeSymbol: "dsh-plugin-updates/types#Json",
			schema: { parse: (value) => value }
		});
		const descriptor = (method, parameters) => ({
			id: `dsh-plugin-updates#pluginUpdates/${method}`,
			service: "pluginUpdates",
			namespace: "pluginUpdates",
			method,
			invocation: { kind: "direct" },
			parameters: parameters.map((name) => ({ name, wire: name, source: "json", codec: looseCodec() })),
			result: looseCodec()
		});
		const REMOTE = {
			package: "dsh-plugin-updates",
			descriptors: [
				descriptor("status", []),
				descriptor("checkNow", []),
				descriptor("update", ["name"]),
				descriptor("uninstall", ["name"])
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
		function UpdatesTab(props) {
			const t = props.t;
			const [state, setState] = react.useState({ status: "loading", entries: [], desktop: null, checkedAt: null, checking: false, error: null });
			const [busy, setBusy] = react.useState({});
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
						status: "ready",
						entries: Array.isArray(snapshot.entries) ? snapshot.entries : [],
						desktop: snapshot.desktop ?? null,
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
				props.status().then((result) => {
					if (!alive) return;
					const snapshot = unwrap(result);
					setState((current) => ({
						...current,
						status: "ready",
						entries: Array.isArray(snapshot.entries) ? snapshot.entries : [],
						desktop: snapshot.desktop ?? null,
						checkedAt: snapshot.checkedAt ?? null,
						checking: snapshot.checking === true
					}));
				}).catch(() => {
					if (alive) setState((current) => ({ ...current, status: "error" }));
				});
				refresh(true);
				return () => { alive = false; };
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
			const requestRestart = () => {
				if (typeof window !== "undefined" && window.confirm(t("restartConfirm"))) props.restartService().catch(() => {});
			};
			const updateCount = state.entries.filter((entry) => entry.updateable).length;
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
					restart.needed ? (0, react_jsx_runtime.jsxs)("div", {
						className: s.restart,
						role: "status",
						children: [
							(0, react_jsx_runtime.jsx)("span", { children: t("restartHint") }),
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
							(0, react_jsx_runtime.jsx)("span", { children: state.entries.length })
						]
					}),
					state.status === "loading" && state.entries.length === 0 ? (0, react_jsx_runtime.jsx)("p", { className: s.barInfo, children: t("loading") }) : null,
					state.entries.length === 0 && state.status !== "loading" ? (0, react_jsx_runtime.jsx)("p", { className: s.barInfo, children: t("empty") }) : null,
					state.entries.length > 0 ? (0, react_jsx_runtime.jsx)("ul", {
						className: s.list,
						children: state.entries.map((entry) => {
							const github = entry.source === "local" && entry.github ? entry.github : null;
							const upToDate = entry.source === "registry" && entry.latest !== null && !entry.updateable;
							const githubUpToDate = github !== null && github.latestTag !== null && !entry.updateable;
							const stateText = entry.updateable ? (github !== null ? t("stateGithubUpdate") : t("stateUpdate"))
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
													(0, react_jsx_runtime.jsxs)("span", {
														className: s.versions,
														children: [
															(0, react_jsx_runtime.jsx)("span", { className: s.current, children: t("current") + " v" + (entry.current || "?") }),
															entry.latest !== null ? (0, react_jsx_runtime.jsx)("span", { className: s.latest, children: github !== null ? "GitHub " + entry.latest : t("latest") + " v" + entry.latest }) : null
														]
													})
												]
											})
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
					}) : null
				]
			});
		}
		//#endregion
		//#region client index
		const inject = ["slots", "locale", "remote"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-plugin-updates: dictionaries");
			const t = ctx.locale.bind(NS);
			let mountFailure = null;
			const mountPromise = ctx.remote.$mount(REMOTE).then((dispose) => {
				ctx.effect(() => dispose, "dsh-plugin-updates: remote face");
				return true;
			}, (error) => {
				mountFailure = String((error && error.message) || error);
				console.error("dsh-plugin-updates: remote face mount failed", error);
				return false;
			});
			/** 解析挂载后的 host 服务（与内置插件市场同一模式）。 */
			const remote = async () => {
				await mountPromise;
				if (mountFailure !== null) throw new Error("pluginUpdates 远程接口未就绪: " + mountFailure);
				const service = ctx.get("remote.pluginUpdates");
				if (service === void 0 || service === null || typeof service !== "object") {
					await new Promise((resolve) => setTimeout(resolve, 50));
					const retry = ctx.get("remote.pluginUpdates");
					if (retry === void 0 || retry === null || typeof retry !== "object") throw new Error("pluginUpdates 远程接口未注册");
					return retry;
				}
				return service;
			};
			const injected = () => ({
				status: () => remote().then((face) => face.status()),
				checkNow: () => remote().then((face) => face.checkNow()),
				update: (name) => remote().then((face) => face.update(name)),
				uninstall: (name) => remote().then((face) => face.uninstall(name)),
				restartService: () => {
					const bridge = typeof window !== "undefined" ? window.dshDesktop : undefined;
					if (bridge !== undefined && typeof bridge.restartService === "function") return bridge.restartService();
					return Promise.resolve({ available: false });
				}
			});
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				name: "settings.plugins.tab",
				id: "updates",
				order: 30,
				label: () => t("tab"),
				locale: NS,
				inject: injected
			}, UpdatesTab));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
