
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





// import mqtt from "mqtt";
// import express from "express";
// import { WebSocketServer } from "ws";
// import { configDotenv } from "dotenv";


// configDotenv()

// const port = process.env.PORT
// const broker = process.env.BROKER
// const username = process.env.USER_NAME
// const password = process.env.PASSWORD

// const app = express();
// const server = app.listen(port, () => {
//   console.log(`🚀 Bridge server running on http://localhost:${port}`);
// });





// const mqttClient = mqtt.connect(broker, { username, password });

// mqttClient.on("connect", () => {
//   console.log("✅ Connected to HiveMQ");
//   mqttClient.subscribe("test/topic");
// });

// // WebSocket Server
// const wss = new WebSocketServer({ server });
// wss.on("connection", (ws) => {
//   console.log("📡 Mobile app connected via WebSocket");
// });

// // Forward MQTT → WebSocket
// mqttClient.on("message", (topic, message) => {
//   console.log(`📥 MQTT [${topic}]: ${message}`);
//   wss.clients.forEach((client) => {
//     if (client.readyState === 1) {
//       client.send(message.toString());
//     }
//   });
// });






// import mqtt from "mqtt";
// import express from "express";
// import { WebSocketServer } from "ws";
// import { configDotenv } from "dotenv";

// configDotenv()
// const port = process.env.PORT || 3000;
// const broker = process.env.BROKER;
// const username = process.env.USER_NAME;
// const password = process.env.PASSWORD;
// const PURIFIER_TOPIC = "purifier/control"; // purifier device should subscribe here
// const PURIFIER_STATE_TOPIC = "purifier/state";
// const SENSOR_TOPIC = "test/topic"


// const app = express();

// // Middleware
// app.use(express.json());

// // Health check route
// app.get("/status", (req, res) => {
//   res.json({
//     ok: true,
//     activeClients,
//     mqttConnected: !!mqttClient?.connected,
//     time: new Date().toISOString(),
//   });
// });


// app.get("/", (req,res)=>{
//     res.send("Hello world!, Bridge server is alive")
// })



// // Purifier ON
// app.post("/purifier/on", (req, res) => {
//   if (!mqttClient || !mqttClient.connected) {
//     return res.status(500).json({ error: "MQTT not connected" });
//   }
//   mqttClient.publish(PURIFIER_TOPIC, "ON"); // publish command
//   res.json({ status: "ok", message: "Purifier ON command sent" });
// });


// // Purifier OFF
// app.post("/purifier/off", (req, res) => {
//   if (!mqttClient || !mqttClient.connected) {
//     return res.status(500).json({ error: "MQTT not connected" });
//   }
//   mqttClient.publish(PURIFIER_TOPIC, "OFF"); // publish command
//   res.json({ status: "ok", message: "Purifier OFF command sent" });
// });



// const server = app.listen(port, () => {
//   console.log(`🚀 Bridge server running on http://localhost:${port}`);
// });

// const wss = new WebSocketServer({ server });

// let mqttClient = null;
// let activeClients = 0;

// function connectMqtt() {
//   mqttClient = mqtt.connect(broker, { username, password });

//   mqttClient.on("connect", () => {
//     console.log("✅ Connected to HiveMQ");

//     // Subscribe to multiple topics with error handling
//     const topics = [SENSOR_TOPIC, PURIFIER_TOPIC, PURIFIER_STATE_TOPIC];
//     mqttClient.subscribe(topics, (err, granted) => {
//       if (err) {
//         console.error("❌ Failed to subscribe:", err);
//       } else {
//         console.log("✅ Subscribed to topics:", granted.map(g => g.topic).join(", "));
//       }
//     });
//   });

//   mqttClient.on("message", (topic, message) => {
//     console.log(`> MQTT [${topic}]: ${message}`);
//     // Send messages to all connected WebSocket clients
//     wss.clients.forEach((client) => {
//       if (client.readyState === 1) {
//         client.send(JSON.stringify({ topic, message: message.toString() }));
//       }
//     });
//   });
// }


// wss.on("connection", (ws) => {
//   activeClients++;
//   console.log(`^ Mobile connected (${activeClients} total)`);

