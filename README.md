# AIビジネスニュース

日本・海外のAIビジネスニュースを、独自の日本語要約、注目する理由、出典と日付付きで蓄積する公開アーカイブです。公開してよい記事要約と出典情報のみを掲載します。

## 配信・表示方針

- 毎朝8:00（Asia/Tokyo）に、前日の日本時間に公開された重要な記事を対象にします。初回予定は2026年10月5日です。
- 企業規模・業種・ベンダーを限定せず、具体的なAIの業務活用、仕事に影響する機能・サービス、動向を調べます。件数上限や地域別の割当は設けません。
- 一つの一覧にまとめ、各記事の先頭に「日本」または「海外」を表示します。地域別のセクションには分割しません。
- 要約は独自に2〜3文で作成し、原文全文を転載しません。公開日と出来事の日付を分け、企業の自己申告・試算は明記します。
- 公開時刻やタイムゾーンを推測して日本時間に換算しません。対象日に当たるかを確かめられない記事は日次記事に混ぜず、確認上の限界を記します。
- 同じニュースの地域別・媒体別・日をまたいだ重複を避けます。重要な追加事実がある場合は、その更新点を明示します。

## 保存先

| ファイル | 内容 |
| --- | --- |
| `data/editions/YYYY-MM-DD.json` | 日付別の構造化データ。ファイル名は対象ニュースの日付（sourceDate / JST） |
| `digests/YYYY-MM-DD.md` | 同じ対象ニュース日の人が読める日本語版 |
| `html/ai-business-news-YYYY-MM-DD.html` | 対象ニュース日（sourceDate）ごとの単独で開けるHTML |
| `data/feed.json` | 最新版と同じJSON。初回前は記事なしの `pending` |
| `data/index.json` | 公開済み版の索引。新しい対象ニュース日を先に並べる |
| `data/feed.schema.json` | JSON形式の定義 |
| `templates/edition.json` / `templates/digest.md` | 次回分の雛形。実記事ではない |
| `index.html` / `app.js` / `styles.css` | 最新JSONを読む軽量リーダー。ビルド・外部素材・認証情報は不要 |
| `previews/` | 別途作成した試作版。日次配信と混同しない |

`editionDate` は配信日、`sourceDate` はその前日の日本時間の日付です。JSON・Markdown・HTMLのファイル名はすべて `sourceDate` に合わせます（例：10月5日配信は `2026-10-04`）。記事は単一の `articles` 配列に格納します。`region` は `japan` または `world`、`category` は `business_case`、`product`、`trend` です。

## 日次更新手順

1. 直近の配信済みJSONを読み、記事ID・原文URL・同じ出来事の重複を確認します。
2. 出典と公開日を確認し、`data/feed.schema.json` に沿った完成版を作ります。`updatedAt` はタイムゾーン付きの実際の更新日時です。
3. 確認が十分なら `ready`、一部情報源に到達できないなどの制約が残る場合は `partial` にし、`notice` に具体的な限界を書きます。重要な対象記事が見つからなければ空配列のまま正直に記します。
4. sourceDateをファイル名にした日付別JSONとMarkdownを保存し、同じJSONで `data/feed.json` を更新します。
5. `data/index.json` の `editions` に `{ "editionDate": "配信日", "sourceDate": "対象日", "jsonPath": "data/editions/対象日.json", "markdownPath": "digests/対象日.md", "htmlPath": "html/ai-business-news-対象日.html", "status": "ready" }` を追加します。同じsourceDateは二重登録せず更新します。
6. 保存後に読んで内容を検証します。既存ファイルの更新では最新のblob SHAを取得して競合を防ぎます。

日次処理は外部の予約タスクが担当します。このリポジトリにはGitHub Actions、APIキー、認証情報、公開用の配信先は追加していません。初回の自動保存は実行後に別途確認します。

## リーダーと試作版

GitHub上ではMarkdown版をそのまま読めます。`previews/recent-ai-business-news-through-2026-10-03.html` は単独で開ける、2026年10月3日までの最近の話題を集めた試作版です。収録記事は9月22日〜10月1日公開分で、10月3日公開分だけの日次ニュースではありません。

`index.html` は `data/feed.json` を読み込むリーダーの土台です。HTTP配信環境が必要です。ホスティングはまだ設定しておらず、このリポジトリを作っただけでは公開サイトになりません。試作版にはブラウザーの音声読み上げと速度調整があります。日次HTMLの改善は別途追加できます。

## 2026年10月8日配信の注記

この版は10月7日のニュース7件に、公式ページの表示日が10月6日のOpenAI数学研究記事を加えた8件です。OpenAI記事は直近の発表として掲載し、日本時間の初出日は未確定のため `publicationDateJst: null` と明記しています。日付別HTMLには同じ8件を扱う男女のラジオ音声を内蔵しています。

