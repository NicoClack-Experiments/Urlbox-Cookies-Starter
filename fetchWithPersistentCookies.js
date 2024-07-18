// The file path of your cookies.json file to start from and update with each request
const COOKIES_FILE_PATH = "secret/storage/cookies.json";
// The URL of the site you want to take a screenshot of
const SITE_URL = "...";

import { readFile, writeFile } from "fs/promises";
import setCookie from "set-cookie-parser";

const cookieJSON = JSON.parse(
  await readFile(COOKIES_FILE_PATH, { encoding: "utf8" })
);

const res = await fetch(SITE_URL, {
  headers: {
    // Cookie values aren't required to be URL encoded so if they are, the percentage codes will already be in cookie.value instead of the corresponding symbols
    cookie: cookieJSON
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; "),
  },
});
res.body?.cancel(); // Only the headers are needed

const parsedCookies = setCookie.parse(res);
parsedCookies.forEach((cookie) => {
  const existing = cookieJSON.find(
    (oldCookie) => oldCookie.name === cookie.name
  );

  if (existing) {
    existing.value = cookie.value;
  } else cookieJSON.push(cookie);
});

await writeFile(COOKIES_FILE_PATH, JSON.stringify(cookieJSON), {
  encoding: "utf8",
});

// Send a Urlbox request in the same way as index.js
