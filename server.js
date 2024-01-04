/* eslint-disable no-undef */
import fs from "fs";
import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";

const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 3000;
const posts = [
  { title: "POST1", description: "POST 1 DESCRIPTION" },
  { title: "POST2", description: "POST2 description" },
  { title: "POST3", description: "DESCRIPTION 3" },
];
const templateHtml = isProduction
  ? fs.readFileSync("./dist/client/index.html", "utf-8")
  : "";

const ssrManifest = isProduction
  ? await fs.readFile("./dist/client/ssr-manifest.json", "utf-8")
  : undefined;

const app = express();
let vite;

// ? Add vite or respective production middlewares
if (!isProduction) {
  vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(vite.middlewares);
} else {
  const sirv = (await import("sirv")).default;
  const compression = (await import("compression")).default;
  app.use(compression());
  app.use(
    "/",
    sirv("./dist/client", {
      extensions: [],
      gzip: true,
    })
  );
}

app.use("*", async (req, res, next) => {
  // ! Favicon Fix
  if (req.originalUrl === "/favicon.ico") {
    return res.sendFile(path.resolve("./public/vite.svg"));
  }

  // ! SSR Render - Do not Edit if you don't know what heare whats going on
  let template, render;
  try {
    if (!isProduction) {
      template = fs.readFileSync(path.resolve("./index.html"), "utf-8");
      template = await vite.transformIndexHtml(req.originalUrl, template);
      render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
    } else {
      template = templateHtml;
      render = (await import("./dist/server/entry-server.js")).render;
    }

    // const rendered = await render({ path: req.originalUrl }, ssrManifest);

    if (req.originalUrl.includes("/post/")) {
      const pattern = /\/post\/(\d+)/;
      const match = req.originalUrl.match(pattern);
      if (!match) return;
      const postId = parseInt(match[1], 10);
      console.log("Cumple con el patrón. ID del post:", postId);

      const post = posts[postId];
      const html = template
        .replace(`<!--app-html-->`, render ?? "")
        .replace(
          "<title>Vite + React + TS</title>",
          `<title>${post.title}</title>`
        )
        .replace("__META_OG_TITLE__", post.title)
        .replace("__META_OG_DESCRIPTION__", post.description)
        .replace("__META_DESCRIPTION__", post.description);

      res.status(200).setHeader("Content-Type", "text/html").end(html);
    } else {
      const html = template.replace(`<!--app-html-->`, render ?? "");
      res.status(200).setHeader("Content-Type", "text/html").end(html);
    }
  } catch (error) {
    vite.ssrFixStacktrace(error);
    next(error);
  }
});

// ? Start http server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
