import Web3 from "web3";
import fetch from "node-fetch";
import fs from "fs";
import readline from "readline";
import consoleStamp from "console-stamp";
import { ethers } from "ethers";

consoleStamp(console, "yyyy/mm/dd HH:MM:ss.l");

const defaultHeaders = {
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
};

async function getChallenge(walletAddress) {
  const body = {
    walletAddress,
  };

  const response = await fetch("https://core-api.prod.blur.io/auth/challenge", {
    headers: defaultHeaders,
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
      ...defaultHeaders,
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
      ...defaultHeaders,
      cookie: cookies,
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
        ...defaultHeaders,
        cookie: cookies,
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

  return await fetch(
    "https://core-api.prod.blur.io/v1/collection-bids/format",
    {
      headers: {
        ...defaultHeaders,
        cookie: cookies,
      },
      body: JSON.stringify(body),
      method: "POST",
      mode: "cors",
    }
  );
}

async function blurBid(privateKey) {
  const provider = new ethers.providers.JsonRpcProvider(
    "wss://eth-mainnet.g.alchemy.com/v2/ujAP2FT6E7-oJWdWuSRaRNma4iXcdNhy"
  );
  var wallet = new ethers.Wallet(privateKey, provider);
  console.log("/////// ADDRESS ///////");
  console.log(wallet.address);
  console.log("/////// CHALLENGE ///////");
  const challengeResponse = await getChallenge(wallet.address);
  console.log(`${challengeResponse.status} ${challengeResponse.statusText}`);
  const cookies = challengeResponse.headers.get("set-cookie");
  const challenge = await challengeResponse.json();
  console.log("/////// SIGN FOR LOGIN ///////");
  const signature = await wallet.signMessage(challenge.message);
  console.log(signature);
  console.log("/////// LOGIN TO GET ACCESS TOKEN ///////");
  const loginResponse = await login(
    wallet.address,
    challenge,
    signature,
    cookies
  );
  console.log(`${loginResponse.status} ${loginResponse.statusText}`);
  const loginResponseJson = await loginResponse.json();
  const accessToken = loginResponseJson.accessToken;
  const authCookies = `authToken=${accessToken}; ${cookies}`;

  const nftContracts = [
    "0xd4e4078ca3495de5b1d4db434bebc5a986197782",
    "0x23581767a106ae21c074b2276d25e5c3e136a68b",
    "0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b",
    "0xed5af388653567af2f388e6224dc7c4b3241c544",
    "0xbd3531da5cf5857e7cfaa92426877b022e612cf8",
    "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
    "0x60e4d786628fea6478f785a6d7e704777c86a7c6",
    "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258",
  ];
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };
  shuffleArray(nftContracts);
  for await (const contract of nftContracts) {
    console.log(`/////// PLACE BID ${contract} ///////`);
    const placeBidResponse = await placeBid(authCookies, contract, accessToken);
    console.log(`${placeBidResponse.status} ${placeBidResponse.statusText}`);
    const placeBidResponseJson = await placeBidResponse.json();
    const marketplaceData = placeBidResponseJson.signatures[0].marketplaceData;
    const signData = placeBidResponseJson.signatures[0].signData;
    const types = signData.types;
    const domain = signData.domain;
    const value = signData.value;

    console.log("/////// SIGN FOR BID ///////");
    const typedSignature = await wallet._signTypedData(domain, types, value);
    console.log(typedSignature);

    console.log("/////// SUBMIT BID ///////");
    const submitBidResponse = await submitBid(
      authCookies,
      typedSignature,
      marketplaceData
    );
    console.log(`${submitBidResponse.status} ${submitBidResponse.statusText}`);
    const submitBidResponseJson = await submitBidResponse.json();
    console.log(submitBidResponseJson);
  }
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
