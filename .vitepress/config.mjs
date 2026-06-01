import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/ring-sdk-doc/',
  lang: 'zh-CN',
  title: 'RingSDK',
  description: '智能戒指蓝牙通信 SDK 技术文档',
  cleanUrls: false,
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API 参考', link: '/api/ring-sdk' },
      { text: '协议', link: '/protocol-spec' },
      { text: '更新日志', link: '/changelog' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '微信小程序接入', link: '/guide/wechat-miniprogram' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'RingSDK 类', link: '/api/ring-sdk' },
            { text: '连接管理', link: '/api/connection' },
            { text: '健康数据读取', link: '/api/health-data' },
            { text: '事件系统', link: '/api/events' },
            { text: '心跳保活', link: '/api/heartbeat' },
            { text: '协议层', link: '/api/protocol' },
          ],
        },
      ],
    },
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/FgqGH/ring-sdk' },
    ],
    footer: {
      message: '基于青橙手环蓝牙协议规格书 V1.6.58',
      copyright: 'Copyright © 2025 QRing',
    },
    outline: {
      level: [2, 3],
      label: '本页目录',
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
  },
})
