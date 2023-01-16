"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dialogflow_fulfillment_1 = require("dialogflow-fulfillment");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.NODE_PORT || 4050;
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Server Is Working......");
});
/**
 * on this route dialogflow send the webhook request
 * For the dialogflow we need POST Route.
 * */
app.post("/webhook", (req, res) => {
    // get agent from request
    let agent = new dialogflow_fulfillment_1.WebhookClient({ request: req, response: res });
    // create intentMap for handle intent
    let intentMap = new Map();
    // add intent map 2nd parameter pass function
    intentMap.set("webhook", handleWebHookIntent);
    intentMap.set("ทำไร", handleWhatAruYouDoing);
    // now agent is handle request and pass intent map
    agent.handleRequest(intentMap);
});
function handleWebHookIntent(agent) {
    agent.add("Hello I am Webhook demo How are you...");
}
function handleWhatAruYouDoing(agent) {
    agent.add("นอนอยู่");
}
app.listen(port, () => {
    console.log(`Server is running at port: ${port}`);
});
