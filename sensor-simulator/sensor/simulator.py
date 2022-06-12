import json
from threading import Thread
from typing import Optional
import time
from datetime import datetime

from mqtt.mqtt import MQTTClient

import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import matplotlib

from sensor.simulated_sensors import SimulatedSensor, SensorLocation, SENSOR_UNIT_REPRESENTATION_MAP, \
    SENSOR_MEASURE_COLOR_MAP, SensorSimulationMode, SensorSimulationBehavior

matplotlib.use("TkAgg")


class Simulator:
    """ Definition of a simulator that periodically senses the current data from all connected sensors.

        The simulator allows adding sensors to sense information from periodically.
        The interval (in ms) in which the simulator senses data from its sensors can be specified during construction.
    """

    def __init__(self, interval: int, mqtt_client: MQTTClient):
        self.interval: int = interval
        self.mqtt_client: MQTTClient = mqtt_client
        self.is_running: bool = False
        self.plot_animation: Optional[FuncAnimation] = None
        self.sensors: list[SimulatedSensor] = []

    def add_sensor(self, sensor: SimulatedSensor):
        self.sensors.append(sensor)

    def announce_sensors(self):
        for sensor in self.sensors:
            self.mqtt_client.client.publish(sensor.get_metadata_mqtt_topic_name(),
                                            sensor.get_metadata_mqtt_message())

    def on_mqtt_message(self, client, userdata, msg):
        if not msg.topic.startswith('sensors/metadata/'):
            return

        mqtt_message = json.loads(msg.payload)

        sensor = next(filter(lambda s: s.instance_id.lower() == mqtt_message['instanceId'].lower(), self.sensors))

        mode = next(filter(lambda m: m.name.lower() == mqtt_message['simulationMode']
                           .lower(), SensorSimulationMode))
        if sensor.mode != mode:
            sensor.change_mode(mode)

        behavior = next(filter(lambda b: b.name.lower() == mqtt_message['simulationBehavior']
                               .lower(), SensorSimulationBehavior))
        if sensor.behavior != behavior:
            sensor.change_behavior(behavior)

    def start(self):
        self.is_running = True

        def sensing_loop():
            while self.is_running:
                for sensor in self.sensors:
                    sensor.sense()
                    self.mqtt_client.client.publish(sensor.get_telemetry_data_mqtt_topic_name(),
                                                    sensor.get_telemetry_data_mqtt_message())
                time.sleep(self.interval / 1000.0)

        sense_thread = Thread(target=sensing_loop)
        sense_thread.start()

        self.live_plot()

    def stop(self):
        self.is_running = False
        self.plot_animation.pause()
        plt.close('all')

    def get_sensors_at_location_sorted(self, location: SensorLocation):
        sensors_at_location = [sensor for sensor in self.sensors if sensor.location is location]
        return sorted(sensors_at_location, key=lambda x: (x.measure.value, x.mode.value))

    def live_plot(self):
        fig, axes = plt.subplots()

        x_values = []
        sensor_y_values = {sensor: [] for sensor in self.sensors}
        sensor_lines = {sensor: axes.plot(x_values, sensor_y_values[sensor],
                                          label="{}: {} (in {})".format(sensor.instance_id, sensor.name,
                                                                        SENSOR_UNIT_REPRESENTATION_MAP[sensor.unit]),
                                          c=SENSOR_MEASURE_COLOR_MAP[sensor.measure])[0]
                        for sensor in self.sensors}

        def update(_):
            x_values.append(datetime.now())
            for sensor in self.sensors:
                sensor_y_values[sensor].append(sensor.current_value)
                sensor_lines[sensor].set_data(x_values, sensor_y_values[sensor])
            axes.relim()
            axes.autoscale_view()
            return sensor_lines.values()

        self.plot_animation = FuncAnimation(fig, update, interval=self.interval, blit=True)
        plt.title("Live Sensor Data over Time")
        plt.xlabel("Time")
        plt.ylabel("Sensed Value")
        plt.legend()
        plt.show()
