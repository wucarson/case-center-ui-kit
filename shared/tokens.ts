/**
 * 設計 token —— 主題：案管中心預設・匯出自元件展示牆 2026-11-23
 * 和 tokens.css 同一份值：JS 端（圖表、動畫、行內樣式）讀這裡，樣式表讀 CSS 變數。
 */
export const tokens = {
  color: {
    light: {
      page: "#edf1f7",
      surface: "#ffffff",
      soft: "#eef2f8",
      hover: "#e1e8f2",
      ink: "#111a2b",
      muted: "#34415a",
      weak: "#4f5d76",
      label: "#5b6880",
      line: "#cbd6e4",
      lineStrong: "#a7b6cc",
      lineSubtle: "#e3e9f2",
      primary: "#1f6fff",
      primaryDark: "#0f4fd0",
      onPrimary: "#ffffff",
      selectedFg: "#0b3fae",
      focus: "rgb(31 111 255 / .32)",
      glow: "rgb(31 111 255 / .45)",
      success: "#12b866",
      okBg: "#d5f6e3",
      okFg: "#0b7a43",
      warn: "#f59e0b",
      warnBg: "#ffe8b3",
      warnFg: "#9a4a00",
      danger: "#ef3340",
      dangerBg: "#ffdde1",
      dangerFg: "#c21a33",
      infoBg: "#dbe8ff",
      infoFg: "#1846c9",
      c1: "#1f6fff",
      c2: "#00a3b8",
      c3: "#8b5cf6",
      c4: "#f59e0b",
    },
    dark: {
      page: "#0c1220",
      surface: "#182135",
      soft: "#222d46",
      hover: "#2f3c5a",
      ink: "#f4f7fc",
      muted: "#c5cfe0",
      weak: "#aab7cd",
      label: "#9dabc4",
      line: "#34425f",
      lineStrong: "#52648a",
      lineSubtle: "#28344e",
      primary: "#6aa8ff",
      primaryDark: "#9cc5ff",
      onPrimary: "#071226",
      selectedFg: "#ffffff",
      focus: "rgb(106 168 255 / .45)",
      glow: "rgb(106 168 255 / .5)",
      success: "#34e08a",
      okBg: "#103a29",
      okFg: "#5fe9a2",
      warn: "#ffb84d",
      warnBg: "#43310c",
      warnFg: "#ffc660",
      danger: "#ff6b76",
      dangerBg: "#4a1a25",
      dangerFg: "#ff949c",
      infoBg: "#1b3264",
      infoFg: "#9cc5ff",
      c1: "#6aa8ff",
      c2: "#38d5e8",
      c3: "#b08cff",
      c4: "#ffb84d",
    },
  },
  radius: {
    xs: "6px",
    sm: "8px",
    control: "10px",
    tile: "12px",
    card: "20px",
    pill: "999px",
  },
  shadow: {
    light: {
      inset: "inset 0 1px 2px rgb(16 24 40 / .12), inset 0 0 0 1px rgb(16 24 40 / .04)",
      raise: "inset 0 1px 0 rgb(255 255 255 / .95), 0 1px 2px rgb(16 24 40 / .1), 0 4px 10px -3px rgb(16 24 40 / .14)",
      shadow: "inset 0 1px 0 rgb(255 255 255 / .95), 0 0 0 1px rgb(20 40 80 / .07), 0 2px 4px rgb(20 40 80 / .05), 0 12px 28px -8px rgb(30 70 150 / .18), 0 28px 56px -28px rgb(30 70 150 / .28)",
      shadowPop: "0 2px 6px rgb(16 24 40 / .1), 0 14px 30px -6px rgb(16 24 40 / .22)",
    },
    dark: {
      inset: "inset 0 1px 3px rgb(7 10 18 / .5)",
      raise: "inset 0 1px 0 rgb(255 255 255 / .1), 0 1px 2px rgb(7 10 18 / .4), 0 4px 10px -3px rgb(7 10 18 / .45)",
      shadow: "inset 0 1px 0 rgb(255 255 255 / .1), 0 0 0 1px rgb(7 10 18 / .3), 0 12px 28px -8px rgb(7 10 18 / .5), 0 28px 56px -28px rgb(7 10 18 / .65)",
      shadowPop: "0 2px 6px rgb(7 10 18 / .45), 0 14px 30px -6px rgb(7 10 18 / .6)",
    },
  },
  typography: {
    fontFamily: "'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang TC', 'Microsoft JhengHei', 'Noto Sans TC', sans-serif",
    levels: {
      display: { fontSize: "28px", lineHeight: "1.3", fontWeight: 600, letterSpacing: "-0.01em" },
      headline: { fontSize: "14px", lineHeight: "1.4", fontWeight: 600, letterSpacing: "0em" },
      title: { fontSize: "12px", lineHeight: "1.5", fontWeight: 600, letterSpacing: "0em" },
      body: { fontSize: "14px", lineHeight: "1.57", fontWeight: 400, letterSpacing: "0em" },
      label: { fontSize: "12px", lineHeight: "1.5", fontWeight: 600, letterSpacing: "0em" },
      caption: { fontSize: "12px", lineHeight: "1.5", fontWeight: 400, letterSpacing: "0em" },
      numeric: { fontSize: "28px", lineHeight: "1.3", fontWeight: 600, letterSpacing: "0em" },
    },
  },
  /** 間距：4px 為基準，元件內外距只用這組 */
  space: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
  },
  /** 控件高度：sm＝工具列、表格內；md＝一般欄位；lg＝表單送出、頁首 */
  control: {sm: "32px", md: "40px", lg: "48px"},
  motion: {
    /** 時長（已乘上主題的動態速度） */
    duration: { fast: 200, base: 420, slow: 560 },
    /** cubic-bezier 參數：spring＝有回彈（開關、勾選）；springSoft＝輕回彈（浮層、選中片滑動）；standard＝無回彈 */
    easing: { spring: [0.34,1.56,0.64,1], springSoft: [0.3,1.3,0.6,1], standard: [0.22,1,0.36,1] },
    /** 依序出現：每張間隔（ms）與總長上限 */
    stagger: { step: 55, max: 300 },
    /** 按下縮放 */
    pressScale: 0.96,
  },
  chart: {
    /** 分類色：只分辨「是哪一個」，不帶好壞 */
    series: { light: ["#1f6fff","#00a3b8","#8b5cf6","#f59e0b"], dark: ["#6aa8ff","#38d5e8","#b08cff","#ffb84d"] },
  },
  shape: {
    /** 介面風格：標準；頁籤樣式：auto */
    style: "standard",
    tabs: "auto",
  },
} as const;

export type Tokens = typeof tokens;
export type ThemeMode = 'light' | 'dark';
export type ColorToken = keyof Tokens['color']['light'];
export type TypeLevel = keyof Tokens['typography']['levels'];

/** cubic-bezier(...) 字串，給 CSS transition／Web Animations 用 */
export const easing = (name: keyof Tokens['motion']['easing']) => `cubic-bezier(${tokens.motion.easing[name].join(', ')})`;
