# 协议规格说明

RingSDK 基于**青橙手环蓝牙协议规格书 V1.6.58** 实现。本文档描述底层通信协议的帧格式、校验规则和完整命令码表。

## 帧格式

通信采用 **16 字节定长帧**：

```
┌──────────┬────────────────────────────┬──────────┐
│  命令 1B  │         载荷 14B            │  CRC 1B  │
└──────────┴────────────────────────────┴──────────┘
```

| 字段 | 字节 | 说明 |
|------|------|------|
| 命令 | Byte 0 | bit 7 = 0 为请求，bit 7 = 1 为错误响应 |
| 载荷 | Byte 1–14 | 命令参数 / 响应数据（不足补 `0x00`） |
| CRC | Byte 15 | 前 15 字节求和，取低 8 位 |

## CRC 校验

```js
function calculateCRC(bytes) {
  let sum = 0
  for (let i = 0; i < 15; i++) sum += bytes[i]
  return sum & 0xFF
}
```

SDK 在解析每个响应包时自动校验 CRC，结果记录在 `dataReceived` 事件回调的 `isValid` 字段中。

## 设备名称过滤

扫描时按名称前缀过滤，默认支持的前缀：

| 前缀 | 示例设备名 |
|------|-----------|
| `O_` | `O_Ring_Pro` |
| `R0` | `R01A2B3` |
| `R1` | `R1C4D5E6` |
| `RT` | `RT_Health` |
| `RING1` | `RING1_001` |
| `Ring_` | `Ring_Smart` |
| `SR_` | `SR_Plus` |
| `QC_` | `QC_RingX` |

## GATT 服务

| UUID | 属性 | 说明 |
|------|------|------|
| `6E40FFF0-B5A3-F393-E0A9-E50E24DCCA9E` | 主服务 | 戒指 GATT 主服务 |
| `6E400002-B5A3-F393-E0A9-E50E24DCCA9E` | Write | 指令写入特征值 |
| `6E400003-B5A3-F393-E0A9-E50E24DCCA9E` | Notify | 数据通知特征值 |

## 命令码表

### 基础设置 (0x01–0x0B)

| 命令码 | 常量 | 说明 |
|--------|------|------|
| `0x01` | `SET_TIME` | 设置时间 |
| `0x02` | `CAMERA` | 相机控制 |
| `0x03` | `READ_BATTERY` | 读取电量 |
| `0x04` | `BIND_ANCS` | 绑定 ANCS |
| `0x05` | `WRIST_DISPLAY` | 手腕显示设置 |
| `0x06` | `DO_NOT_DISTURB` | 免打扰 |
| `0x07` | `READ_DAILY_SPORT` | 读取当日运动 |
| `0x08` | `HARD_RESET` | 硬复位 |
| `0x09` | `ANTI_LOST` | 防丢设置 |
| `0x0A` | `SET_USER_PARAMS` | 设置用户参数 |
| `0x0B` | `ANDROID_HEARTBEAT` | Android 心跳包 |

### 血压相关 (0x0C–0x0E)

| 命令码 | 常量 | 说明 |
|--------|------|------|
| `0x0C` | `TIMED_BP_SETTING` | 定时血压设置 |
| `0x0D` | `TIMED_BP_DATA` | 定时血压数据 |
| `0x0E` | `TIMED_BP_CONFIRM` | 定时血压确认 |

### 绑定与通话 (0x10–0x12)

| 命令码 | 常量 | 说明 |
|--------|------|------|
| `0x10` | `BIND_NOTIFY` | 绑定通知 |
| `0x11` | `ANDROID_HANGUP` | 挂断电话 |
| `0x12` | `CLOCK_FACE_SWITCH` | 切换表盘 |

### 数据读取 (0x13–0x16)

| 命令码 | 常量 | 说明 |
|--------|------|------|
| `0x13` | `READ_EXERCISE_DATA` | 读取运动数据 |
| `0x14` | `READ_MANUAL_BP` | 读取手动血压 |
| `0x15` | `READ_TIMED_HR` | 读取定时心率 |
| `0x16` | `TIMED_HR_SWITCH` | 定时心率开关 |

### 实时测量 (0x1E–0x20)

