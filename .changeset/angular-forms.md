---
"@wucarson/facet-angular": minor
"@wucarson/facet-core": minor
---

Angular 表單整合：11 個會產生值的元件（文字欄位、下拉、多選、日期、期間、時間、勾選、單選、開關、分段切換、標籤搜尋）支援 `formControlName`、`formControl`、`ngModel`。

- 表單停用（`disable()`）時元件不能操作；勾選、單選、開關、欄位外框顯示停用樣式
- 驗證不通過且碰過（touched）時，下拉與欄位外框自動顯示錯誤樣式
- 欄位外框自動帶入必填星號（`Validators.required`）
- 多選、日期、期間、時間的 `value` 不再是必填輸入（接表單時不用另給 `[value]`）
- `selfLabelled`、`inlineMenu`、`single`、`invalid` 可寫成 HTML 屬性
- 新增 peer 依賴 `@angular/forms`
