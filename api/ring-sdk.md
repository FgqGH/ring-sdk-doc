# RingSDK 类

RingSDK 是 SDK 的主入口类，封装了 BLE 连接管理、协议解析和健康数据读取的全部能力。

## 导入

```js
import { RingSDK } from 'ring-ble-sdk'
// 微信小程序中：
// import { RingSDK } from '../../utils/ring-sdk.esm.js'
```

## 构造函数

### `new RingSDK(options)`

创建 SDK 实例。

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `licenseKey` | `string` | ✅ | 授权密钥，由 QRing 颁发 |
| `licenseServerUrl` | `string` | ❌ | 自定义 License 校验服务器地址，默认使用内置地址 |

**示例：**

```js
const ring = new RingSDK({
  licenseKey: 'sk-xxxxxxxxxxxxxxxx',
  licenseServerUrl: 'https://license.example.com/v1/sdk/verify',
})
```

**抛出：**

- `Error` — 如果 `licenseKey` 为空或非字符串

---

## 实例属性

### `ring.version`

SDK 版本号，类型 `string`。

```js
console.log(ring.version)   // "1.0.0"
```

---

## 实例方法总览

| 方法 | 返回值 | 说明 |
|------|--------|------|
| [init()](#init) | `Promise<{ success, message }>` | 初始化 — License 校验 |
| [connect()](/api/connection#connect-opts) | `Promise<{ deviceId, deviceName }>` | 扫描并连接戒指 |
| [disconnect()](/api/connection#disconnect) | `Promise<void>` | 断开当前连接 |
| [isConnected()](/api/connection#isconnected) | `boolean` | 是否已连接 |
| [getBattery()](/api/health-data#getbattery) | `Promise<{ level, isCharging }>` | 读取电量 |
| [getHeartRate()](/api/health-data#getheartrate) | `Promise<{ heartRate, rri? }>` | 单次心率测量 |
| [getBloodPressure()](/api/health-data#getbloodpressure) | `Promise<{ systolic, diastolic, heartRate }>` | 单次血压测量 |
| [getSpo2()](/api/health-data#getspo2) | `Promise<{ spo2?, heartRate? }>` | 单次血氧测量 |
| [getHrv()](/api/health-data#gethrv) | `Promise<{ errorType, hrv, rri? }>` | HRV 测量 |
| [getStress()](/api/health-data#getstress) | `Promise<{ stress }>` | 压力测量 |
| [getSleep()](/api/health-data#getsleep) | `Promise<{ date, entries }>` | 睡眠数据 |
| [getActivity()](/api/health-data#getactivity) | `Promise<{ date, entries }>` | 运动数据 |
| [startRealtimeHeartRate()](/api/health-data#startrealtimeheartrate) | `Promise<void>` | 启动实时心率流 |
| [stopRealtimeHeartRate()](/api/health-data#stoprealtimeheartrate) | `Promise<void>` | 停止实时心率流 |
| [heartbeat()](/api/heartbeat#heartbeat) | `Promise<void>` | 发送单次心跳 |
| [startAutoHeartbeat()](/api/heartbeat#startautoheartbeat) | `number` | 启动自动心跳（每 30s） |
| [send()](/api/protocol#send-buffer) | `Promise<void>` | 发送原始指令 |
| [on()](/api/events#on-event-cb) | `void` | 注册事件监听 |
| [off()](/api/events#off-event-cb) | `void` | 移除事件监听 |

---

## init()

初始化 SDK，执行远程 License 校验。

```js
const res = await ring.init()
if (!res.success) {
  throw new Error(res.message)
}
```

**返回值：** `Promise<{ success: boolean, message: string }>`

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | `boolean` | 是否成功 |
| `message` | `string` | 描述信息 |

**抛出：** `Error` — 重复初始化时不会抛错，直接返回 `{ success: true, message: '已初始化' }`

> **注意：** 当前版本 License 远程校验代码已注释（`TODO: 发布前恢复`），`init()` 始终返回成功。正式发布前需恢复 `license.js` 中的 `verify()` 调用。
