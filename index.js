/*
	NOTE: You should use environment variables instead of hardcoding secrets so you
	can share your code without leaking them. I'd suggest using dotenv for this,
	just make sure to gitignore the .env file. I've just hardcoded them here for simplicity.
*/

// The file path of your cookies.json file
const COOKIES_FILE_PATH = "secret/storage/cookies.json";
// The Publishable Key in your dashboard (the first one)
const API_KEY = "...";
// The Secret Key in your dashboard (the second one)
const API_SECRET = "...";
// The URL of the site you want to take a screenshot of
const SITE_URL = "...";
// When set to true, the cookies are logged to the console instead of sending a request to Urlbox
const DEBUG_REQUEST = true;

import { readFile } from "fs/promises";
import Urlbox from "urlbox";
import open from "open";

const urlbox = Urlbox(API_KEY, API_SECRET);

const cookieJSON = JSON.parse(
  await readFile(COOKIES_FILE_PATH, { encoding: "utf8" })
);

const cookieOption = cookieJSON.map((cookie) => {
  // Cookie values aren't required to be URL encoded so if they are, the percentage codes will already be in cookie.value instead of the corresponding symbols
  let cookieStr = `${cookie.name}=${cookie.value}`;

  const strAttributes = new Map([
    // expirationDate isn't copied so all the cookies are turned into session cookies

    ["domain", "Domain"],
    ["path", "Path"],
    ["sameSite", "SameSite"],
  ]);
  for (const [atrName, atrSubheaderName] of strAttributes) {
    let cookieValue = cookie[atrName];

    // cookies.json uses some different values for the different modes of this
    if (atrName === "sameSite") {
      // Don't include the attribute
      if (cookieValue === "unspecified" || cookieValue == null) continue;

      if (cookieValue === "no_restriction") {
        cookieValue = "None";
      }
    }

    cookieStr += `; ${atrSubheaderName}=${cookieValue}`;
  }

  const boolAttributes = new Map([
    // No hostOnly or session

    ["httpOnly", "HttpOnly"],
    ["secure", "Secure"],
  ]);
  for (const [atrName, atrSubheaderName] of boolAttributes) {
    if (cookie[atrName]) {
      cookieStr += `; ${atrSubheaderName}`;
    }
  }

  return cookieStr;
});

if (DEBUG_REQUEST) {
  console.log(
    "Here are the cookies encoded in the format of Set-Cookie header values:"
  );
  console.log(cookieOption);
} else {
  const renderURL = urlbox.generateRenderLink({
    url: SITE_URL,
    cookie: cookieOption,
  });
  open(renderURL);
}
