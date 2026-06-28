const fs = require("fs");
const path = require("path");

const providers = {
  groq: require("./groqProvider"),
};

const providerName = process.env.AI_PROVIDER || "groq";

if (!providers[providerName]) {
  throw new Error(`AI provider ${providerName} is not supported`);
}

module.exports = providers[providerName];
