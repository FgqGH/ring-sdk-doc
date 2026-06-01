# 事件系统

RingSDK 基于 EventEmitter 模式实现事件驱动架构。通过 `on()` / `off()` 注册和移除事件监听。

## on(event, cb)

注册事件监听。

```js
ring.on(eventName, callback)
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `event` | `string` | 事件名称 |
| `cb` | `Function` | 回调函数 |

## off(event, cb)

移除事件监听。

```js
ring.off(eventName, callback)
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `event` | `string` | 事件名称 |
| `cb` | `Function` | 需要移除的回调（必须是 `on()` 时传入的同一引用） |

---

## 事件列表

### `stateChange`

连接状态变化时触发。

```js
ring.on('stateChange', ({ oldState, newState }) => {
  console.log(`${oldState} → ${newState}`)
})
```

**回调参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `oldState` | `string` | 旧状态 — `disconnected` / `scanning` / `connecting` / `connected` |
| `newState` | `string` | 新状态 |

---

### `deviceFound`

扫描发现设备时触发。

```js
ring.on('deviceFound', ({ name, deviceId, RSSI }) => {
  console.log(`发现: ${name} (${deviceId}) RSSI: ${RSSI}`)
})
```

**回调参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 设备名称 |
| `deviceId` | `string` | 微信蓝牙设备 ID |
| `RSSI` | `number` | 信号强度 |

> **注意：** `connect()` 内部会自动取第一个匹配设备并停止扫描。如果你需要在多个设备中选择，建议直接使用底层 `ble-connector` 模块。

---

### `connected`

连接成功时触发。

```js
ring.on('connected', ({ deviceId }) => {
  console.log('已连接:', deviceId)
})
```

**回调参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `deviceId` | `string` | 已连接的设备 ID |

---

### `disconnected`

断开连接时触发。

```js
ring.on('disconnected', () => {
  console.log('已断开')
})
```

**回调参数：** 无（空对象 `{}`）

---

### `dataReceived`

收到设备原始数据时触发。这是最重要的底层事件——所有测量方法的 Promise resolve 都依赖此事件。

```js
ring.on('dataReceived', (data) => {
  console.log('RX:', data.rawHex)
})
```

**回调参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `cmd` | `number` | 命令码（bit 7 已清除） |
| `payload` | `number[]` | 14 字节载荷数组 |
| `isError` | `boolean` | 响应是否为错误（原始命令码 bit 7 = 1） |
| `rawHex` | `string` | 16 字节原始数据 HEX 字符串（大写） |
| `isValid` | `boolean` | CRC 校验是否通过 |

**过滤实时心率数据示例：**

```js
import { BLE_CMD, HEALTH_MEASURE_TYPE, parseRealtimeHr } from 'ring-ble-sdk'

ring.on('dataReceived', (data) => {
  // 实时心率：cmd = 0x69 且子类型 = 0x06
  if (data.cmd === BLE_CMD.START_HEALTH_MEASURE
      && data.payload[0] === HEALTH_MEASURE_TYPE.REALTIME_HR
      && !data.isError) {
    const hr = parseRealtimeHr(data.payload)
    console.log('实时心率:', hr.heartRate)
  }
})
```

---

### `error`

SDK 内部发生异常时触发。

```js
ring.on('error', ({ type, err }) => {
  console.error('异常:', type, err)
})
```

**回调参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | `string` | 错误类型标识 |
| `err` | `Error` / `object` | 原始错误对象 |

**常见错误类型：**

| type | 说明 |
|------|------|
| `adapter_init` | 蓝牙适配器初始化失败 |
| `scan_start` | 开始扫描失败 |
| `connect_timeout` | 连接超时 |
| `connect` | 连接失败 |
| `discovery` | GATT 服务发现失败 |
