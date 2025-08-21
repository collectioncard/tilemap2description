//TODO: Implement everything in this file
//

//LLM Implentation (Lorenzo Uk)
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0
});

import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const messages = [
  new SystemMessage("Translate the following from English into Italian"),
  new HumanMessage("hi!"),
];

await model.invoke(messages);