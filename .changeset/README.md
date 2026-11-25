# 版號紀錄（changesets）

修改了套件（`packages/`）的 PR，要附一份變更說明：

```sh
npx changeset
```

選影響的套件、升級幅度（patch＝修正、minor＝新增元件或參數、major＝不相容的修改），寫一句說明。6 個 Facet 套件版號一起升。

合併進 `main` 後，CI 會開一個「Version Packages」PR，彙整版號與 CHANGELOG；合併那個 PR 才會發佈到 GitHub Packages。
