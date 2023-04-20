// kiwinews.mjs
import { Wallet } from "ethers";
import fs from "fs/promises";

export async function walletFromKeystore(keystorePath, password) {
  const keystore = await fs.readFile(keystorePath, "utf8");
  const wallet = await Wallet.fromEncryptedJson(keystore, password);
  return wallet;
}

export async function sendStory(title, url, signer) {
  const EIP712_DOMAIN = {
    name: "kiwinews",
    version: "1.0.0",
    salt: "0xfe7a9d68e99b6942bb3a36178b251da8bd061c20ed1e795207ae97183b590e5b",
  };

  const EIP712_TYPES = {
    Message: [
      { name: "title", type: "string" },
      { name: "href", type: "string" },
      { name: "type", type: "string" },
      { name: "timestamp", type: "uint256" },
    ],
  };

  const message = {
    title: title,
    href: url,
    type: "amplify",
    timestamp: Math.floor(Date.now() / 1000),
  };

  const signature = await signer._signTypedData(
    EIP712_DOMAIN,
    EIP712_TYPES,
    message
  );
  const body = JSON.stringify({
    ...message,
    signature,
  });

  const host = "http://localhost:3000";
  console.log("Submitting", title, url);
  try {
    await fetch(`${host}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
  } catch (error) {
    console.error(error);
  }
}
