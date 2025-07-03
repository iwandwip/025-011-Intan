#define ENABLE_MODULE_DIGITAL_INPUT
#define ENABLE_MODULE_DIGITAL_OUTPUT
#define ENABLE_MODULE_TASK_HANDLER
#define ENABLE_MODULE_TIMER_DURATION
#define ENABLE_MODULE_TIMER_TASK
#define ENABLE_MODULE_SERIAL_HARD
#define ENABLE_MODULE_SH1106_MENU

#define ENABLE_SENSOR_MODULE
#define ENABLE_SENSOR_MODULE_UTILITY
#define ENABLE_SENSOR_RFID
#define ENABLE_SENSOR_ULTRASONIC
#define ENABLE_SENSOR_HX711

#include "Kinematrix.h"
#include "Preferences.h"

#define KG_TO_G(x) x * 1000.f
#define G_TO_KG(x) x / 1000.f

////////// Utility //////////
Preferences preferences;

////////// Sensor //////////
SensorModule sensor;
MovingAverageFilter loadCellFilter(10);

////////// Communication //////////
HardSerial usbSerial;

////////// Input Module //////////
DigitalIn buttonOk(39);
DigitalIn buttonDown(36);

////////// Output Module //////////
SH1106Menu menu(0x3C, 21, 22);
DigitalOut buzzer(4);  // 2
DigitalOut ledRed(4);
DigitalOut ledGreen(16);
DigitalOut ledYellow(17);

////////// Global Variable //////////
String uuidRFIDNow = "";
float heightPole = 199.0;
float weight = 0.0;
float height = 0.0;
float bmi = 0.0;