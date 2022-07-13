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
    SENSOR_MEASURE_COLOR_MAP, SensorSimulationMode, SensorSimulationBehavior, SensorMeasure, SimulatedTemperatureSensor, \
    SimulatedWindSensor, SimulatedHumiditySensor, SimulatedPressureSensor, SimulatedVibrationSensor, SimulatedCOSensor, \
    SimulatedCO2Sensor

matplotlib.use("TkAgg")


class Simulator:
    """ Definition of a simulator that periodically senses the current data from all connected sensors.

        The simulator allows adding sensors to sense information from periodically.
        The interval (in ms) in which the simulator senses data from its sensors can be specified during construction.
    """

    def __init__(self, interval: int, show_live_plot: bool, mqtt_client: MQTTClient):
        self.interval: int = interval
        self.show_live_plot: bool = show_live_plot;
        self.mqtt_client: MQTTClient = mqtt_client
        self.is_running: bool = False
        self.plot_animation: Optional[FuncAnimation] = None
        self.sensors: list[SimulatedSensor] = []

    def add_sensor(self, sensor: SimulatedSensor):
        self.sensors.append(sensor)

    def remove_sensor_by_id(self, instance_id: str):
        self.sensors = [sensor for sensor in self.sensors if sensor.instance_id != instance_id]

    def announce_sensors(self):
        for sensor in self.sensors:
            self.mqtt_client.client.publish(sensor.get_metadata_mqtt_topic_name(),
                                            sensor.get_metadata_mqtt_message())

    def on_mqtt_message(self, client, userdata, msg):
        try:
            if msg.topic.startswith('sensors/added'):
                mqtt_message = json.loads(msg.payload)

                is_physical = mqtt_message['isPhysical']
                if is_physical:
                    return

                instance_id = mqtt_message['instanceId']
                name = mqtt_message['name']
                location = SensorLocation[mqtt_message['location']]
                simulation_mode = SensorSimulationMode[mqtt_message['simulationMode']]
                simulation_behavior = SensorSimulationBehavior[mqtt_message['simulationBehavior']]

                measure = SensorMeasure[mqtt_message['measure']]
                if measure is SensorMeasure.TEMPERATURE:
                    self.add_sensor(SimulatedTemperatureSensor(name, location, simulation_mode,
                                                               simulation_behavior, instance_id=instance_id))
                elif measure is SensorMeasure.WIND_SPEED:
                    self.add_sensor(SimulatedWindSensor(name, location, simulation_mode,
                                                        simulation_behavior, instance_id=instance_id))
                elif measure is SensorMeasure.HUMIDITY:
                    self.add_sensor(SimulatedHumiditySensor(name, location, simulation_mode,
                                                            simulation_behavior, instance_id=instance_id))
                elif measure is SensorMeasure.PRESSURE:
                    self.add_sensor(SimulatedPressureSensor(name, location, simulation_mode,
                                                            simulation_behavior, instance_id=instance_id))
                elif measure is SensorMeasure.VIBRATION:
                    self.add_sensor(SimulatedVibrationSensor(name, location, simulation_mode,
                                                             simulation_behavior, instance_id=instance_id))
                elif measure is SensorMeasure.CO:
                    self.add_sensor(SimulatedCOSensor(name, location, simulation_mode,
                                                      simulation_behavior, instance_id=instance_id))
                elif measure is SensorMeasure.CO2:
                    self.add_sensor(SimulatedCO2Sensor(name, location, simulation_mode,
                                                       simulation_behavior, instance_id=instance_id))
            elif msg.topic.startswith('sensors/deleted'):
                mqtt_message = json.loads(msg.payload)
                instance_id = mqtt_message['instanceId']
                self.remove_sensor_by_id(instance_id)
            elif msg.topic.startswith('sensors/metadata/'):
                mqtt_message = json.loads(msg.payload)

                sensor = next(
                    filter(lambda s: s.instance_id.lower() == mqtt_message['instanceId'].lower(), self.sensors))

                mode = next(filter(lambda m: m.name.lower() == mqtt_message['simulationMode']
                                   .lower(), SensorSimulationMode))
                if sensor.mode != mode:
                    sensor.change_mode(mode)

                behavior = next(filter(lambda b: b.name.lower() == mqtt_message['simulationBehavior']
                                       .lower(), SensorSimulationBehavior))
                if sensor.behavior != behavior:
                    sensor.change_behavior(behavior)
        except Exception as e:
            print('Error while processing incoming MQTT message (', msg, ')', e)

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

        if self.show_live_plot:
            self.live_plot()

    def stop(self):
        self.is_running = False
        if self.show_live_plot:
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
