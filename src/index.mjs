import crypto from "crypto";
import fetch from "node-fetch";
import { resolve } from "path";
import { homedir } from "os";

import { fetchHTML, evaluate } from "./openai.mjs";
import { walletFromKeystore, sendStory } from "./kiwinews.mjs";

const fetchNewStories = async () => {
  const hackerNewsApiUrl =
    "https://hacker-news.firebaseio.com/v0/newstories.json";
  const storyBaseUrl = "https://hacker-news.firebaseio.com/v0/item/";

  const response = await fetch(hackerNewsApiUrl);
  let storyIds = await response.json();

  const storyPromises = storyIds.map(async (storyId) => {
    const storyUrl = `${storyBaseUrl}${storyId}.json`;
    const storyResponse = await fetch(storyUrl);
    const storyData = await storyResponse.json();
    return storyData;
  });

  const stories = await Promise.all(storyPromises);
  return stories;
};

const API = "https://client.warpcast.com/v2/popular-casts-feed?limit=100";
async function fetchAndExtractURLs() {
  const response = await fetch(API);
  const data = await response.json();

  const casts = data.result.casts;
  const urls = [];

  casts.forEach((cast) => {
    const text = cast.text;
    const urlRegex = /https?:\/\/[^\s]+/g;
    const matches = text.match(urlRegex);

    if (matches) {
      matches.forEach((match) => {
        if (!urls.includes(match)) {
          urls.push(match);
        }
      });
    }
  });

  return urls;
}

function shuffle(array) {
  console.log("Shuffling stories");
  for (let i = array.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function main() {
  let urls = await fetchNewStories();
  urls = shuffle(urls);
  urls = urls
    .map((url) => ({
      score: url.score,
      title: url.title,
      url: url.url,
    }))
    .filter((url) => url.score < 10 && url.url && url.title)
    .slice(0, 30);

  const titlesAndUrls = [];
  let filtered = await evaluate(urls);
  console.log("filtered", filtered);
  const wallet = await walletFromKeystore(resolve("key"), process.env.PASSWORD);
  console.log(wallet);
  filtered = filtered.slice(0, 3);
  console.log("Starting to submit stories", filtered);
  for await (const story of filtered) {
    await sendStory(story.title, story.url, wallet);
  }
}

main();
