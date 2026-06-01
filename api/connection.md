# 连接管理

连接管理模块封装了微信小程序原生 `wx.xxx` 蓝牙 API，提供从适配器初始化到设备连接的完整流程。

## 连接流程图

```
openAdapter → startScan → (发现设备) → stopScan → connect → discoverServices → enableNotify → 就绪
```

## connect(opts?)

扫描并连接戒指设备。内部自动完成蓝牙适配器初始化、扫描、过滤、连接、服务发现和 Notify 启用。

```js
const conn = await ring.connect({
  timeout: 15000,
  scanTimeout: 10000,
})
console.log('已连接:', conn.deviceName)
```

**参数：**

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `timeout` | `number` | `15000` | 总超时（毫秒）。从开始扫描到连接成功的最大等待时间 |
| `scanTimeout` | `number` | `10000` | 扫描超时（毫秒）。如果在这段时间内未发现设备，扫描自动停止 |

**返回值：** `Promise<{ deviceId: string, deviceName: string }>`

| 字段 | 类型 | 说明 |
|------|------|------|
| `deviceId` | `string` | 微信蓝牙设备 ID |
| `deviceName` | `string` | 戒指设备名称 |

**抛出：**

- `Error('扫描超时，未发现戒指设备')` — 在 `timeout` 时间内未发现匹配设备
- `Error('未找到戒指 GATT 服务')` — 设备不支持 SDK 所需的服务 UUID
- `Error('未找到写/通知特征值')` — 设备缺少所需的 GATT 特征值
- `Error('连接超时: xxx')` — 连接请求超时

**自动行为：** 连接成功后会自动执行以下操作：

1. 发送 `SET_TIME` 指令同步时间
2. 发送 `BIND_NOTIFY` 指令注册绑定通知（非致命，失败不抛错）

### 设备过滤规则

扫描时按设备名称前缀过滤，默认前缀列表：

```
O_, R0, R1, RT, RING1, Ring_, SR_, QC_
```

> 如需自定义前缀，可自行调用底层 `ble-connector` 模块的 `startScan({ prefixes })` 方法（当前版本未在 RingSDK 公开此选项，如有需求请联系开发团队）。

---

## disconnect()

断开当前连接。

```js
await ring.disconnect()
```

**返回值：** `Promise<void>`

调用后触发 `disconnected` 事件，内部状态重置。

---

## isConnected()

检查是否已连接到戒指设备。

```js
if (ring.isConnected()) {
  console.log('已连接')
}
```

**返回值：** `boolean`

---

## 连接状态机

SDK 内部维护一个连接状态机，可通过 `stateChange` 事件监听。

| 状态 | 说明 |
|------|------|
| `disconnected` | 未连接 / 已断开 |
| `scanning` | 正在扫描设备 |
| `connecting` | 正在建立连接 |
| `connected` | 已连接，可收发数据 |

```js
ring.on('stateChange', ({ oldState, newState }) => {
  console.log(`${oldState} → ${newState}`)
})
```

## GATT 服务详情

SDK 使用的蓝牙 GATT 服务与特征值：

| UUID | 用途 |
|------|------|
| `6E40FFF0-B5A3-F393-E0A9-E50E24DCCA9E` | 戒指主服务 |
| `6E400002-B5A3-F393-E0A9-E50E24DCCA9E` | 写特征值（发送指令） |
| `6E400003-B5A3-F393-E0A9-E50E24DCCA9E` | Notify 特征值（接收数据） |
