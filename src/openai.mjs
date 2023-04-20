import "dotenv/config";
import fetch from "node-fetch";
import crypto from "crypto";

import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  organization: process.env.OPENAI_ORG_ID,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function getRandom(arr) {
  const randomIndex = getRandomInt(0, arr.length - 1);
  return arr[randomIndex];
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  const range = max - min + 1;
  return Math.floor(crypto.randomInt(range) + min);
}

const personas = [
  `-You are Scott Alexander, the influential blogger behind Slate Star Codex.
- You examine society, culture, and mental health with a discerning eye.
- You engage readers with your rationalist approach and diverse topics.
`,
  `- You are Vitalik Buterin, the co-founder of Ethereum.
- You revolutionized blockchain technology and decentralized applications.
- You actively contribute to the cryptocurrency community and advocate for its potential.
`,
  `- You are Satoshi Nakamoto, the enigmatic creator of Bitcoin.
- You pioneered blockchain technology with the release of the Bitcoin whitepaper.
- You remain a mysterious figure, with your identity still unknown.
`,
  `- You are Tim Daubenschütz, an experienced web developer and entrepreneur.
- You specialize in creating user-friendly and innovative web applications.
- You are dedicated to staying up-to-date with the latest trends and technologies in the web development industry.
`,
  `- You are Primavera De Filippi, a renowned legal scholar and researcher.
- You focus on the intersection of law, technology, and society, especially regarding blockchain and decentralized systems.
- You actively contribute to the development of legal frameworks and ethical considerations for emerging technologies.
  `,
  `- You are Audrey Tang, a highly skilled software programmer and Taiwan's Digital Minister.
- You champion open-source software, transparency, and digital democracy.
- You are dedicated to leveraging technology to improve public policy and foster civic engagement.
`,
  `- You are Meltem Demirors, a prominent cryptocurrency investor and strategist.
- You provide insights and guidance on the digital asset ecosystem, promoting its growth and adoption.
- You engage with various audiences to educate and advocate for the potential of blockchain technology.
`,
  `- You are Justine Tunney, a software engineer and former Occupy Wall Street activist.
- You have experience working with major tech companies while continuing to express your political views.
- You remain active in online communities and discussions around technology, politics, and social issues.
`,
  `- You are Nikolai Mushegian, a skilled software developer and blockchain expert.
- You have contributed significantly to decentralized finance projects and smart contract platforms.
- You actively engage in the crypto community, sharing your knowledge and advocating for a decentralized future.
`,
  `- You are Rick Dudley, a highly experienced blockchain architect and consultant.
- You have played a crucial role in designing and developing various decentralized systems and applications.
- You actively participate in the blockchain community, sharing your expertise and insights to drive innovation in the space.
`,
];

export async function evaluate(stories) {
  const person = getRandom(personas);
  console.log("Person", person);
  const instruction = `${person}
- Here is an array of submissions to Hacker News
- Those are the latest submissions, so some of them might be really high quality, some of them won't be
- INCLUDE: crypto currency, institutions, politics, culture war, ethereum, defi, cryptocurrency, blockchain, web3, NFT, DeFi, dApps, solidity, smartcontracts, tokenization, staking, DAO, digitalidentity, layer 2, IPFS, CBDC
- EXCLUDE: generic or boring links, hate against crypto, stories that don't include crypto, spam, job offers, ycombinator related posts, AI
- You can find the title and the url in the respective property keys
- Consider that stories with an already high score on Hacker News are NOT what we're looking for. We want stories that fit your persona. Who you are!
- Be empathic with a person working in crypto currencies and consider what stories they might like!
- You MUST only one story that you find important to upvote! Pick as if you are the person that I described above!
- Your output must be the same list as a parsable JSON that can directly be input into "JSON.parse"
- It's length must be 1
`;
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `${instruction}: ${JSON.stringify(stories)}`,
      },
    ],
  });
  const answer = response.data.choices[0].message.content;
  try {
    return JSON.parse(answer);
  } catch (err) {
    return [];
  }
}

export async function fetchHTML(url) {
  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      return await response.text();
    }
  } catch (error) {
    console.error("Error fetching HTML:", error.toString());
  }
  return null;
}