//   if (!mqttClient) {
//     connectMqtt();
//   }

//   ws.on("close", () => {
//     activeClients--;
//     console.log(`x Mobile disconnected (${activeClients} left)`);

//     if (activeClients === 0 && mqttClient) {
//       console.log("No clients left → disconnecting from MQTT...");
//       mqttClient.end();
//       mqttClient = null;
//     }
//   });
// });
























import mqtt from "mqtt";
import express from "express";
import { WebSocketServer } from "ws";
import { configDotenv } from "dotenv";

configDotenv();
const port = process.env.PORT || 3000;
const broker = process.env.BROKER;
const username = process.env.USER_NAME;
const password = process.env.PASSWORD;

// Topics
const TOPIC_TELEMETRY     = "test/topic";
const TOPIC_PURIFIER_CTRL = "purifier/control";
const TOPIC_PURIFIER_STATE= "purifier/state";
const TOPIC_DEVICE_STATUS = "purifier/status";

const app = express();
app.use(express.json());

let mqttClient = null;
let activeClients = 0;
let purifierState = "OFF";   // track current state
let deviceStatus = "OFFLINE"; // track ONLINE/OFFLINE

// -------- MQTT connect --------
function connectMqtt() {
  mqttClient = mqtt.connect(broker, { username, password });

  mqttClient.on("connect", () => {
    console.log("✅ Connected to HiveMQ Cloud");
    deviceStatus = "ONLINE";

    mqttClient.subscribe([TOPIC_TELEMETRY, TOPIC_PURIFIER_CTRL, TOPIC_PURIFIER_STATE, TOPIC_DEVICE_STATUS], (err) => {
      if (err) console.log("❌ Subscribe failed", err);
    });
  });

  mqttClient.on("message", (topic, message) => {
    const msg = message.toString();
    console.log(`📥 MQTT [${topic}]: ${msg}`);

    // Track purifier state & device status
    if (topic === TOPIC_PURIFIER_STATE) purifierState = msg;
    if (topic === TOPIC_DEVICE_STATUS) deviceStatus = msg;

    // Broadcast to all WS clients
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ topic, message: msg }));
      }
    });
  });

  mqttClient.on("close", () => {
    console.log("⚠️ MQTT disconnected");
    deviceStatus = "OFFLINE";
  });
}

// -------- WebSocket server --------
const server = app.listen(port, () => console.log(`🚀 Bridge server running on http://localhost:${port}`));
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  activeClients++;
  console.log(`^ Mobile connected (${activeClients} total)`);

  // Connect MQTT if needed
  if (!mqttClient) connectMqtt();

  // Send current state immediately
  ws.send(JSON.stringify({ topic: TOPIC_PURIFIER_STATE, message: purifierState }));
  ws.send(JSON.stringify({ topic: TOPIC_DEVICE_STATUS, message: deviceStatus }));

  ws.on("close", () => {
    activeClients--;
    console.log(`x Mobile disconnected (${activeClients} left)`);
    if (activeClients === 0 && mqttClient) {
      console.log("No clients → disconnecting MQTT...");
      mqttClient.end();
      mqttClient = null;
    }
  });
});

// -------- REST endpoints --------
app.get("/", (req, res) => res.send("Hello world! Bridge server is alive"));

app.get("/status", (req, res) => {
  res.json({
    ok: true,
    activeClients,
    mqttConnected: !!mqttClient?.connected,
    purifierState,
    deviceStatus,
    time: new Date().toISOString(),
  });
});

app.post("/purifier/on", (req, res) => {
  if (!mqttClient || !mqttClient.connected)
    return res.status(500).json({ error: "MQTT not connected" });

  mqttClient.publish(TOPIC_PURIFIER_CTRL, "ON", { qos: 1 });
  res.json({ status: "ok", message: "Purifier ON command sent" });
});

app.post("/purifier/off", (req, res) => {
  if (!mqttClient || !mqttClient.connected)
    return res.status(500).json({ error: "MQTT not connected" });

  mqttClient.publish(TOPIC_PURIFIER_CTRL, "OFF", { qos: 1 });
  res.json({ status: "ok", message: "Purifier OFF command sent" });
});
