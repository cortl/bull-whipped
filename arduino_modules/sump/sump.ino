#define trigPin 10
#define echoPin 12

float lastDistance;

void setup() {
  Serial.begin (9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  float duration, distance;
  digitalWrite(trigPin, LOW); 
  delayMicroseconds(2);
 
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  duration = pulseIn(echoPin, HIGH);
  distance = (duration / 2) * 0.0344;
//  In CM
  float change = lastDistance - distance;
  if (abs(change) <= 1000) {
    Serial.println(distance);
    delay(500);
  }
  lastDistance = distance;
}
