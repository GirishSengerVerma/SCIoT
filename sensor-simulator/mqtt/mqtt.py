import certifi
import time
from typing import Callable

import paho.mqtt.client as mqtt
from paho.mqtt.client import ssl


class MQTTClient:
    def __init__(self, host: str, port: int, username: str, password: str):
        self.connected = False
        self.connection_failed = False
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

        self.client.tls_set(ca_certs=certifi.where(), tls_version=ssl.PROTOCOL_TLSv1_2)
        self.client.username_pw_set(username, password)

        try:
            self.client.connect(host, port)
            self.client.loop_start()
        except Exception as e:
            print('Connection to MQTT broker failed:')
            raise e

        print('Connecting to MQTT broker..')
        while not self.connected and not self.connection_failed:
            print('Still waiting for connection..')
            time.sleep(1)

        if self.connection_failed:
            self.client.loop_stop()
            quit()

        self.client.loop_start()
        self.client.subscribe('sensors/added')
        self.client.subscribe('sensors/deleted')
        self.client.subscribe('sensors/metadata/+/+')
        self.listeners = []

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self.connected = True
        else:
            self.connection_failed = True

    def on_disconnect(self, client, userdata, rc):
        self.connected = False

    def on_message(self, client, userdata, msg):
        for listener in self.listeners:
            listener(client, userdata, msg)

    def add_listener(self, listener: Callable):
        self.listeners.append(listener)

    def disconnect(self):
        self.connected = False
        self.client.loop_stop()
        self.client.disconnect()
