
# import paho.mqtt.client as mqtt
# import time, random

# broker = "broker.hivemq.com"
# port = 1883
# topic = "test/topic"

# client = mqtt.Client()
# client.connect(broker, port, 60)

# while True:
#     value = random.randint(0, 100)
#     client.publish(topic, value)
#     print(f"Published: {value}")
#     time.sleep(2)





import paho.mqtt.client as mqtt
import ssl
import random
import time

#Dummy data guys put your real shits here
broker = "bjhbjb.s1.eu.hivemq.cloud"
port = 8883
username = "bjhbbh"
password = "fhjijijij"


topic = "test/topic"





# ---------------- Client Setup ----------------
client_id = f"python_pub_{random.randint(0,9999)}"
client = mqtt.Client(client_id=client_id, protocol=mqtt.MQTTv311)
client.username_pw_set(username, password)
client.tls_set(cert_reqs=ssl.CERT_NONE)     # insecure, for testing
client.tls_insecure_set(True)

# ---------------- Callbacks ----------------
def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print("✅ Connected successfully to HiveMQ Cloud!")
    else:
        print("❌ Connection failed, code:", rc)

def on_publish(client, userdata, mid):
    print("📤 Message published!")

client.on_connect = on_connect
client.on_publish = on_publish

# ---------------- Connect ----------------
client.connect(broker, port)
client.loop_start()  # start background network loop

# ---------------- Publish Messages ----------------
while True:
    msg = f"Hello HiveMQ Cloud 🚀 Value: {random.randint(0,100)}"
    result = client.publish(topic, msg)
    status = result[0]
    if status == 0:
        print(f"📩 Sent: {msg} to topic `{topic}`")
    else:
        print(f"❌ Failed to send message to topic {topic}")
    time.sleep(5)


