# 健康数据读取

健康数据是 RingSDK 的核心能力。所有测量方法均为异步，设备完成测量后返回结构化结果。

## 测量机制

每次测量遵循统一的请求-响应模式：

1. SDK 发送启动测量指令（`START_HEALTH_MEASURE`）
2. 设备开始测量
3. 设备完成测量后发送响应（`STOP_HEALTH_MEASURE` 或 `START_HEALTH_MEASURE`）
4. SDK 解析响应并返回结构化数据

每个方法设置了超时，超时后会抛出 `Error`。

---

## getBattery()

读取设备当前电量。

```js
const battery = await ring.getBattery()
// → { level: 85, isCharging: false }
```

**超时：** 5s

**返回值：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `level` | `number` | 电量百分比（0–100） |
| `isCharging` | `boolean` | 是否正在充电 |

---

## getHeartRate()

单次心率测量（约 15 秒完成）。

```js
const hr = await ring.getHeartRate()
// → { heartRate: 72, rri: 833 }
```

**超时：** 15s

**返回值：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `heartRate` | `number` | 心率值（bpm） |
| `rri` | `number` | R-R 间期（毫秒），可选 |

---

## getBloodPressure()

单次血压测量（约 30 秒完成）。

```js
const bp = await ring.getBloodPressure()
// → { systolic: 120, diastolic: 80, heartRate: 72 }
```

**超时：** 30s

**返回值：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `systolic` | `number` | 收缩压（mmHg） |
| `diastolic` | `number` | 舒张压（mmHg） |
| `heartRate` | `number` | 心率值（bpm） |

---

## getSpo2()

单次血氧测量（约 15 秒完成）。

```js
const spo2 = await ring.getSpo2()
// → { spo2: 98 }  或  { heartRate: 72 }
```

**超时：** 15s

**返回值：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `spo2` | `number` | 血氧饱和度（%），仅在 `payload[3] === 1` 时返回 |
| `heartRate` | `number` | 心率值（bpm），`payload[3] !== 1` 时返回 |

---

## getHrv()

HRV（心率变异性）单次测量（约 30 秒完成）。

```js
const hrv = await ring.getHrv()
// → { errorType: 0, hrv: 45, rri: 833 }
```

**超时：** 30s

**返回值：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `errorType` | `number` | 错误类型（0 = 正常） |
| `hrv` | `number` | HRV 值 |
| `rri` | `number` | R-R 间期（毫秒），可选 |

---

## getStress()

压力测量（约 15 秒完成）。

```js
const stress = await ring.getStress()
// → { stress: 3 }
```

**超时：** 15s

**返回值：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `stress` | `number` | 压力等级 |

---

## getSleep(daysAgo?)

读取详细睡眠数据。

```js
const sleep = await ring.getSleep(1)   // 1 = 昨晚
// → {
//     date: '2025-01-15',
//     entries: [
//       { date: { year: 2025, month: 1, day: 15 }, timeIndex: 0, sleepType: 2, validMinutes: 60, quality: 85 },
//       ...
//     ]
//   }
```

**参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `daysAgo` | `number` | `1` | 几天前：`1` = 昨晚，`0` = 今晚 |

**超时：** 8s（多包收集窗口）

**返回值：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `date` | `string` | 日期 `YYYY-MM-DD` |
| `entries` | `Array` | 睡眠条目数组 |

**睡眠条目字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `date` | `{ year, month, day }` | 日期 |
| `timeIndex` | `number` | 时段索引 |
| `sleepType` | `number` | 睡眠类型 |
| `validMinutes` | `number` | 有效分钟数 |
| `quality` | `number` | 睡眠质量 |

---

## getActivity(daysAgo?)

读取详细运动数据（步数、卡路里、距离、跑步步数）。

```js
const activity = await ring.getActivity(0)   // 0 = 今天
// → {
//     date: '2025-01-15',
//     entries: [
//       { date: { year: 2025, month: 1, day: 15 }, timeIndex: 0,
//         steps: 1200, calories: 45, distance: 800, runSteps: 200 },
//       ...
//     ]
//   }
```

**参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `daysAgo` | `number` | `0` | 几天前：`0` = 今天 |

**超时：** 8s（多包收集窗口）

**返回值：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `date` | `string` | 日期 `YYYY-MM-DD` |
| `entries` | `Array` | 运动条目数组 |

**运动条目字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `date` | `{ year, month, day }` | 日期 |
| `timeIndex` | `number` | 时段索引 |
| `steps` | `number` | 步数 |
| `calories` | `number` | 卡路里（需除以 100 得 kcal） |
| `distance` | `number` | 距离（米） |
| `runSteps` | `number` | 跑步步数 |

---

## startRealtimeHeartRate()

启动实时心率流。启动后设备持续推送心率数据，通过 `dataReceived` 事件接收。

```js
await ring.startRealtimeHeartRate()

// 监听实时心率数据
import { BLE_CMD, HEALTH_MEASURE_TYPE, parseRealtimeHr } from 'ring-ble-sdk'

ring.on('dataReceived', (data) => {
  if (data.cmd === BLE_CMD.START_HEALTH_MEASURE
      && data.payload[0] === HEALTH_MEASURE_TYPE.REALTIME_HR
      && !data.isError) {
    const hr = parseRealtimeHr(data.payload)
    console.log('实时心率:', hr.heartRate)
  }
})
```

**返回值：** `Promise<void>`

---

## stopRealtimeHeartRate()

停止实时心率流。

```js
await ring.stopRealtimeHeartRate()
```

**返回值：** `Promise<void>`

---

## 错误处理

所有测量方法在以下情况会抛出错误：

- **未初始化** — `[RingSDK] 请先调用 ring.init()`
- **未连接** — `[RingSDK] 请先调用 ring.connect()`
- **超时** — `'测量超时'` / `'设备响应超时'`

建议使用时包裹 try-catch：

```js
try {
  const bp = await ring.getBloodPressure()
  this.setData({ bloodPressure: bp })
} catch (e) {
  wx.showToast({ title: e.message, icon: 'none' })
}
```
