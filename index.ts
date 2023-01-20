import express, { Express, Request, Response } from "express";
import { getlocationPointOfInterest } from "./src/handles/handlePointOfInterest";
import { getlocationRestaurants } from "./src/handles/handleRestaurant";
import { getlocationActivitys } from "./src/handles/handleActivity";
import { getlocationHotels } from "./src/handles/handleHotel";
import { sessionClient, sessionPath } from "./src/configs/dialogflow";
import { replyMessage } from "./src/services/linesdk/linesdk.service";
import { postToDialogflow } from "./src/services/dialogflows/dialogflow.service";
import { saveChats, getChats } from "./src/models/chatHistorys";
import dotenv from "dotenv";

dotenv.config();
const app: Express = express();
const port = process.env.NODE_PORT || 4050;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Server Is Working......");
});

app.post("/webhooks", async function (req: Request, res: Response) {
  const event = req.body.events[0];
  console.log(req.body.events);
  const requestIntent = {
    session: sessionPath,
    queryInput: {
      text: {
        text: event.message.text,
        languageCode: "th-TH",
      },
    },
  };

  if (event.type === "message" && event.message.type === "text") {
    try {
      await postToDialogflow(req);
      console.log("TEST OK");

      const responses = await sessionClient.detectIntent(requestIntent);
      const result: any = responses[0].queryResult;
      const intent = result.intent.displayName;

      if (
        intent === "โรงพยาบาล" ||
        intent === "ร้านค้า" ||
        intent === "ปั้มน้ำมัน" ||
        intent === "ธนาคาร" ||
        intent === "ตลาด" ||
        intent === "ร้านค้า" ||
        intent === "ร้านกาแฟ" ||
        intent === "ร้านซ่อมรถ" ||
        intent === "ร้านถ่ายรูป" ||
        intent === "วัด" ||
        intent === "ร้านอาหาร" ||
        intent === "ศาลเจ้าพ่อ" ||
        intent === "สถานีตำรวจ" ||
        intent === "สถานีรถไฟ" ||
        intent === "ที่พัก" ||
        intent === "กิจกรรม"
      ) {
        await saveChats(
          event.source.userId,
          result.intent.displayName,
          event.message.text
        );
      }
    } catch (error: any) {
      res.send({ message: error.message });
    }
  } else if (event.type === "message" && event.message.type === "location") {
    // console.log(pvi);
    try {
      const chats = await getChats(event.source.userId);
      let lastChat = chats[chats.length - 1];
      console.log("LAST_CHAT", lastChat);
      console.log(lastChat.intent_name);

      if (lastChat.intent_name === "ร้านอาหาร") {
        console.log('FOOD ON');  
        return await getlocationRestaurants({
          intent: lastChat.intent_name,
          latitude: event.message.latitude,
          longitude: event.message.longitude,
          userId: event.source.userId,
        });
      } else if (lastChat.intent_name === "ที่พัก") {
        console.log('HOTEL ON');
        await getlocationHotels({
          intent: lastChat.intent_name,
          latitude: event.message.latitude,
          longitude: event.message.longitude,
          userId: event.source.userId,
        });
      } else if (lastChat.intent_name === "กิจกรรม") {
        console.log('ACTIVITY ON');       
        await getlocationActivitys({
          intent: lastChat.intent_name,
          latitude: event.message.latitude,
          longitude: event.message.longitude,
          userId: event.source.userId,
        });
      } else {
        console.log('POI ON');  
        await getlocationPointOfInterest({
          intent: lastChat.intent_name,
          latitude: event.message.latitude,
          longitude: event.message.longitude,
          userId: event.source.userId,
        });
      }
    } catch (error: any) {
      res.send({ message: error.message });
    }
  } else {
    replyMessage(
      event.source.userId,
      `Sorry, this chatbot did not support message type ${event.message.type}`
    );
  }
});

app.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});
