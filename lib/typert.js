/**
 * dsh-plugin-updates — Typert host manifest（./typert）。
 *
 * Host 侧 typert-loader 会扫描已加载插件，导入本文件的 TYPERT 对象并注册为
 * 严格 Remote 定义。网关按 strict 定义路由 RPC（避免动态第三方插件走 SRC
 * 回退时不可见的问题）。与内置 @deepseek-ai/dsh-host-plugin-inventory 的
 * ./typert 产物同构。
 */
import { z } from 'zod'

const JSON_CODEC = (typeSymbol) => ({
  mode: 'strict',
  typeSymbol,
  schema: z.unknown()
})

const NAME_CODEC = {
  mode: 'strict',
  typeSymbol: 'dsh-plugin-updates/types#PackageName',
  schema: z.string()
}

export const TYPERT = {
  package: 'dsh-plugin-updates',
  face: 'host',
  schemas: [],
  invocations: [
    {
      id: 'dsh-plugin-updates#pluginUpdates/status',
      service: 'pluginUpdates',
      namespace: 'pluginUpdates',
      method: 'status',
      invocation: { kind: 'direct' },
      parameters: [],
      result: JSON_CODEC('dsh-plugin-updates/types#StatusResult')
    },
    {
      id: 'dsh-plugin-updates#pluginUpdates/checkNow',
      service: 'pluginUpdates',
      namespace: 'pluginUpdates',
      method: 'checkNow',
      invocation: { kind: 'direct' },
      parameters: [],
      result: JSON_CODEC('dsh-plugin-updates/types#CheckNowResult')
    },
    {
      id: 'dsh-plugin-updates#pluginUpdates/update',
      service: 'pluginUpdates',
      namespace: 'pluginUpdates',
      method: 'update',
      invocation: { kind: 'direct' },
      parameters: [
        { name: 'name', wire: 'name', source: 'json', codec: NAME_CODEC }
      ],
      result: JSON_CODEC('dsh-plugin-updates/types#UpdateResult')
    },
    {
      id: 'dsh-plugin-updates#pluginUpdates/uninstall',
      service: 'pluginUpdates',
      namespace: 'pluginUpdates',
      method: 'uninstall',
      invocation: { kind: 'direct' },
      parameters: [
        { name: 'name', wire: 'name', source: 'json', codec: NAME_CODEC }
      ],
      result: JSON_CODEC('dsh-plugin-updates/types#UninstallResult')
    }
  ],
  model: {
    services: [],
    events: [],
    objects: []
  }
}
