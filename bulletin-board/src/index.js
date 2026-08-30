const MESSAGES_KEY = "messages";
const MAX_MESSAGES = 200;
const MAX_NAME_LEN = 30;
const MAX_BODY_LEN = 500;

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function formatDate(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function getMessages(env) {
  const raw = await env.BOARD_KV.get(MESSAGES_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveMessages(env, messages) {
  await env.BOARD_KV.put(MESSAGES_KEY, JSON.stringify(messages));
}

function renderPage(messages, error) {
  const items = messages
    .map(
      (m) => `
      <li class="post">
        <div class="post-head">
          <span class="post-name">${escapeHtml(m.name)}</span>
          <span class="post-date">${formatDate(m.createdAt)}</span>
        </div>
        <p class="post-body">${escapeHtml(m.body).replace(/\n/g, "<br>")}</p>
      </li>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>簡単掲示板</title>
<style>
  :root { color-scheme: light; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif;
    background: #f2f4f7;
    color: #222;
  }
  header {
    background: #2d3e50;
    color: #fff;
    padding: 20px;
    text-align: center;
  }
  header h1 { margin: 0; font-size: 1.4rem; }
  main {
    max-width: 640px;
    margin: 0 auto;
    padding: 16px;
  }
  form {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin-bottom: 20px;
  }
  label { display: block; font-size: 0.85rem; color: #555; margin-bottom: 4px; }
  input[type="text"], textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    margin-bottom: 12px;
    font-family: inherit;
  }
  textarea { resize: vertical; min-height: 80px; }
  button {
    background: #2d3e50;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
  }
  button:hover { background: #1c2733; }
  .error {
    background: #fdecea;
    color: #b3261e;
    padding: 10px 14px;
    border-radius: 6px;
    margin-bottom: 16px;
    font-size: 0.9rem;
  }
  ul.posts { list-style: none; margin: 0; padding: 0; }
  .post {
    background: #fff;
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .post-head {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #888;
    margin-bottom: 6px;
  }
  .post-name { font-weight: bold; color: #2d3e50; }
  .post-body { margin: 0; white-space: pre-wrap; word-break: break-word; }
  .empty { text-align: center; color: #999; padding: 40px 0; }
  footer { text-align: center; color: #999; font-size: 0.75rem; padding: 24px 0; }
</style>
</head>
<body>
<header>
  <h1>簡単掲示板</h1>
</header>
<main>
  ${error ? `<div class="error">${escapeHtml(error)}</div>` : ""}
  <form method="POST" action="/post">
    <label for="name">お名前</label>
    <input type="text" id="name" name="name" maxlength="${MAX_NAME_LEN}" placeholder="名無しさん">
    <label for="body">メッセージ</label>
    <textarea id="body" name="body" maxlength="${MAX_BODY_LEN}" required></textarea>
    <button type="submit">書き込む</button>
  </form>
  <ul class="posts">
    ${items || '<li class="empty">まだ書き込みはありません。最初の投稿をしてみましょう。</li>'}
  </ul>
</main>
<footer>Simple Bulletin Board · powered by Cloudflare Workers</footer>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      const messages = await getMessages(env);
      return new Response(renderPage(messages), {
        headers: { "content-type": "text/html; charset=UTF-8" },
      });
    }

    if (request.method === "POST" && url.pathname === "/post") {
      const form = await request.formData();
      const name = (form.get("name") || "").toString().trim().slice(0, MAX_NAME_LEN) || "名無しさん";
      const body = (form.get("body") || "").toString().trim().slice(0, MAX_BODY_LEN);

      const messages = await getMessages(env);

      if (!body) {
        return new Response(renderPage(messages, "メッセージを入力してください。"), {
          status: 400,
          headers: { "content-type": "text/html; charset=UTF-8" },
        });
      }

      messages.unshift({
        name,
        body,
        createdAt: new Date().toISOString(),
      });

      if (messages.length > MAX_MESSAGES) {
        messages.length = MAX_MESSAGES;
      }

      await saveMessages(env, messages);

      return Response.redirect(url.origin + "/", 303);
    }

    return new Response("Not Found", { status: 404 });
  },
};
