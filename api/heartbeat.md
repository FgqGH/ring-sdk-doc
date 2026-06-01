# 心跳保活

微信小程序 BLE 连接在长时间无通信时可能被系统断开。RingSDK 提供心跳机制来保持连接活跃。

## heartbeat()

发送一次心跳包。

```js
await ring.heartbeat()
```

**返回值：** `Promise<void>`

如果当前未连接，方法静默返回（不抛错）。如果已连接但发送失败，异常会被静默捕获。

**发送的指令：** `ANDROID_HEARTBEAT` (`0x0B`)

---

## startAutoHeartbeat()

启动自动心跳，每 30 秒自动发送一次心跳包。

```js
const timerId = ring.startAutoHeartbeat()
```

**返回值：** `number` — `setInterval` 返回的定时器 ID，可用于 `clearInterval()` 手动停止。

**行为：**

- 每隔 30 秒调用一次 `heartbeat()`
- 每次发送前检查连接状态：如果已断开则自动清除定时器
- 必须在已连接状态下调用，否则抛出 `[RingSDK] 请先调用 ring.connect()`

**停止自动心跳：**

```js
const timerId = ring.startAutoHeartbeat()
// ...
clearInterval(timerId)
```

---

## 推荐用法

在连接成功后立即启动自动心跳：

```js
try {
  const conn = await ring.connect()
  console.log('已连接:', conn.deviceName)

  // 启动心跳保活，防止 BLE 被系统断开
  ring.startAutoHeartbeat()

} catch (e) {
  console.error('连接失败:', e.message)
}
```

断开连接后心跳会自动停止（内部检查 `isConnected()` 后会 `clearInterval`）。

> **提示：** iOS 和部分 Android 机型对空闲 BLE 连接的保持时间不同。建议始终在连接后启用自动心跳，以确保长时间测量（如睡眠数据读取）不会因连接断开而失败。
