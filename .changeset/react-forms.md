---
"@wucarson/facet-react": minor
---

React 表單整合：11 個會產生值的元件支援受控與非受控兩種用法，可直接接原生 `<form>` 與 React Hook Form（`Controller`）。

- 非受控：`defaultValue`／`defaultChecked`
- `name`：輸出隱藏欄位，原生表單送出、`FormData` 拿得到值（開關、勾選同原生：開啟時送 "on"）
- `ref`：指向可聚焦的元素（下拉、標籤搜尋＝輸入框；多選＝按鈕；日期＝日期欄）
- `onBlur`：焦點離開整個元件時呼叫（標記 touched）
- 新增 `disabled`：單選（整組）、分段切換、下拉、多選、日期、期間、時間、標籤搜尋
- 多選、日期、期間、時間、分段切換、開關的 `value`／`checked` 改成選填
- 日期選完後焦點回到日期欄；標籤搜尋的輸入字會跟著 `value` 更新
