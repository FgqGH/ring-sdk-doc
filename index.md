---
layout: home

hero:
  name: "RingSDK"
  text: "智能戒指蓝牙通信 SDK"
  tagline: 专为微信小程序设计，封装 BLE 连接管理、戒指私有协议编解码、健康数据读取能力
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: API 参考
      link: /api/ring-sdk
    - theme: alt
      text: 在线 Demo
      link: https://github.com/FgqGH/ring-sdk-guide

features:
  - icon: 🔗
    title: BLE 连接管理
    details: 适配器初始化、设备扫描与自动过滤、GATT 服务发现、Notify 监听，全流程封装。支持自定义戒指名称前缀匹配。
  - icon: ❤️
    title: 健康数据读取
    details: 心率、血压、血氧、HRV、压力、睡眠、运动数据——全部封装为异步方法，一次调用即可获取结构化结果。
  - icon: 📡
    title: 实时心率流
    details: 启动实时心率测量后，设备持续推送数据，通过事件回调实时更新 UI。
  - icon: 🔐
    title: License 授权
    details: 内置远程 License 校验机制，支持 fetch 和 wx.request 双通道，保障 SDK 授权安全。
  - icon: 📦
    title: 轻量零依赖
    details: 纯 JavaScript 实现，零外部依赖。Rollup 打包输出 ESM / UMD 双格式，支持 Tree Shaking。
  - icon: 🛠️
    title: 逃生舱模式
    details: 提供 packCommand() / send() 底层接口，开发者可自行构建 16 字节指令帧，突破封装层限制。
---

## 系统需求

| 运行环境 | 版本要求 |
|----------|----------|
| 微信小程序基础库 | ≥ 2.10.0 |
| 蓝牙 | BLE 4.0+ |
| 戒指固件协议 | 青橙手环蓝牙协议 V1.6.58 |

## 快速预览

```js
import { RingSDK } from 'ring-ble-sdk'

const ring = new RingSDK({ licenseKey: 'YOUR_KEY' })

// 初始化 License 校验
await ring.init()

// 扫描并连接戒指
ring.on('deviceFound', d => console.log('发现:', d.name))
await ring.connect()

// 读取健康数据
const bp      = await ring.getBloodPressure()   // { systolic, diastolic, heartRate }
const hrv     = await ring.getHrv()             // { errorType, hrv }
const battery = await ring.getBattery()          // { level, isCharging }

// 实时心率
await ring.startRealtimeHeartRate()
// 数据通过 'dataReceived' 事件持续推送

// 断开
await ring.disconnect()
```

## 版本分支

| 分支 | 说明 | 地址 |
|------|------|------|
| `master` | 主分支（最新） | [GitHub](https://github.com/FgqGH/ring-sdk) |

## 相关项目

- **ring-sdk** — SDK 核心源码 [GitHub](https://github.com/FgqGH/ring-sdk)
- **ring-sdk-guide** — 微信小程序 Demo [GitHub](https://github.com/FgqGH/ring-sdk-guide)
