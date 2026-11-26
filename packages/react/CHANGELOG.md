# @wucarson/facet-react

## 0.2.0

### Minor Changes

- 0d21d51: React 表單整合：11 個會產生值的元件支援受控與非受控兩種用法，可直接接原生 `<form>` 與 React Hook Form（`Controller`）。

  - 非受控：`defaultValue`／`defaultChecked`
  - `name`：輸出隱藏欄位，原生表單送出、`FormData` 拿得到值（開關、勾選同原生：開啟時送 "on"）
  - `ref`：指向可聚焦的元素（下拉、標籤搜尋＝輸入框；多選＝按鈕；日期＝日期欄）
  - `onBlur`：焦點離開整個元件時呼叫（標記 touched）
  - 新增 `disabled`：單選（整組）、分段切換、下拉、多選、日期、期間、時間、標籤搜尋
  - 多選、日期、期間、時間、分段切換、開關的 `value`／`checked` 改成選填
  - 日期選完後焦點回到日期欄；標籤搜尋的輸入字會跟著 `value` 更新

### Patch Changes

- 349787d: 停用樣式：下拉、多選、日期、時間、標籤搜尋、分段切換、期間選擇停用時顯示同表單欄位的停用樣式（淡灰底、淡邊框、無陰影、文字改次要色），根元素加 `.dis`。

  - Angular：這 7 個元件與單選新增 `disabled` 輸入（不用表單時也能停用）
  - 契約：7 個元件加 `dis` class；分段切換、期間、時間的 `.dis` 與 `aria-disabled` 同步

- Updated dependencies [04cb7d0]
- Updated dependencies [349787d]
  - @wucarson/facet-core@0.2.0
  - @wucarson/facet-styles@0.2.0
