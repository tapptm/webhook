import { Payload, Platforms } from "dialogflow-fulfillment";
import { getPoiByGroup } from "../services/PointOfInterest";
import { orderByDistance, getDistance } from "geolib";
import { imageUrl } from "../configs/urlpath";
import { Line, LineColumns, PointOfInterest } from "../dto/pointOfInterest.dto";

async function calculateDistance(
  intent: string,
  latitude: number,
  longitude: number
) {
  const poidata: PointOfInterest[] = await getPoiByGroup(intent);
  const distancePointofinterest = poidata.map((item) => {
    item.latitude = parseFloat(item.latitude);
    item.longitude = parseFloat(item.longitude);
    item.image = item.image
      ? `${imageUrl}/community/${parseInt(item.community_id)}/poi/${item.image}`
      : null;

    return {
      ...item,
      distance:
        getDistance(
          { latitude: latitude, longitude: longitude },
          { latitude: item.latitude, longitude: item.longitude }
        ) /
          1000 +
        " Km",
    };
  });

  const volunteers = orderByDistance(
    { latitude: latitude, longitude: longitude },
    distancePointofinterest
  );

  return volunteers;
}

async function getATMlocation(agent: {
  UNSPECIFIED: Platforms;
  rawPayload: boolean;
  sendAsMessage: boolean;
  intent: string;
  add: (add: Object) => void;
}) {
  const distanceData = await calculateDistance(
    agent.intent,
    14.9881753,
    102.1198264
  );

  const columns: LineColumns[] = distanceData.map((distance: any) => {
    return {
      text: distance.name,
      title: distance.name,
      imageBackgroundColor: "#FFFFFF",
      thumbnailImageUrl: distance.image,
      actions: [
        {
          type: "postback",
          uri: `#`,
          label: "รายละเอียด",
        },
        {
          label: "เปิดแผนที่",
          uri: `http://maps.google.com/maps?z=12&t=m&q=loc:${distance.latitude}+${distance.longitude}`,
          type: "postback",
        },
      ],
    };
  });

  const payload: Line = {
    line: {
      type: "template",
      altText: "สถานที่และรายละเอียด",
      template: {
        imageSize: "cover",
        columns: columns,
        imageAspectRatio: "rectangle",
        type: "carousel",
      },
    },
  };

  return agent.add(
    new Payload(agent.UNSPECIFIED, payload, {
      rawPayload: true,
      sendAsMessage: true,
    })
  );
}

export { getATMlocation };
