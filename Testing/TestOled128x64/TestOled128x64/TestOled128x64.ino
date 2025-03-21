#define ENABLE_MODULE_OLED_MENU

#include "Kinematrix.h"

OledMenu menu;

void setup() {
  Serial.begin(115200);
  menu.initialize(true, []() {
    Serial.println("Initialize Success!");
  });
}

void loop() {
  MenuCursor cursor{
    .up = false,
    .down = false,
    .select = false,
    .back = false,
    .show = true
  };
  menu.onListen(&cursor, []() {
    static auto mainMenu = menu.createMenu(3, "Test", "Oled", "Hello");
    menu.showMenu(mainMenu);
  });
}
