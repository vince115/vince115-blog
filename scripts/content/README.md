# 內容管理腳本

透過 Payload Local API 直接建立文章、專案與媒體，讀取 `.env.local` 的資料庫與 R2 設定。請在專案根目錄執行。

| 指令 | 用途 | 參數 |
| --- | --- | --- |
| `npm run content:post -- spec.json` | 建立文章（可一併上傳封面與內文圖片） | 欄位見 `create-draft.ts` 開頭註解 |
| `npm run content:project -- spec.json` | 建立專案 | 欄位見 `create-project.ts` 開頭註解 |
| `npm run content:covers -- covers.json` | 批次更換專案封面 | `[{ slug, path, alt }` 或 `{ slug, mediaId }]` |
| `npm run content:media -- <圖片路徑> <alt>` | 只上傳一張圖片，回傳媒體 id 與網址 | |

slug 已存在時，`content:post` 與 `content:project` 會直接報錯，不會覆蓋。
