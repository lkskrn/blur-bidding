import fetch from "node-fetch";
import fs from "fs";
import axios from "axios";
import readline from "readline";
import consoleStamp from "console-stamp";
import { ethers } from "ethers";
import HttpsProxyAgent from "https-proxy-agent";
import createHttpsProxyAgent from "https-proxy-agent";

consoleStamp(console, { format: ":date(HH:MM:ss)" });

const timeout = (ms) => new Promise((res) => setTimeout(res, ms));

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

async function getChallenge(walletAddress, proxyAgent) {
  const body = {
    walletAddress,
  };

  const response = await fetch(`https://core-api.prod.blur.io/auth/challenge`, {
    headers: defaultHeaders,
    body: JSON.stringify(body),
    method: "POST",
    credentials: "include",
    agent: proxyAgent,
  });
  return response;
}

async function login(
  walletAddrers,
  challenge,
  messageHash,
  cookies,
  proxyAgent
) {
  const body = {
    message: challenge.message,
    walletAddress: walletAddrers,
    expiresOn: challenge.expiresOn,
    hmac: challenge.hmac,
    signature: messageHash,
  };
  const response = await fetch(`https://core-api.prod.blur.io/auth/login`, {
    headers: {
      ...defaultHeaders,
      cookie: cookies,
    },
    body: JSON.stringify(body),
    method: "POST",
    mode: "cors",
    credentials: "include",
    agent: proxyAgent,
  });
  return response;
}

async function submitBid(cookies, signature, marketplaceData, proxyAgent) {
  const body = {
    signature,
    marketplaceData,
  };
  return await fetch(
    `https://core-api.prod.blur.io/v1/collection-bids/submit`,
    {
      headers: {
        ...defaultHeaders,
        cookie: cookies,
      },
      body: JSON.stringify(body),
      method: "POST",
      agent: proxyAgent,
    }
  );
}

async function placeBid(cookies, contractAddress, proxyAgent) {
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
    `https://core-api.prod.blur.io/v1/collection-bids/format`,
    {
      headers: {
        ...defaultHeaders,
        cookie: cookies,
      },
      body: JSON.stringify(body),
      method: "POST",
      mode: "cors",
      agent: proxyAgent,
    }
  );
}

async function blurBid(privateKey, proxyAgent) {
  const provider = new ethers.providers.JsonRpcProvider(
    "wss://eth-mainnet.g.alchemy.com/v2/ujAP2FT6E7-oJWdWuSRaRNma4iXcdNhy"
  );
  var wallet = new ethers.Wallet(privateKey, provider);
  console.log("|||||||||| BID USING WALLET ||||||||||");
  console.log(wallet.address);
  console.log(">>> CHALLENGE <<<");
  const challengeResponse = await getChallenge(wallet.address, proxyAgent);
  console.log(`${challengeResponse.status} ${challengeResponse.statusText}`);
  const cookies = challengeResponse.headers.get("set-cookie");
  const challenge = await challengeResponse.json();
  console.log(">>> SIGN FOR LOGIN <<<");
  const signature = await wallet.signMessage(challenge.message);
  console.log(signature);
  console.log(">>> LOGIN TO GET ACCESS TOKEN <<<");
  const loginResponse = await login(
    wallet.address,
    challenge,
    signature,
    cookies,
    proxyAgent
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
    console.log(`>>> PLACE BID ${contract} <<<`);
    const placeBidResponse = await placeBid(authCookies, contract, proxyAgent);
    console.log(`${placeBidResponse.status} ${placeBidResponse.statusText}`);
    const placeBidResponseJson = await placeBidResponse.json();
    const marketplaceData = placeBidResponseJson.signatures[0].marketplaceData;
    const signData = placeBidResponseJson.signatures[0].signData;
    const types = signData.types;
    const domain = signData.domain;
    const value = signData.value;

    console.log(">>> SIGN FOR BID <<<");
    const typedSignature = await wallet._signTypedData(domain, types, value);
    console.log(typedSignature);

    console.log(">>> SUBMIT BID <<<");
    const submitBidResponse = await submitBid(
      authCookies,
      typedSignature,
      marketplaceData,
      proxyAgent
    );
    console.log(`${submitBidResponse.status} ${submitBidResponse.statusText}`);
    const submitBidResponseJson = await submitBidResponse.json();
    console.log(submitBidResponseJson);
    await new Promise((r) => setTimeout(r, 1000));
  }
}

const sleep = (ms) =>
  new Promise((r) => {
    setTimeout(r, ms);
  });

async function readFile(proxy) {
  const fileStream = fs.createReadStream("private_keys.txt");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const proxyAgent = createHttpsProxyAgent(proxy.ip);

  for await (const line of rl) {
    await blurBid(line, proxyAgent);
    console.log("wait for the next run...");
    await sleep(10000);
  }
}

function parseFile(file) {
  let data = fs.readFileSync(file, "utf8");
  let array = data.split("\n").map((str) => str.trim());
  const proxyRegex =
    /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})@(\w+):(\w+)/;
  let proxyLists = [];

  array.forEach((proxy) => {
    if (proxy.match(proxyRegex)) {
      proxyLists.push({
        ip: `http://${proxy.split("@")[1]}@${proxy.split("@")[0]}`,
        limited: false,
        authFailed: false,
      });
    }
  });

  return proxyLists;
}

async function checkProxy(proxyList) {
  let checkedProxy = await Promise.all(
    proxyList.map(async (proxy) => {
      let axiosInstance = axios.create({
        httpsAgent: HttpsProxyAgent(proxy.ip),
      });
      await axiosInstance
        .get("https://api64.ipify.org/?format=json")
        .catch((err) => {
          console.log(
            `Proxy ${proxy.ip.split("@")[1]} check error: ${
              err?.response?.statusText
            }`
          );
          switch (err?.response?.status) {
            case 407:
              proxy.authFailed = true;
            case 429:
              proxy.limited = true;
          }
        });
      return proxy;
    })
  );

  return checkedProxy.filter((proxy) => !proxy.limited && !proxy.authFailed);
}

(async () => {
  let proxyList = parseFile("proxy.txt");
  console.log(`Found ${proxyList.length} proxies`);
  let validProxy = await checkProxy(proxyList);
  validProxy.length == proxyList.length
    ? console.log("All proxies are valid")
    : console.log(`Valid ${validProxy.length}/${proxyList.length} proxies`);

  if (validProxy.length > 0) {
    for (let i = 0; i < validProxy.length; i++) {
      try {
        await readFile(validProxy[i]);
      } catch (err) {
        console.log(err.message);
        await timeout(10000);
      }
      console.log("-".repeat(100));
    }
  } else
    console.log(
      "No working proxies found, please make sure the proxy is in the correct format"
    );
})();
