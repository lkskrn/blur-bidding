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
    expirationTime: new Date(Date.now() + 1000000).toISOString(),
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

function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;

  cookieHeader.split(`;`).forEach(function (cookie) {
    let [name, ...rest] = cookie.split(`=`);
    name = name?.trim();
    if (!name) return;
    const value = rest.join(`=`).trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  return list;
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
  const parsedCookies = parseCookies(cookies);
  const challenge = await challengeResponse.json();
  console.log("/////// CHALLENGE ///////");
  console.log(challenge);
  const signature = await web3.eth.accounts.sign(
    challenge.message,
    account.privateKey
  );
  console.log("/////// SIGNATURE ///////");
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
  console.log("/////// ACCESS TOKEN ///////");
  console.log(accessToken);

  const refreshedCookiesResponse = await refreshCookies(cookies, accessToken);
  const refreshedCookiesJson = await refreshedCookiesResponse.json();
  const refreshedCookies = refreshedCookiesResponse.headers.get("set-cookie");
  console.log("/////// REFRESH COOKIES ///////");
  console.log(refreshedCookies);
  console.log("refreshedCookiesJson:");
  console.log(refreshedCookiesJson);

  const updatedCookies = `authToken=${accessToken}; ${cookies}`;

  const placeBidResponse = await placeBid(
    updatedCookies,
    "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d", // Bored Apes
    accessToken
  );
  console.log("/////// PLACE BID ///////");
  console.log(`${placeBidResponse.status} ${placeBidResponse.statusText}`);
  const placeBidResponseJson = await placeBidResponse.json();
  console.log("placeBidResponseJson:");
  console.log(placeBidResponseJson);
  const marketplaceData = placeBidResponseJson.signatures[0].marketplaceData;
  console.log("marketplaceData:");
  console.log(marketplaceData);
  const signData = placeBidResponseJson.signatures[0].signData;
  console.log("signData:");
  console.log(signData);
  const v = signData.value;
  const signBidMessage = `trader: ${v.trader}\nside: ${v.side}\nmatchingPolicy: ${v.matchingPolicy}\ncollection: ${v.collection}\ntokenId: ${v.tokenId}\namount: ${v.amount}\npaymentToken: ${v.paymentToken}\nprice: ${v.price}\nlistingTime: ${v.listingTime}\nexpirationTime: ${v.expirationTime}\nfees: ${v.fees}\nsalt: ${v.salt}\nextraParams: ${v.extraParams}\nnonce: ${v.nonce}\n`;
  console.log("signBidMessage:");
  console.log(signBidMessage);

  console.log("/////// SIGN BID ///////");
  const bidSignature = await web3.eth.accounts.sign(
    signBidMessage,
    account.privateKey
  );

  console.log("bidSignature:");
  console.log(bidSignature);

  console.log("/////// SUBMIT BID ///////");
  const submitBidResponse = await submitBid(
    updatedCookies,
    bidSignature.signature,
    marketplaceData
  );
  console.log(`${submitBidResponse.status} ${submitBidResponse.statusText}`);
  const submitBidResponseJson = await submitBidResponse.json();
  console.log("submitBidResponseJson:");
  console.log(submitBidResponseJson);
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
