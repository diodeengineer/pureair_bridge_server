
// import mqtt from "mqtt";

// const broker = "mqtt://broker.hivemq.com"; // free public HiveMQ broker
// const topic = "test/topic";

// const client = mqtt.connect(broker);

// client.on("connect", () => {
//   console.log("✅ Connected to HiveMQ broker");
//   client.subscribe(topic, (err) => {
//     if (!err) {
//       console.log(`📩 Subscribed to topic: ${topic}`);
//     }
//   });
// });

// client.on("message", (topic, message) => {
//   console.log(`📥 Received: ${message.toString()}`);
//   // later: save to DB or trigger API
// });






// import mqtt from "mqtt";  
  




// const client = mqtt.connect(broker, {
//   username,
//   password,
//   protocol: "mqtts",
// });

// client.on("connect", () => {
//   console.log("✅ Connected to HiveMQ Cloud broker");
//   client.subscribe("test/topic", () => {
//     console.log("📩 Subscribed to topic: test/topic");
//   });
// });

// client.on("message", (topic, message) => {
//   console.log(`📥 Received [${topic}]: ${message.toString()}`);
// });





import mqtt from "mqtt";
import express from "express";
import { WebSocketServer } from "ws";
import { configDotenv } from "dotenv";


configDotenv()

const port = process.env.PORT
const broker = process.env.BROKER
const username = process.env.USER_NAME
const password = process.env.PASSWORD

const app = express();
const server = app.listen(port, () => {
  console.log(`🚀 Bridge server running on http://localhost:${port}`);
});





const mqttClient = mqtt.connect(broker, { username, password });

mqttClient.on("connect", () => {
  console.log("✅ Connected to HiveMQ");
  mqttClient.subscribe("test/topic");
});

// WebSocket Server
const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
  console.log("📡 Mobile app connected via WebSocket");
});

// Forward MQTT → WebSocket
mqttClient.on("message", (topic, message) => {
  console.log(`📥 MQTT [${topic}]: ${message}`);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message.toString());
    }
  });
});
