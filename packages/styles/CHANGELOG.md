# @wucarson/facet-styles

## 0.2.0

### Minor Changes

- 349787d: 停用樣式：下拉、多選、日期、時間、標籤搜尋、分段切換、期間選擇停用時顯示同表單欄位的停用樣式（淡灰底、淡邊框、無陰影、文字改次要色），根元素加 `.dis`。

  - Angular：這 7 個元件與單選新增 `disabled` 輸入（不用表單時也能停用）
  - 契約：7 個元件加 `dis` class；分段切換、期間、時間的 `.dis` 與 `aria-disabled` 同步
