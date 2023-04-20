import "dotenv/config";
import fetch from "node-fetch";
import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  organization: process.env.OPENAI_ORG_ID,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function evaluate(stories) {
  console.log("Submitting stories to chatgpt for evaluation", stories);
  //const bodyRegex = /<body[^>]*>([\s\S]*?)<\/body>/i;
  //const bodyMatch = html.match(bodyRegex);
  //const bodyContent = bodyMatch ? bodyMatch[1] : "";

  //const titleRegex = /<title[^>]*>([\s\S]*?)<\/title>/i;
  //const titleMatch = html.match(titleRegex);
  //const titleContent = titleMatch ? titleMatch[1] : "";

  //const metaDataRegex = /<meta[^>]*>/gi;
  //const metaDataTags = html.match(metaDataRegex);

  // OLD
  //- Generate a <title> for this HTML.
  //- Don't include any special characters. It must be A-z
  //- For any title longer than 80 characters, shorten it.
  //- If you cannot find the <title> element, then come up with a < 80 characters summary
  //- Consider that we want to generate titles to submit them to Hacker News. So if a title sounds too generic for it only say "ERROR"
  //- The title must never be a generic description of the entire website. Instead, it should be about the specific sub page
  const instruction = `- Here is an array of submissions to Hacker News
- Those are the latest submissions, so some of them might be really high quality, some of them won't be
- INCLUDE: crypto currency, institutions, politics, culture war, ethereum, defi, cryptocurrency, blockchain, web3, NFT, DeFi, dApps, solidity, smartcontracts, tokenization, staking, DAO, digitalidentity, layer 2, IPFS, CBDC
- EXCLUDE: generic or boring links, hate against crypto, spam, job offers, ycombinator related posts, AI
- You can find the title and the url in the respective property keys
- Consider also including stories that already have a high "score" as they'll likely do well in the future.
- Be empathic with a person working in crypto currencies and consider what stories they might like!
- You MUST not return more than 3 stories in that list!
- Your output must be the same list as a parsable JSON that can directly be input into "JSON.parse"
`;

  //let content = url + titleContent + metaDataTags + bodyContent;
  //content = content.slice(0, 10000);

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
