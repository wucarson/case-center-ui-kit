---
"@wucarson/facet-vue": minor
---

Vue 表單整合：11 個會產生值的元件支援標準 `v-model`（`modelValue`）；原本的 `v-model:value`、`v-model:checked` 照常可用。

- 新增 `disabled`：單選（整組）、分段切換、下拉、多選、日期、期間、時間、標籤搜尋
- 焦點離開元件時送出 `blur` 事件，給表單函式庫標記 touched（例：VeeValidate 的 `handleBlur`）
- 多選、日期、期間、時間、分段切換的 `value` 改成選填
