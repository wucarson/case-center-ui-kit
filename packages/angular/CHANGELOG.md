# @wucarson/facet-angular

## 0.2.0

### Minor Changes

- 04cb7d0: Angular 表單整合：11 個會產生值的元件（文字欄位、下拉、多選、日期、期間、時間、勾選、單選、開關、分段切換、標籤搜尋）支援 `formControlName`、`formControl`、`ngModel`。

  - 表單停用（`disable()`）時元件不能操作；勾選、單選、開關、欄位外框顯示停用樣式
  - 驗證不通過且碰過（touched）時，下拉與欄位外框自動顯示錯誤樣式
  - 欄位外框自動帶入必填星號（`Validators.required`）
  - 多選、日期、期間、時間的 `value` 不再是必填輸入（接表單時不用另給 `[value]`）
  - `selfLabelled`、`inlineMenu`、`single`、`invalid` 可寫成 HTML 屬性
  - 新增 peer 依賴 `@angular/forms`

- 349787d: 停用樣式：下拉、多選、日期、時間、標籤搜尋、分段切換、期間選擇停用時顯示同表單欄位的停用樣式（淡灰底、淡邊框、無陰影、文字改次要色），根元素加 `.dis`。

  - Angular：這 7 個元件與單選新增 `disabled` 輸入（不用表單時也能停用）
  - 契約：7 個元件加 `dis` class；分段切換、期間、時間的 `.dis` 與 `aria-disabled` 同步

### Patch Changes

- Updated dependencies [04cb7d0]
- Updated dependencies [349787d]
  - @wucarson/facet-core@0.2.0
  - @wucarson/facet-styles@0.2.0
