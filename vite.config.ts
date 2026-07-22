/// <reference types="node" />

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/fukuchange-v2/' : '/',
  plugins: [vue()],
  // 直接將既有 data 資料夾作為唯讀靜態素材來源；例如 /images/body.png。
  publicDir: 'data',
})
