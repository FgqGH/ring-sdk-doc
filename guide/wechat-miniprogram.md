# 微信小程序接入

RingSDK 专为微信小程序设计，底层使用 `wx.xxx` 原生蓝牙 API。本指南涵盖小程序接入的完整流程和注意事项。

## Demo 项目

我们提供了一个开箱即用的微信小程序 Demo：[ring-sdk-guide](https://github.com/FgqGH/ring-sdk-guide)。

### 导入步骤

1. 打开**微信开发者工具**
2. 克隆仓库 `git clone https://github.com/FgqGH/ring-sdk-guide.git`，导入项目目录
3. 将 `project.config.json` 中的 `appid` 改为你的真实 AppID（或用测试号）
4. 编译运行，打开手机蓝牙，靠近戒指设备即可测试

> 无需 `npm install`，无需"构建 npm"。SDK 已编译为单文件直接放在 `utils/` 目录。

## 项目结构

```
miniprogram/
├── app.js                # 小程序入口
├── app.json              # 全局配置（含蓝牙权限声明）
├── app.wxss              # 全局样式
├── project.config.json   # 微信开发者工具配置
├── utils/
│   └── ring-sdk.esm.js   # SDK 单文件（开箱即用）
└── pages/
    └── demo/
        ├── demo.js       # 核心 Demo — 全部测量功能
        ├── demo.wxml     # UI
        └── demo.wxss     # 样式
```

## 权限配置

在 `app.json` 中声明蓝牙权限：

```json
{
  "permission": {
    "scope.bluetooth": {
      "desc": "用于发现和连接智能戒指设备"
    }
  },
  "requiredBackgroundModes": ["bluetooth-central"]
}
```

## 基本集成

### 1. 引入 SDK

```js
// pages/xxx/xxx.js
import { RingSDK, BLE_CMD, HEALTH_MEASURE_TYPE, parseRealtimeHr, packCommand } from '../../utils/ring-sdk.esm.js'
```

### 2. 创建实例并初始化

```js
Page({
  data: {
    state: '未连接',
    connected: false,
  },

  async onLoad() {
    const ring = new RingSDK({ licenseKey: 'YOUR_KEY' })

    // 注册事件
    ring.on('stateChange', ({ newState }) => {
      this.setData({ state: newState })
    })
    ring.on('connected', ({ deviceId }) => {
      this.setData({ connected: true, state: '已连接' })
    })
    ring.on('disconnected', () => {
      this.setData({ connected: false, state: '已断开' })
    })
    ring.on('error', ({ type, err }) => {
      wx.showToast({ title: err.message || String(err), icon: 'none' })
    })

    // 初始化
    const res = await ring.init()
    if (!res.success) {
      this.setData({ state: '初始化失败: ' + res.message })
      return
    }
    this.setData({ state: '就绪 — 请连接戒指' })
  },
})
```

### 3. 连接设备

```js
async handleConnect() {
  wx.showLoading({ title: '扫描中...' })
  try {
    await this.ring.connect()
    this.ring.startAutoHeartbeat()   // 启动心跳保活
    wx.hideLoading()
  } catch (e) {
    wx.hideLoading()
    wx.showToast({ title: e.message || '连接失败', icon: 'none' })
  }
}
```

### 4. 读取数据

```js
async handleBloodPressure() {
  wx.showLoading({ title: '测量中 (约30s)...' })
  try {
    const bp = await this.ring.getBloodPressure()
    this.setData({ bloodPressure: bp })
    wx.hideLoading()
  } catch (e) {
    wx.hideLoading()
    wx.showToast({ title: e.message || '测量超时', icon: 'none' })
  }
}
```

## 调试技巧

### 查看原始数据

注册 `dataReceived` 事件，打印每次收到的 16 字节原始帧：

```js
ring.on('dataReceived', (data) => {
  console.log('[RingSDK] RX:', data.rawHex)   // e.g. "6906000000000000000000000000C4"
})
```

### 发送自定义指令

SDK 提供"逃生舱"模式，可使用 `packCommand()` 自行构建指令并通过 `send()` 发送：

```js
import { packCommand, BLE_CMD } from '../../utils/ring-sdk.esm.js'

// 发送查找设备指令
const cmd = packCommand(BLE_CMD.FIND_DEVICE, [0x55, 0xAA])
await ring.send(cmd)
```

## 常见问题

### 1. 扫描不到设备

- 确认手机蓝牙已开启
- 确认戒指已开机且在手机附近（≤ 10 米）
- 确认戒指名称以 SDK 内置前缀开头（`O_`、`R0`、`R1`、`RT`、`RING1`、`Ring_`、`SR_`、`QC_`）
- 如需匹配其他前缀，可通过 `opts.prefixes` 参数传入自定义前缀列表

### 2. 连接后立即断开

微信小程序 BLE 连接在长时间无通信时可能被系统断开。**务必在连接成功后调用 `ring.startAutoHeartbeat()`** 启动心跳保活。

### 3. 真机与模拟器行为不一致

- **蓝牙功能必须在真机上测试**，模拟器不支持 BLE
- 建议使用微信开发者工具的"真机调试"功能

### 4. iOS 与 Android 差异

- iOS 上 `wx.onBluetoothDeviceFound` 可能不返回 RSSI
- Android 上部分机型需要在系统设置中开启位置权限才能使用 BLE
- 两个平台的 GATT 服务发现速度不同，SDK 已内置超时处理

## 相关资源

- [API 参考 — RingSDK 类](/api/ring-sdk)
- [API 参考 — 连接管理](/api/connection)
- [协议规格说明](/protocol-spec)
