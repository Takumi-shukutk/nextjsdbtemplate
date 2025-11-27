2025年度の淑徳アドバンス「プログラミング<ハイレベル>」講座のテンプレート（その2）です。

## テンプレートの使い方

1. このテンプレートを自分のGitHubアカウントにコピーします。
「Use this repository」→「Create a new repository」でコピーします。

2. GitHub Codespacesで開きます。
「Code」→「Create codespaces on main」で開きます。

3. ページの下部にターミナルという領域があります。「`$`」の後ろにいろいろコマンドを打てます。

4. 「`$`」の後ろにこれを打ってEnterで実行します。アプリが起動します。
```
npm run dev
```
アプリが起動しない場合は下記のコマンドで初期化します。
```
npm install
```

5. 起動したアプリは [http://localhost:3000](http://localhost:3000) で開けます。（3000のところは場合によって変わる可能性があります。）

6. アプリをいったん終了したいときは「Ctrl + C」で終了させます。

## データベースを作成する
このテンプレートではデータベースと接続する必要があります。
データベースはSupabaseを使用することを想定しています。
下記の手順でデータベースを作成、接続してください。

1. createdb.sqlの中のSQL文を、SupabaseのSQL Editorに入力してテーブルを作成する。

2. ルートディレクトリ（一番上のフォルダ）に「.env」ファイルを作成し、下記のコードを書く。
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```
`=` の右側はSupabaseの管理画面から探してコピペする。
 - NEXT_PUBLIC_SUPABASE_URL：Supabaseの管理画面で、Project Settings → Data API に記載
 - NEXT_PUBLIC_SUPABASE_ANON_KEY：Supabaseの管理画面で、Project Settings → API Key に記載（secretがついていない方）

## 開発を終えるときにやること
1. サイドバーにアイコンが5つ出てます。上から3つ目の「ソース管理」のアイコンを開きます。

2. メッセージを書いて「コミット」します。（メッセージはなんでもOK。「〇〇の機能を追加」みたいに変更点を書いとくことが多い。）

3. 「変更の同期」をします。これでGitHub上に変更が反映されます。

4. 次に開発を再開するときは、上記「テンプレートの使い方」の2から行えばOKです。

※ なお、Codespacesは起動しっぱなしだとそのうち無料枠を使い果たしてしまうので止めとくとよい。GitHubのリポジトリのページの「Code」ボタンのところからStopできる。ちなみにほっといても数分何もしなければ自動で止まるので心配はいらない。