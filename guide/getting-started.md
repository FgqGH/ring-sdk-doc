# 快速开始

本指南将帮助你从零开始，在 5 分钟内完成 RingSDK 的安装、初始化和首次数据读取。

## 安装

### npm 安装

```bash
npm install ring-ble-sdk
```

### 直接引入（微信小程序）

如果你在微信小程序中使用，SDK 已提供编译好的 ESM 单文件，可直接放入 `utils/` 目录：

```
utils/
└── ring-sdk.esm.js      # SDK 单文件（开箱即用）
```

> 无需 `npm install`，无需"构建 npm"。该文件已包含所有依赖，直接 `import` 即可。

## 初始化

使用 RingSDK 前必须先初始化——这会执行远程 License 校验。

```js
import { RingSDK } from 'ring-ble-sdk'
// 微信小程序中：
// import { RingSDK } from '../../utils/ring-sdk.esm.js'

const ring = new RingSDK({
  licenseKey: 'YOUR_LICENSE_KEY',       // 必填
  licenseServerUrl: 'https://your-server.com/v1/sdk/verify',  // 可选，默认使用内置地址
})

const res = await ring.init()
if (!res.success) {
  throw new Error(res.message)   // License 无效 / 过期 / 网络异常
}

console.log('SDK 版本:', ring.version)  // "1.0.0"
```

::: warning 注意
`init()` 必须在所有其他操作之前调用，否则会抛出 `[RingSDK] 请先调用 ring.init()` 错误。
:::

## 注册事件

在连接之前注册事件监听，确保不会丢失任何状态变化。

```js
// 连接状态变化
ring.on('stateChange', ({ oldState, newState }) => {
  console.log(`状态: ${oldState} → ${newState}`)
})

// 扫描发现设备
ring.on('deviceFound', ({ name, deviceId, RSSI }) => {
  console.log(`发现设备: ${name} (${deviceId}) RSSI: ${RSSI}`)
})

// 收到设备原始数据
ring.on('dataReceived', ({ cmd, payload, isError, rawHex }) => {
  console.log('RX:', rawHex)
})

// 连接成功
ring.on('connected', ({ deviceId }) => {
  console.log('已连接:', deviceId)
})

// 断开连接
ring.on('disconnected', () => {
  console.log('已断开')
})

// 异常
ring.on('error', ({ type, err }) => {
  console.error('异常:', type, err)
})
```

## 扫描并连接

```js
try {
  const conn = await ring.connect({
    timeout: 15000,       // 总超时（毫秒），默认 15000
    scanTimeout: 10000,   // 扫描超时（毫秒），默认 10000
  })
  console.log('已连接:', conn.deviceName)
} catch (e) {
  console.error('连接失败:', e.message)
}
```

**连接流程（自动完成）：**

1. 初始化蓝牙适配器
2. 开始 BLE 扫描，按戒指名称前缀过滤（`O_`、`R0`、`R1`、`RT`、`RING1`、`Ring_`、`SR_`、`QC_`）
3. 发现第一个匹配设备 → 停止扫描 → 建立连接
4. 发现 GATT 服务 → 启用 Notify
5. 自动同步时间 → 发送绑定通知

## 读取健康数据

连接成功后即可读取各项健康指标。

### 电量

```js
const battery = await ring.getBattery()
// → { level: 85, isCharging: false }
```

### 心率（单次测量，约 15s）

```js
const hr = await ring.getHeartRate()
// → { heartRate: 72, rri: 833 }
```

### 血压（单次测量，约 30s）

```js
const bp = await ring.getBloodPressure()
// → { systolic: 120, diastolic: 80, heartRate: 72 }
```

### 血氧（单次测量，约 15s）

```js
const spo2 = await ring.getSpo2()
// → { spo2: 98 }  或  { heartRate: 72 }
```

### HRV（心率变异性，约 30s）

```js
const hrv = await ring.getHrv()
// → { errorType: 0, hrv: 45, rri: 833 }
```

### 压力（单次测量，约 15s）

```js
const stress = await ring.getStress()
// → { stress: 3 }
```

### 睡眠数据

```js
const sleep = await ring.getSleep(1)   // 1 = 昨晚，0 = 今晚
// → { date: '2025-01-15', entries: [{ timeIndex: 0, sleepType: 2, validMinutes: 60, quality: 85 }, ...] }
```

### 运动数据

```js
const activity = await ring.getActivity(0)   // 0 = 今天
// → { date: '2025-01-15', entries: [{ timeIndex: 0, steps: 1200, calories: 45, distance: 800, runSteps: 200 }, ...] }
```

## 实时心率流

```js
// 启动
await ring.startRealtimeHeartRate()
// 数据通过 'dataReceived' 事件持续推送
// 过滤实时心率数据：
ring.on('dataReceived', (data) => {
  if (data.cmd === 0x69 && data.payload[0] === 0x06 && !data.isError) {
    const hr = parseRealtimeHr(data.payload)   // 需从 ring-protocol 导入
    console.log('实时心率:', hr.heartRate)
  }
})

// 停止
await ring.stopRealtimeHeartRate()
```

## 心跳保活

微信小程序 BLE 连接在长时间无通信时可能被系统断开。启动自动心跳可保持连接：

```js
ring.startAutoHeartbeat()   // 每 30 秒自动发送一次心跳包
```

## 断开

```js
await ring.disconnect()
```

## 下一步

- 查看 [微信小程序接入指南](/guide/wechat-miniprogram) — 了解小程序专属配置和注意事项
- 查看 [API 参考](/api/ring-sdk) — 完整的 API 文档
- 查看 [协议规格说明](/protocol-spec) — 了解底层通信协议
