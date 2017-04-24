#include <nRF24L01.h>
#include <RF24.h>
#include <RF24_config.h>
#include <SPI.h>

/*
This sketch receives strings from sending unit via nrf24 
and prints them out via serial.  The sketch waits until
it receives a specific value (2 in this case), then it 
prints the complete message and clears the message buffer.
*/

int msg[2];
RF24 radio(9,10);
const uint64_t pipe = 0xE8E8F0F0E1LL;
int ack[1] = {990};
void setup(void){
  Serial.begin(9600);
  radio.begin();
  radio.openReadingPipe(1,pipe);
  radio.startListening();
}
void loop(void){
  if (radio.available()){
    radio.read(msg,sizeof(msg));
    if (msg[1] == -100){
      Serial.print("temp1");
      Serial.print(",");
      Serial.print("Internal Temperature");
      Serial.print(",");
      Serial.print("Thermometer");
      Serial.print(",");
      Serial.print("Fahrenheit");
      Serial.print(",");
      Serial.println(msg[0]);}
    if (msg[1] == -101){
      Serial.print("temp2");
      Serial.print(",");
      Serial.print("Outside Temperature");
      Serial.print(",");
      Serial.print("Thermometer");
      Serial.print(",");
      Serial.print("Fahrenheit");
      Serial.print(",");
      Serial.println(msg[0]);
    }
    if (msg[1] == -102){
      Serial.println("dist1");
      Serial.print(",");
      Serial.print("Distance");
      Serial.print(",");
      Serial.print("SUMP");
      Serial.print(",");
      Serial.print("Centimeters");
      Serial.print(",");
      Serial.println(msg[0]);
    }
    

    delay(4000);
  }
  msg[1]= 0;
}
