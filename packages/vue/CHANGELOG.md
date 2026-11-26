# @wucarson/facet-vue

## 0.2.0

### Minor Changes

- 37e68e6: Vue 表單整合：11 個會產生值的元件支援標準 `v-model`（`modelValue`）；原本的 `v-model:value`、`v-model:checked` 照常可用。

  - 新增 `disabled`：單選（整組）、分段切換、下拉、多選、日期、期間、時間、標籤搜尋
  - 焦點離開元件時送出 `blur` 事件，給表單函式庫標記 touched（例：VeeValidate 的 `handleBlur`）
  - 多選、日期、期間、時間、分段切換的 `value` 改成選填

### Patch Changes

- 349787d: 停用樣式：下拉、多選、日期、時間、標籤搜尋、分段切換、期間選擇停用時顯示同表單欄位的停用樣式（淡灰底、淡邊框、無陰影、文字改次要色），根元素加 `.dis`。

  - Angular：這 7 個元件與單選新增 `disabled` 輸入（不用表單時也能停用）
  - 契約：7 個元件加 `dis` class；分段切換、期間、時間的 `.dis` 與 `aria-disabled` 同步

- Updated dependencies [04cb7d0]
- Updated dependencies [349787d]
  - @wucarson/facet-core@0.2.0
  - @wucarson/facet-styles@0.2.0
