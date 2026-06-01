# 更新日志

## v1.0.0

**发布日期：** 2025-01

### 首次发布 🎉

RingSDK 首个正式版本，提供完整的智能戒指蓝牙通信能力。

**核心功能：**

- ✅ BLE 连接管理 — 适配器初始化、设备扫描（名称前缀过滤）、GATT 服务发现、Notify 监听
- ✅ License 授权 — 远程校验机制（`fetch` / `wx.request` 双通道）
- ✅ 健康数据读取
  - 心率（单次 + 实时流）
  - 血压（收缩压 / 舒张压 / 心率）
  - 血氧
  - HRV（心率变异性）
  - 压力
  - 详细睡眠数据
  - 详细运动数据（步数 / 卡路里 / 距离 / 跑步步数）
- ✅ 设备电量读取
- ✅ 心跳保活（单次 + 自动 30s 间隔）
- ✅ 事件驱动架构 — 6 种事件类型（`stateChange` / `deviceFound` / `dataReceived` / `connected` / `disconnected` / `error`）
- ✅ 协议层导出 — `packCommand()` / `parseResponse()` / 完整命令码常量
- ✅ "逃生舱"模式 — `send()` 支持发送自定义 16 字节指令
- ✅ 零外部依赖，纯 JavaScript 实现
- ✅ Rollup 打包输出 ESM / UMD 双格式

**运行环境：**

- 微信小程序基础库 ≥ 2.10.0
- BLE 4.0+

**已知限制：**

- License 远程校验代码已注释（`TODO: 发布前恢复`），当前 `init()` 始终通过
- `connect()` 的 `prefixes` 参数未通过 RingSDK 公开，需直接调用底层 `ble-connector` 模块
- 疲劳度 / 一键测量 / ECG / 血糖 / 体温等测量类型暂未封装高层 API
