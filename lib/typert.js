/**
 * dsh-hub — Typert host manifest（./typert）。
 *
 * Host 侧 typert-loader 会扫描已加载插件，导入本文件的 TYPERT 对象并注册为
 * 严格 Remote 定义。网关按 strict 定义路由 RPC。与内置
 * @deepseek-ai/dsh-host-plugin-inventory 的 ./typert 产物同构。
 *
 * 维护铁律：新增 Remote 方法必须同步三处——本文件 invocations、
 * lib/index.js 的 HubGateway methods 列表、lib/client.js 的 REMOTE.descriptors。
 * 本文件不可删除（否则 RPC 404）。
 */
import { z } from 'zod'

const JSON_CODEC = (typeSymbol) => ({
  mode: 'strict',
  typeSymbol,
  schema: z.unknown()
})

const inv = (method, parameters = []) => ({
  id: `dsh-hub#dshHub/${method}`,
  service: 'dshHub',
  namespace: 'dshHub',
  method,
  invocation: { kind: 'direct' },
  parameters: parameters.map((name) => ({ name, wire: name, source: 'json', codec: JSON_CODEC('dsh-hub/types#Json') })),
  result: JSON_CODEC('dsh-hub/types#Json')
})

export const TYPERT = {
  package: 'dsh-hub',
  face: 'host',
  schemas: [],
  invocations: [
    inv('status'),
    inv('checkNow'),
    inv('update', ['name']),
    inv('updateAll'),
    inv('uninstall', ['name']),
    inv('setEnabled', ['name', 'enabled']),
    inv('updateAssetPlugin', ['name']),
    inv('checkUpdate'),
    inv('updateSelf'),
    inv('repairNow')
  ],
  model: {
    services: [],
    events: [],
    objects: []
  }
}
