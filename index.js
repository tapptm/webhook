const express = require("express");
const { WebhookClient ,Payload } = require("dialogflow-fulfillment");

const app = express();
const port = process.env.PORT || 4050;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server Is Working......");
});
/**
 * on this route dialogflow send the webhook request
 * For the dialogflow we need POST Route.
 * */
app.post("/webhook", (req, res) => {
  // get agent from request
  let agent = new WebhookClient({ request: req, response: res });
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
  const payload = {
     
    
      line: {
        type: "audio",
        originalContentUrl: "https://s3-ap-southeast-1.amazonaws.com/dezpax/b_files/audio_example.m4a",
        duration: 10000
      
    }
   
  };
  
  agent.add(
    new Payload(agent.UNSPECIFIED, payload, {rawPayload: true, sendAsMessage: true})
   );
}

app.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});
