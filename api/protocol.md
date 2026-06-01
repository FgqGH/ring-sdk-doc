# 协议层

RingSDK 从 `ring-protocol.js` 导出协议常量和工具函数，供高级用户直接使用。

## 导入

```js
import {
  BLE_CMD, HEALTH_MEASURE_TYPE, DATA_CHANGE_TYPE,
  packCommand, parseResponse, ab2hex,
  parseRealtimeHr, parseStressResponse,
  parseDetailSleepResponse, parseDetailSportResponse,
} from 'ring-ble-sdk'
```

---

## send(buffer)

发送原始 16 字节指令到已连接设备。这是 SDK 的"逃生舱"——当封装方法不满足需求时，可自行构建指令发送。

```js
const cmd = packCommand(BLE_CMD.FIND_DEVICE, [0x55, 0xAA])
await ring.send(cmd)
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `buffer` | `ArrayBuffer` | 16 字节指令帧 |

**返回值：** `Promise<void>`

**抛出：**

- `Error('未连接设备')` — 未调用 `connect()`
- `Error('Notify 尚未启用')` — 连接未完全就绪
- `Error('写入失败: ...')` — BLE 写入错误

---

## packCommand(cmd, payload?)

组装 16 字节指令为 ArrayBuffer。

```js
import { packCommand, BLE_CMD } from 'ring-ble-sdk'

// 构建"读取电量"指令
const buf = packCommand(BLE_CMD.READ_BATTERY)
// → ArrayBuffer(16): [0x03, 0x00*14, CRC]

// 构建"查找设备"指令
const buf2 = packCommand(BLE_CMD.FIND_DEVICE, [0x55, 0xAA])
// → ArrayBuffer(16): [0x50, 0x55, 0xAA, 0x00*12, CRC]
```

**参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `cmd` | `number` | — | 命令码（自动 mask `0x7F`，`0xFF` 除外） |
| `payload` | `number[]` | `[]` | 14 字节载荷（不足补 `0x00`，超出截断） |

**返回值：** `ArrayBuffer(16)` — 16 字节定长指令帧：`[CMD 1B | PAYLOAD 14B | CRC 1B]`

---

## 协议常量

### BLE_CMD — 命令码

所有蓝牙指令的命令码常量。详见 [协议规格说明 — 命令码表](/protocol-spec#命令码表)。

```js
import { BLE_CMD } from 'ring-ble-sdk'

BLE_CMD.READ_BATTERY         // 0x03
BLE_CMD.START_HEALTH_MEASURE // 0x69
BLE_CMD.GET_DETAIL_SLEEP     // 0x44
// ... 共 30+ 个命令码
```

### HEALTH_MEASURE_TYPE — 健康测量类型

```js
import { HEALTH_MEASURE_TYPE } from 'ring-ble-sdk'

HEALTH_MEASURE_TYPE.HEART_RATE      // 0x01  心率
HEALTH_MEASURE_TYPE.BLOOD_PRESSURE  // 0x02  血压
HEALTH_MEASURE_TYPE.BLOOD_OXYGEN    // 0x03  血氧
HEALTH_MEASURE_TYPE.STRESS          // 0x08  压力
HEALTH_MEASURE_TYPE.HRV             // 0x0A  HRV
HEALTH_MEASURE_TYPE.REALTIME_HR     // 0x06  实时心率
```

### DATA_CHANGE_TYPE — 数据变化类型

```js
import { DATA_CHANGE_TYPE } from 'ring-ble-sdk'

DATA_CHANGE_TYPE.HEART_RATE      // 0x01
DATA_CHANGE_TYPE.BLOOD_PRESSURE  // 0x02
DATA_CHANGE_TYPE.STEPS           // 0x04
DATA_CHANGE_TYPE.SLEEP           // 0x06
DATA_CHANGE_TYPE.HRV             // 0x0B
// ... 共 13 个类型
```

---

## 响应解析器

这些函数用于解析 `dataReceived` 事件回调中的 `payload` 数组。

### parseRealtimeHr(payload)

解析实时心率推送数据。

```js
ring.on('dataReceived', (data) => {
  if (data.cmd === BLE_CMD.START_HEALTH_MEASURE && data.payload[0] === HEALTH_MEASURE_TYPE.REALTIME_HR) {
    const hr = parseRealtimeHr(data.payload)
    // → { heartRate: 72 }
  }
})
```

### parseStressResponse(payload)

```js
// → { stress: 3 }
```

### parseDetailSleepResponse(payload)

解析睡眠数据包。

```js
const result = parseDetailSleepResponse(payload)
// 索引包: { isIndex: true, hasData: true, dataCount: 48 }
// 数据包: { isIndex: false, hasData: true, sleepEntry: { date, timeIndex, sleepType, validMinutes, quality } }
// 空包:   { isIndex: true, hasData: false }
```

### parseDetailSportResponse(payload)

解析运动数据包。

```js
const result = parseDetailSportResponse(payload)
// 索引包: { isIndex: true, hasData: true, dataCount: 48, isNewProtocol: false }
// 数据包: { isIndex: false, hasData: true, sportEntry: { date, timeIndex, calories, steps, distance, runSteps } }
```

---

## 工具函数

### ab2hex(buffer)

ArrayBuffer → HEX 字符串（大写）。

```js
import { ab2hex } from 'ring-ble-sdk'

const hex = ab2hex(arrayBuffer)
// → "690600480000000000000000000000C4"
```

### parseResponse(buffer)

解析 16 字节响应数据。

```js
import { parseResponse } from 'ring-ble-sdk'

const result = parseResponse(arrayBuffer)
// → {
//     isValid: true,
//     isError: false,
//     cmd: 0x69,
//     payload: [0x06, 0x00, 0x48, ...],
//     crc: 0xC4,
//     rawHex: "690600480000000000000000000000C4"
//   }
```

---

## 自定义指令构建示例

### 查找设备

```js
import { packCommand, BLE_CMD } from 'ring-ble-sdk'

const cmd = packCommand(BLE_CMD.FIND_DEVICE, [0x55, 0xAA])
await ring.send(cmd)
```

### 读取定时心率

```js
import { packCommand, BLE_CMD } from 'ring-ble-sdk'

// timestampToLE 将 Unix 时间戳转为小端序 4 字节数组
const now = Math.floor(Date.now() / 1000)
const tsBytes = [
  now & 0xFF,
  (now >> 8) & 0xFF,
  (now >> 16) & 0xFF,
  (now >> 24) & 0xFF,
]
const cmd = packCommand(BLE_CMD.READ_TIMED_HR, tsBytes)
await ring.send(cmd)
```

> 更多指令构建器（`buildSetTimeCmd`、`buildHeartbeatCmd` 等）可直接从 `ring-protocol.js` 导入，但由于这些已被 RingSDK 封装使用，通常不需要直接调用。
