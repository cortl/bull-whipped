#include  <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>
#include <OneWire.h>

OneWire ds(2);
int msg[2];
RF24 radio(9,10);
int mode = 0;
const uint64_t pipe = 0xE8E8F0F0E1LL;
void setup(void){
 Serial.begin(9600);
 radio.begin();
  radio.setRetries(15, 15);
  radio.enableAckPayload();
  radio.openWritingPipe(pipe);
  radio.setAutoAck(true);
  msg[1] = -100;}
  
void loop(void) {
  
 temperature();
 delay(25);
 radio.write(msg,sizeof(msg));
 }
     
void temperature(){  
  byte i;
  byte present = 0;
  byte type_s;
  byte data[12];
  byte addr[8];
  float celsius, fahrenheit;

  radio.write(msg, sizeof(msg));
  if ( !ds.search(addr)) {
    ds.reset_search();
    delay(250);
    return;
  }

  if (OneWire::crc8(addr, 7) != addr[7]) {
      Serial.println("CRC is not valid!");
      return;
  }

  ds.reset();
  ds.select(addr);
  ds.write(0x44);        // start conversion, use ds.write(0x44,1) with parasite power on at the end     // maybe 750ms is enough, maybe not
  // we might do a ds.depower() here, but the reset will take care of it.

  present = ds.reset();
  ds.select(addr);    
  ds.write(0xBE);         // Read Scratchpad

  for ( i = 0; i < 9; i++) {           // we need 9 bytes
    data[i] = ds.read();
//    Serial.print(data[i], HEX);
//    Serial.print(" ");
  }
//  Serial.print(" CRC=");
//  Serial.print(OneWire::crc8(data, 8), HEX);
//  Serial.println();

  // Convert the data to actual temperature
  // because the result is a 16 bit signed integer, it should
  // be stored to an "int16_t" type, which is always 16 bits
  // even when compiled on a 32 bit processor.
  int16_t raw = (data[1] << 8) | data[0];
  if (type_s) {
    raw = raw << 3; // 9 bit resolution default
    if (data[7] == 0x10) {
      // "count remain" gives full 12 bit resolution
      raw = (raw & 0xFFF0) + 12 - data[6];
    }
  } else {
    byte cfg = (data[4] & 0x60);
    // at lower res, the low bits are undefined, so let's zero them
    if (cfg == 0x00) raw = raw & ~7;  // 9 bit resolution, 93.75 ms
    else if (cfg == 0x20) raw = raw & ~3; // 10 bit res, 187.5 ms
    else if (cfg == 0x40) raw = raw & ~1; // 11 bit res, 375 ms
    //// default is 12 bit resolution, 750 ms conversion time
  }
  celsius = (float)raw / 16.0;
  fahrenheit = celsius * 1.8 + 32.0;
  //msg[1] = celsius;
  msg[0] = fahrenheit;
  Serial.println(fahrenheit);
  delay(30);
}
