/**
 * dsh-hub — Typert host manifest（./typert）。
 *
 * Host 侧 typert-loader 会扫描已加载插件，导入本文件的 TYPERT 对象并注册为
 * 严格 Remote 定义。网关按 strict 定义路由 RPC。与内置
 * @deepseek-ai/dsh-host-plugin-inventory 的 ./typert 产物同构。
 *
 * 维护铁律：新增 Remote 方法必须同步三处——本文件 invocations、
 * lib/index.js 的 HubGateway methods 列表、lib/client.js 的 REMOTE.descriptors。
 */
import { z } from 'zod'

const JSON_CODEC = (typeSymbol) => ({
  mode: 'strict',
  typeSymbol,
  schema: z.unknown()
})

export const TYPERT = {
  package: 'dsh-hub',
  face: 'host',
  schemas: [],
  invocations: [
    {
      id: 'dsh-hub#dshHub/status',
      service: 'dshHub',
      namespace: 'dshHub',
      method: 'status',
      invocation: { kind: 'direct' },
      parameters: [],
      result: JSON_CODEC('dsh-hub/types#StatusResult')
    },
    {
      id: 'dsh-hub#dshHub/mountGraphMemory',
      service: 'dshHub',
      namespace: 'dshHub',
      method: 'mountGraphMemory',
      invocation: { kind: 'direct' },
      parameters: [],
      result: JSON_CODEC('dsh-hub/types#MountResult')
    },
    {
      id: 'dsh-hub#dshHub/checkUpdate',
      service: 'dshHub',
      namespace: 'dshHub',
      method: 'checkUpdate',
      invocation: { kind: 'direct' },
      parameters: [],
      result: JSON_CODEC('dsh-hub/types#UpdateResult')
    }
  ],
  model: {
    services: [],
    events: [],
    objects: []
  }
}
