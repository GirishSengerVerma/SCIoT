#include <Servo.h>
#include "credentials.h"

#include <Servo.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <TimeLib.h>
#include <WiFiUdp.h>

// NTP Servers:
static const char ntpServerName[] = "us.pool.ntp.org";

const int timeZone = 2;     // Central European Time


WiFiUDP Udp;
unsigned int localPort = 8888;  // local port to listen for UDP packets

time_t getNtpTime();
void digitalClockDisplay();
void printDigits(int digits);
void sendNTPpacket(IPAddress &address);

#define wall_pin D1 // wall


Servo wall; // Servo for window

WiFiClientSecure espClient; // WiFiClient to connect and use WiFi
PubSubClient mqtt(espClient); // mqtt client

int waterValue = A0;

// closes the window and sens appropriate retained status message to mqtt broker
void close_wall() {
  wall.write(0);
}


// opens the window and sens appropriate retained status message to mqtt broker
void open_wall() {
  wall.write(180);
}

void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println("Connected to the WiFi network");

  espClient.setInsecure();

  // Set mqqt config info
  mqtt.setServer(mqttServer, mqttPort);
  mqtt.setCallback(callback);

  // Connect to mqtt broker
  while (!mqtt.connected()) {
    Serial.println("Connecting to MQTT...");

    if (mqtt.connect("STUTTGART_MAX_EYTH_SEE", mqttUser, mqttPassword)) {

      Serial.println("connected");

    } else {

      Serial.print("failed with state ");
      Serial.print(mqtt.state());
      delay(2000);

    }
  }

  // subscribe to topics
  mqtt.subscribe("actuators/statusdata/STUTTGART_MAX_EYTH_SEE/WATER_PROTECTION_WALL");
  mqtt.subscribe("actuators/statusdata/STUTTGART_MAX_EYTH_SEE/ALARM_LIGHT");


  // startup message for protectionwall
  mqtt.publish("actuators/metadata/STUTTGART_MAX_EYTH_SEE/WATER_PROTECTION_WALL",
               "{\"instanceId\":\"SMES_WATER_PROTECTION_WALL_A\",\"name\":\"Water Protection Wall at Stuttgart Max Eyth See\",\"location\":\"STUTTGART_MAX_EYTH_SEE\",\"type\":\"WATER_PROTECTION_WALL\"}");

  //startup message for alarmlight
  mqtt.publish("actuators/metadata/STUTTGART_MAX_EYTH_SEE/ALARM_LIGHT",
               "{\"instanceId\":\"SMES_LIGHT_A\",\"name\":\"Alarm Light at Stuttgart Max Eyth See\",\"location\":\"STUTTGART_MAX_EYTH_SEE\",\"type\":\"ALARM_LIGHT\"}");

  //startup message for Water Level
  mqtt.publish("sensors/metadata/STUTTGART_MAX_EYTH_SEE/WATER_LEVEL",
               "{\"instanceId\":\"SMES_WATER_LEVEL_S\",\"name\":\"Water Level at Stuttgart Max Eyth See\",\"location\":\"STUTTGART_MAX_EYTH_SEE\",\"measure\":\"WATER_LEVEL\"}");

  Udp.begin(localPort);
  setSyncProvider(getNtpTime);
  setSyncInterval(300);

  // attach the servos at the specific pins
  wall.attach(wall_pin);

  // close window and blinds as starting position
  close_wall();
}

