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

## EDINET の観測記録の先頭 / EDINET observation log heads

Daily heads of our hash-chained log of when we fetched each EDINET filing and when it was no longer available.

`evidence-heads.jsonl` には、金融庁 EDINET の開示書類を私たちが取得・観測した記録（台帳）の、その日の「鎖の先頭」を1日1行で足していきます。台帳には「いつ、どの書類を取得し、その内容の SHA-256 は何だったか」と「いつ取りに行ったら、もう公開されていなかったか」が1件1行で入っていて、各行が前の行のハッシュを持つ鎖になっています。

| 項目 | 中身 |
|---|---|
| `date_jst` | 行を足した日（日本時間） |
| `source_id` | 観測した源（`edinet`） |
| `schema` | 台帳の形式の版 |
| `entries` | その時点の台帳の件数 |
| `head` | 台帳の最後の行のハッシュ（鎖の先頭） |
| `prev_sha256` | このファイルの1つ前の行（改行を除く）の SHA-256。最初の行は `null` |

### これで確かめられること
- ある日の台帳の写しを私たちが示したとき、その最後の行のハッシュがこのファイルの `head` と一致すれば、その台帳に書かれた観測は、遅くともその行が公開された時点（GitHub の push の記録）には記録済みだったことになります。
- 台帳の過去の行を後から書き換えると、それ以降のハッシュが合わなくなります。

### これでは分からないこと
- 書類の内容が正しいこと（内容の責任は提出者と EDINET にあります）
- 公的な証明・認証（これは公証やタイムスタンプ局の認定を受けたものではありません。私たち自身の観測の記録です）

台帳そのもの・書類 ID の一覧・書類の本体は公開していません。

### 自分で検算する / Verify it yourself

私たちが台帳の写しをお渡しした場合は、次のコマンドで、写しが壊れていないこと、また公開済みの先頭と一致することを、手元で確かめられます。

```
node verify-evidence-ledger.mjs ledger.jsonl evidence-heads.jsonl
```

- 台帳の各行の連番と、前の行のハッシュと、その行自身のハッシュを計算し直します。
- `evidence-heads.jsonl` の行どうしの鎖と、写しの件数までの各日の `head` が一致するかを確かめます。
- すべて合えば `PASS` と終了コード 0、どこかが合わなければ、合わない行を示して終了コード 1 を返します。

If we give you a copy of the log, this command recomputes its chain and checks it against every daily head published here. It prints PASS (exit code 0), or the first entry that does not match (exit code 1).
