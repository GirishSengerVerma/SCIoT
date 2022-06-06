from typing import Callable

import paho.mqtt.client as mqtt


MQTT_BROKER_COMMON_NAME = 'Tobias-PC'
MQTT_OVER_TLS_PORT = 8883
MQTT_CA_CERT_FILE_PATH = 'ca.crt'


class MQTTClient:
    def __init__(self, username: str, password: str):
        self.is_running = True
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.tls_set(MQTT_CA_CERT_FILE_PATH)
        # TODO If we have problems using TLS on different machines, consider disable host checking:
        # self.client.tls_insecure_set(True)
        self.client.username_pw_set(username, password)
        self.client.connect(MQTT_BROKER_COMMON_NAME, MQTT_OVER_TLS_PORT)
        self.client.subscribe('sensors/metadata/+/+')
        self.listeners = []

    def on_connect(self, client, userdata, flags, rc):
        pass

    def on_disconnect(self, client, userdata, rc):
        self.is_running = False

    def on_message(self, client, userdata, msg):
        for listener in self.listeners:
            listener(client, userdata, msg)

    def add_listener(self, listener: Callable):
        self.listeners.append(listener)

    def loop(self):
        while self.is_running:
            self.client.loop()

    def disconnect(self):
        self.client.disconnect()
        self.is_running = False
