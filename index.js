import Web3 from "web3";
import fetch from "node-fetch";
import fs from "fs";
import readline from "readline";
import consoleStamp from "console-stamp";

consoleStamp(console, "yyyy/mm/dd HH:MM:ss.l");

async function getChallenge(walletAddress) {
  const body = {
    walletAddress,
  };

  const response = await fetch("https://core-api.prod.blur.io/auth/challenge", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en;q=0.5",
      "content-type": "application/json",
      "sec-ch-ua": '"Not?A_Brand";v="8", "Chromium";v="108", "Brave";v="108"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "sec-gpc": "1",
      Referer: "https://blur.io/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: JSON.stringify(body),
    method: "POST",
    credentials: "include",
  });
  return response;
}

async function login(walletAddrers, challenge, messageHash, cookies) {
  const body = {
    message: challenge.message,
    walletAddress: walletAddrers,
    expiresOn: challenge.expiresOn,
    hmac: challenge.hmac,
    signature: messageHash,
  };
  const response = await fetch("https://core-api.prod.blur.io/auth/login", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en;q=0.5",
      "content-type": "application/json",
      "sec-ch-ua": '"Not?A_Brand";v="8", "Chromium";v="108", "Brave";v="108"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "sec-gpc": "1",
      cookie: cookies,
    },
    body: JSON.stringify(body),
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
  return response;
}

async function refreshCookies(cookies, authToken) {
  const response = await fetch("https://core-api.prod.blur.io/auth/cookie", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en;q=0.5",
      "content-type": "application/json",
      "sec-ch-ua": '"Not?A_Brand";v="8", "Chromium";v="108", "Brave";v="108"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "sec-gpc": "1",
      cookie: cookies,
      Referer: "https://blur.io/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: `{"authToken":"${authToken}"}`,
    method: "POST",
    credentials: "include",
  });
  return response;
}

async function submitBid(cookies, signature, marketplaceData) {
  const body = {
    signature,
    marketplaceData,
  };
  return await fetch(
    "https://core-api.prod.blur.io/v1/collection-bids/submit",
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en;q=0.9",
        "content-type": "application/json",
        "sec-ch-ua": '"Not?A_Brand";v="8", "Chromium";v="108", "Brave";v="108"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "sec-gpc": "1",
        cookie: cookies,
        Referer: "https://blur.io/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: JSON.stringify(body),
      method: "POST",
    }
  );
}

async function placeBid(cookies, contractAddress) {
  const body = {
    price: {
      unit: "BETH",
      amount: "0.01",
    },
    quantity: 1,
    expirationTime: new Date(Date.now() + 30).toISOString(),
    contractAddress: contractAddress,
  };
  console.log("placeBid.body:");
  console.log(body);

  console.log("placeBid.cookies:");
  console.log(cookies);

  return await fetch(
    "https://core-api.prod.blur.io/v1/collection-bids/format",
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en;q=0.8",
        "content-type": "application/json",
        "sec-ch-ua": '"Not?A_Brand";v="8", "Chromium";v="108", "Brave";v="108"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "sec-gpc": "1",
        cookie: cookies,
        Referer: "https://blur.io/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: JSON.stringify(body),
      method: "POST",
      mode: "cors",
    }
  );
}

async function blurBid(privateKey) {
  var web3 = new Web3(
    "wss://eth-mainnet.g.alchemy.com/v2/ujAP2FT6E7-oJWdWuSRaRNma4iXcdNhy"
  );
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  console.log(account.address);
  const challengeResponse = await getChallenge(account.address);
  const cookies = challengeResponse.headers.get("set-cookie");
  console.log("cookies:");
  console.log(cookies);
  const challenge = await challengeResponse.json();
  console.log("challenge:");
  console.log(challenge);
  const signature = await web3.eth.accounts.sign(
    challenge.message,
    account.privateKey
  );
  console.log("signature:");
  console.log(signature);
  const loginResponse = await login(
    account.address,
    challenge,
    signature.signature,
    cookies
  );

  const loginResponseJson = await loginResponse.json();
  console.log(loginResponse.status);
  const authCookies = loginResponse.headers.get("set-cookie");
  console.log(authCookies);
  console.log(loginResponseJson);
  const accessToken = loginResponseJson.accessToken;
  console.log(">>> accessToken <<<");
  console.log(accessToken);

  const refreshedCookiesResponse = await refreshCookies(cookies, accessToken);
  const refreshedCookiesJson = await refreshedCookiesResponse.json();
  const refreshedCookies = refreshedCookiesResponse.headers.get("set-cookie");
  console.log("refreshedCookies:");
  console.log(refreshedCookies);
  console.log("refreshedCookiesJson:");
  console.log(refreshedCookiesJson);

  const placeBidResponse = await placeBid(
    refreshedCookies,
    "0xd4e4078ca3495de5b1d4db434bebc5a986197782",
    accessToken
  );
  console.log("placeBidResponse:");
  console.log(`${placeBidResponse.status} ${placeBidResponse.statusText}`); // 403 Forbidden
  // TODO
  // const placeBidResponseJson = await placeBidResponse.json();
  // console.log("placeBidResponseJson:");
  // console.log(placeBidResponseJson);
  // const submitBidResponse = await submitBid(refreshedCookies);
  // console.log(`${submitBidResponse.status} ${submitBidResponse.statusText}`); // 403 Forbidden
}

async function readFile() {
  const fileStream = fs.createReadStream("private_keys.txt");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    console.log(
      `processing line ${line.substring(0, 4)}********${line.substring(
        line.length - 4
      )}`
    );
    await blurBid(line);
  }
}
readFile();
