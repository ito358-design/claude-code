/**
 * 熊野の勝ち守り 購入希望フォームを作成する Google Apps Script
 * 実行後、ログに編集用URLと回答用URLが出力されます。
 */
function createKumanoForm() {
  const form = FormApp.create('熊野の勝ち守り 購入希望フォーム');

  form.setDescription(
    '和田裕美さんおすすめの「熊野の勝ち守り」の購入希望者を取りまとめます。\n\n' +
    'お守り代：1個1,500円＋送料\n\n' +
    '購入をご希望の方は、以下の項目をご入力ください。\n\n' +
    '送付先住所の確認やお支払いについては、後ほど事務局よりご案内する予定です。\n\n' +
    '※LINEオープンチャットでの表示名は任意です。'
  );

  // 1. お名前（必須）
  form.addTextItem()
    .setTitle('お名前（本名・フルネーム）')
    .setRequired(true);

  // 2. LINEオープンチャットでの表示名（任意）
  form.addTextItem()
    .setTitle('LINEオープンチャットでの表示名')
    .setHelpText('本名と表示名が異なる方は、ご入力いただけると助かります。')
    .setRequired(false);

  // 3. 希望個数（必須）
  form.addMultipleChoiceItem()
    .setTitle('希望個数')
    .setChoiceValues(['1個', '2個', '3個以上'])
    .setRequired(true);

  // 4. 「3個以上」の場合の個数（任意）
  form.addTextItem()
    .setTitle('「3個以上」を選んだ方の個数')
    .setHelpText('3個以上を選ばれた方は、具体的な個数をご入力ください。')
    .setRequired(false);

  Logger.log('編集用URL: ' + form.getEditUrl());
  Logger.log('回答用URL: ' + form.getPublishedUrl());
}
