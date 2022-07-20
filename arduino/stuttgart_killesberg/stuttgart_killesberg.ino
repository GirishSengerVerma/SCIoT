
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

#define sound_pin D1 // wall
boolean play = false;


WiFiClientSecure espClient; // WiFiClient to connect and use WiFi
PubSubClient mqtt(espClient); // mqtt client

int lightValue = A0;

// closes the window and sens appropriate retained status message to mqtt broker
void play_alarm() {
  tone(sound_pin, 1000, 500);
}

void stop_alarm() {
  noTone(sound_pin);
}




void setup() {
  Serial.begin(9600);
  pinMode(sound_pin, OUTPUT);
  pinMode(D2, OUTPUT);
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

    if (mqtt.connect("STUTTGART_KILLESBERG_PARK", mqttUser, mqttPassword)) {

      Serial.println("connected");

    } else {

      Serial.print("failed with state ");
      Serial.print(mqtt.state());
      delay(2000);

    }
  }

  // subscribe to topics
  mqtt.subscribe("actuators/statusdata/STUTTGART_KILLESBERG_PARK/ALARM_LIGHT");
  mqtt.subscribe("actuators/statusdata/STUTTGART_KILLESBERG_PARK/ALARM_SOUND");


  // startup message for alarm_tone
  mqtt.publish("actuators/metadata/STUTTGART_KILLESBERG_PARK/ALARM_SOUND",
               "{\"instanceId\":\"SKP_SOUND_A\",\"name\":\"Alarm Sound at Stuttgart Killesberg Park\",\"location\":\"STUTTGART_KILLESBERG_PARK\",\"type\":\"ALARM_SOUND\"}");

  //startup message for alarmlight
  mqtt.publish("actuators/metadata/STUTTGART_KILLESBERG_PARK/ALARM_LIGHT",
               "{\"instanceId\":\"SKP_LIGHT_A\",\"name\":\"Alarm Light at Stuttgart Killesberg Park\",\"location\":\"STUTTGART_KILLESBERG_PARK\",\"type\":\"ALARM_LIGHT\"}");

  //startup message for LightSensor
  mqtt.publish("sensors/metadata/STUTTGART_KILLESBERG_PARK/LIGHT",
               "{\"instanceId\":\"SKP_LIGHT_S\",\"name\":\"Light at Stuttgart Killesberg Park\",\"location\":\"STUTTGART_KILLESBERG_PARK\",\"measure\":\"LIGHT\"}");

  Udp.begin(localPort);
  setSyncProvider(getNtpTime);
  setSyncInterval(300);


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

  if (topic_s == "actuators/statusdata/STUTTGART_KILLESBERG_PARK/ALARM_SOUND") {
    if (message_s.indexOf("true") > -1 ) {
      play = true;


    } else if (message_s.indexOf("false") > -1 ) {
      play = false;

    }
  } else if (topic_s == "actuators/statusdata/STUTTGART_KILLESBERG_PARK/ALARM_LIGHT") {
    if (message_s.indexOf("true") > -1) {
      digitalWrite(D2, HIGH);
    } else if (message_s.indexOf("false") > -1) {
      digitalWrite(D2, LOW);
    }
  }

  Serial.print(topic);
  Serial.print(": ");
  Serial.println(message);

}

void loop() {
  mqtt.loop();

  int value = map(analogRead(lightValue), 0, 1023, 100,0);
  char timestamp[33];
  sprintf(timestamp, "%d-%02d-%02dT%02d:%02d:%02d.000000+00:00", year(), month(), day(), hour(), minute(), second());
  
  char msg[96];
  sprintf(msg, "{\"instanceId\":\"SKP_LIGHT_S\",\"timestamp\":\"%s\",\"unit\":\"PERCENTAGE\",\"value\":%d}", timestamp, value);
  Serial.println(msg);


  mqtt.publish("sensors/telemetry/STUTTGART_KILLESBERG_PARK/LIGHT", msg, true);
  if (play) {
    play_alarm();
  } else {
    stop_alarm();
  }
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
