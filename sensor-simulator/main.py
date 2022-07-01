import os
from threading import Thread

from dotenv import load_dotenv, find_dotenv
import psycopg2
from cli.cli import CLI
from mqtt.mqtt import MQTTClient
from sensor.simulated_sensors import SimulatedTemperatureSensor, SensorSimulationMode, SimulatedWindSensor, \
    SimulatedHumiditySensor, \
    SimulatedPressureSensor, SimulatedVibrationSensor, SimulatedCO2Sensor, SimulatedCOSensor, SensorLocation, \
    SensorMeasure, SensorSimulationBehavior
from sensor.simulator import Simulator

UPDATE_INTERVAL_IN_MS = 3000
SHOW_LIVE_PLOT = False

if __name__ == '__main__':
    load_dotenv(find_dotenv())

    # Setup MQTT client
    mqtt_host = os.getenv("MQTT_HOST")
    mqtt_port = int(os.getenv("MQTT_PORT"))
    mqtt_username = os.getenv("MQTT_USERNAME")
    mqtt_password = os.getenv("MQTT_PASSWORD")

    mqtt_client = MQTTClient(mqtt_host, mqtt_port, mqtt_username, mqtt_password)

    # Initialize the simulator
    simulator = Simulator(UPDATE_INTERVAL_IN_MS, SHOW_LIVE_PLOT, mqtt_client)

    # Setup PostgreSQL client
    connection = psycopg2.connect(
        host=os.getenv("DATABASE_HOST"),
        database=os.getenv("DATABASE_NAME"),
        user=os.getenv("DATABASE_USERNAME"),
        password=os.getenv("DATABASE_PASSWORD"),
        port=os.getenv("DATABASE_PORT"),
    )

    # Load all Simulated Sensors from SQL

    cursor = connection.cursor()
    cursor.execute("SELECT \"instanceId\" FROM \"Sensor\" WHERE \"isPhysical\" IS NOT TRUE;")

    for sensor in cursor.fetchall():
        instance_id = sensor[0]

        cursor.execute(
            "SELECT \"name\", \"location\", \"measure\", \"simulationMode\", \"simulationBehavior\" FROM \"SensorMetaData\" smd WHERE smd.\"instanceId\" = '" + instance_id + "' ORDER BY timestamp DESC LIMIT 1;")
        current_metadata = cursor.fetchone()

        name = current_metadata[0]
        location = SensorLocation[current_metadata[1]]
        measure = SensorMeasure[current_metadata[2]]
        simulation_mode = SensorSimulationMode[current_metadata[3]]
        simulation_behavior = SensorSimulationBehavior[current_metadata[4]]

        if measure == SensorMeasure.TEMPERATURE:
            simulated_sensor = SimulatedTemperatureSensor(name, location, simulation_mode,
                                                          simulation_behavior, instance_id=instance_id)
        elif measure == SensorMeasure.WIND_SPEED:
            simulated_sensor = SimulatedWindSensor(name, location, simulation_mode,
                                                   simulation_behavior, instance_id=instance_id)
        elif measure == SensorMeasure.HUMIDITY:
            simulated_sensor = SimulatedHumiditySensor(name, location, simulation_mode,
                                                       simulation_behavior, instance_id=instance_id)
        elif measure == SensorMeasure.PRESSURE:
            simulated_sensor = SimulatedPressureSensor(name, location, simulation_mode,
                                                       simulation_behavior, instance_id=instance_id)
        elif measure == SensorMeasure.VIBRATION:
            simulated_sensor = SimulatedVibrationSensor(name, location, simulation_mode,
                                                        simulation_behavior, instance_id=instance_id)
        elif measure == SensorMeasure.CO2:
            simulated_sensor = SimulatedCO2Sensor(name, location, simulation_mode,
                                                  simulation_behavior, instance_id=instance_id)
        elif measure == SensorMeasure.CO:
            simulated_sensor = SimulatedCOSensor(name, location, simulation_mode,
                                                 simulation_behavior, instance_id=instance_id)
        else:
            raise ValueError('Unexpected sensor measure to simulate', measure)

        simulator.add_sensor(simulated_sensor)

    connection.commit()
    connection.close()

    # Announce sensors by sending metadata MQTT message
    simulator.announce_sensors()

    # Add callback listener for incoming MQTT messages to simulator
    mqtt_client.add_listener(simulator.on_mqtt_message)

    # Run CLI in seperate thread
    def on_exit():
        simulator.stop()
        mqtt_client.disconnect()
        if os.name == 'posix':
            os.system('clear')
        else:
            os.system('cls')
        print('Goodbye.')
        quit()

    cli = CLI(simulator, on_exit)
    cli_thread = Thread(target=cli.enter_main_menu)
    cli_thread.start()

    # Start simulation
    simulator.start()