// callback function which is called for each incoming message
void callback(char* topic, byte* payload, unsigned int length) {
  char message[length + 1]; // will later contain only the message, without sender information
  for (int i = 0; i < length; i++) { // copy message from payload to message
    message[i] = (char) payload[i];
  }
  message[length] = '\0'; // add null byte to terminate string

  String topic_s = String(topic);
  String message_s = String(message);

  if (topic_s == "actuators/statusdata/STUTTGART_MAX_EYTH_SEE/WATER_PROTECTION_WALL") {
    if (message_s.indexOf("true") > -1 ) {
      open_wall();

    } else if (message_s.indexOf("false") > -1 ) {
      close_wall();

    }
  } else if (topic_s == "actuators/statusdata/STUTTGART_MAX_EYTH_SEE/ALARM_LIGHT") {
    if (message_s.indexOf("true") > -1) {
      digitalWrite(LED_BUILTIN, LOW);
    } else if (message_s.indexOf("false") > -1) {
      digitalWrite(LED_BUILTIN, HIGH);
    }
  }

  Serial.print(topic);
  Serial.print(": ");
  Serial.println(message);

}

void loop() {
  mqtt.loop();
  int value = map(analogRead(waterValue), 0, 1023, 4, -1);
  char timestamp[33];
  sprintf(timestamp, "%d-%02d-%02dT%02d:%02d:%02d.000000+00:00", year(), month(), day(), hour(), minute(), second());

  char msg[96];
  sprintf(msg, "{\"instanceId\":\"SMES_WATER_LEVEL_S\",\"timestamp\":\"%s\",\"unit\":\"METERS\",\"value\":%d}", timestamp, value);
  Serial.println(msg);

  mqtt.publish("sensors/telemetry/STUTTGART_MAX_EYTH_SEE/WATER_LEVEL", msg, true);
  delay(3000);



}


const int NTP_PACKET_SIZE = 48; // NTP time is in the first 48 bytes of message
byte packetBuffer[NTP_PACKET_SIZE]; //buffer to hold incoming & outgoing packets

time_t getNtpTime()
{
  IPAddress ntpServerIP; // NTP server's ip address

  while (Udp.parsePacket() > 0) ; // discard any previously received packets
  Serial.println("Transmit NTP Request");
  // get a random server from the pool
  WiFi.hostByName(ntpServerName, ntpServerIP);
  Serial.print(ntpServerName);
  Serial.print(": ");
  Serial.println(ntpServerIP);
  sendNTPpacket(ntpServerIP);
  uint32_t beginWait = millis();
  while (millis() - beginWait < 1500) {
    int size = Udp.parsePacket();
    if (size >= NTP_PACKET_SIZE) {
      Serial.println("Receive NTP Response");
      Udp.read(packetBuffer, NTP_PACKET_SIZE);  // read packet into the buffer
      unsigned long secsSince1900;
      // convert four bytes starting at location 40 to a long integer
      secsSince1900 =  (unsigned long)packetBuffer[40] << 24;
      secsSince1900 |= (unsigned long)packetBuffer[41] << 16;
      secsSince1900 |= (unsigned long)packetBuffer[42] << 8;
      secsSince1900 |= (unsigned long)packetBuffer[43];
      return secsSince1900 - 2208988800UL + timeZone * SECS_PER_HOUR;
    }
  }
  Serial.println("No NTP Response :-(");
  return 0; // return 0 if unable to get the time
}

// send an NTP request to the time server at the given address
void sendNTPpacket(IPAddress &address)
{
  // set all bytes in the buffer to 0
  memset(packetBuffer, 0, NTP_PACKET_SIZE);
  // Initialize values needed to form NTP request
  // (see URL above for details on the packets)
  packetBuffer[0] = 0b11100011;   // LI, Version, Mode
  packetBuffer[1] = 0;     // Stratum, or type of clock
  packetBuffer[2] = 6;     // Polling Interval
  packetBuffer[3] = 0xEC;  // Peer Clock Precision
  // 8 bytes of zero for Root Delay & Root Dispersion
  packetBuffer[12] = 49;
  packetBuffer[13] = 0x4E;
  packetBuffer[14] = 49;
  packetBuffer[15] = 52;
  // all NTP fields have been given values, now
  // you can send a packet requesting a timestamp:
  Udp.beginPacket(address, 123); //NTP requests are to port 123
  Udp.write(packetBuffer, NTP_PACKET_SIZE);
  Udp.endPacket();
}