| 命令码 | 常量 | 说明 |
|--------|------|------|
| `0x1E` | `REALTIME_HR_CONTROL` | 实时心率控制 |
| `0x1F` | `SCREEN_OFF_SETTING` | 熄屏设置 |
| `0x20` | `HR_CALIBRATION` | 心率校准 |

### 运动与睡眠 (0x43–0x48)

| 命令码 | 常量 | 说明 |
|--------|------|------|
| `0x43` | `GET_DETAIL_SPORT` | 获取详细运动 |
| `0x44` | `GET_DETAIL_SLEEP` | 获取详细睡眠 |
| `0x46` | `QUERY_DATA_STORAGE` | 查询数据存储 |
| `0x48` | `GET_REALTIME_SPORT` | 获取实时运动 |

### 查找 (0x50)

| 命令码 | 常量 | 说明 |
|--------|------|------|
| `0x50` | `FIND_DEVICE` | 查找设备 |

### 健康测量 (0x69–0x6D)

| 命令码 | 常量 | 说明 |
|--------|------|------|
| `0x69` | `START_HEALTH_MEASURE` | 启动健康测量 |
| `0x6A` | `STOP_HEALTH_MEASURE` | 停止健康测量 |
| `0x6C` | `START_ECG` | 启动 ECG |
| `0x6D` | `ECG_DATA` | ECG 数据 |

### 推送 (0x72–0x73)

| 命令码 | 常量 | 说明 |
|--------|------|------|
| `0x72` | `PUSH_NOTIFICATION` | 推送通知 |
| `0x73` | `DATA_CHANGED` | 数据变化通知 |

### 恢复出厂 (0xFF)

| 命令码 | 常量 | 说明 |
|--------|------|------|
| `0xFF` | `FACTORY_RESET` | 恢复出厂设置 |

## 健康测量类型

`START_HEALTH_MEASURE` (`0x69`) 和 `STOP_HEALTH_MEASURE` (`0x6A`) 指令的 payload[0] 指定测量类型：

| 类型码 | 常量 | 说明 | SDK 方法 |
|--------|------|------|----------|
| `0x01` | `HEART_RATE` | 心率 | `getHeartRate()` |
| `0x02` | `BLOOD_PRESSURE` | 血压 | `getBloodPressure()` |
| `0x03` | `BLOOD_OXYGEN` | 血氧 | `getSpo2()` |
| `0x04` | `FATIGUE` | 疲劳度 | — |
| `0x05` | `ONE_KEY` | 一键测量 | — |
| `0x06` | `REALTIME_HR` | 实时心率 | `startRealtimeHeartRate()` |
| `0x07` | `ECG` | ECG | — |
| `0x08` | `STRESS` | 压力 | `getStress()` |
| `0x09` | `BLOOD_SUGAR` | 血糖 | — |
| `0x0A` | `HRV` | HRV | `getHrv()` |
| `0x0B` | `TEMPERATURE` | 体温 | — |

## 数据变化通知类型

`DATA_CHANGED` (`0x73`) 事件中 payload[0] 表示变化类型：

| 类型码 | 常量 | 说明 |
|--------|------|------|
| `0x01` | `HEART_RATE` | 心率变化 |
| `0x02` | `BLOOD_PRESSURE` | 血压变化 |
| `0x03` | `BLOOD_OXYGEN` | 血氧变化 |
| `0x04` | `STEPS` | 步数变化 |
| `0x05` | `TEMPERATURE` | 体温变化 |
| `0x06` | `SLEEP` | 睡眠数据变化 |
| `0x07` | `EXERCISE_RECORD` | 运动记录变化 |
| `0x08` | `ALARM` | 闹钟变化 |
| `0x0A` | `STRESS` | 压力变化 |
| `0x0B` | `HRV` | HRV 变化 |
| `0x0C` | `BATTERY_CHANGE` | 电量变化 |
| `0x0D` | `BLOOD_SUGAR` | 血糖变化 |
| `0x12` | `SPORT` | 步数/卡路里/距离变化 |

## 多包数据协议

睡眠和运动数据采用多包传输协议：

1. **索引包** — payload[0] = `0xF0`，payload[1] = 总数据条数
2. **数据包** — payload[0] = 年份‑2000（如 `0x19` = 2025），后续字节为具体数据
3. **空包** — payload[0] = `0xFF`，表示无数据

SDK 内部通过 `_collectPackets()` 自动收集所有数据包并拼接。
