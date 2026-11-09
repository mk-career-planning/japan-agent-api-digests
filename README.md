# japan-agent-api-digests

日本の公的データを AI エージェント向けに返す道具（MCP / HTTP）の、**本番のデータベースの写しの指紋**を毎週ここに足していきます。

Weekly SHA-256 fingerprints of the production database backups behind our Japan public-data tools for AI agents.

## 何が入っているか / What is here

`digests.jsonl` の1行が1回の写しです。

| 項目 | 中身 |
|---|---|
| `date_jst` | 写しを取った日（日本時間） |
| `finished_at` | 写しが終わった時刻（UTC） |
| `databases` | データベースごとの、書き出した SQL の SHA-256 |
| `prev_sha256` | 1つ前の行（改行を除く）の SHA-256。最初の行は `null` |

データの中身と行数は入れていません。

## これで確かめられること / What this lets you check

- **後から作り直していないこと**：ある日の写しを私たちが示したとき、その SHA-256 がこの公開の記録と一致すれば、その写しはこの行が公開された時点にはすでに存在していたことになります。公開の時点は GitHub の push の記録で確かめられます。
- **過去の行を書き換えていないこと**：各行は前の行の SHA-256 を持つ鎖です。古い行を書き換えると、それ以降の `prev_sha256` が合わなくなります。

確かめ方（PowerShell）：写しを解凍した `.sql` について `Get-FileHash -Algorithm SHA256 <file>.sql`。鎖は各行の SHA-256 を次の行の `prev_sha256` と比べます。

## これでは分からないこと / What this does not prove

- データの中身が正しいこと（元の公的データの正しさは、それぞれの出典が保証するものです）
- 写しを取った時刻そのもの（分かるのは「遅くともこの行が公開された時点までに存在した」ことです）

写しの本体は公開していません。
