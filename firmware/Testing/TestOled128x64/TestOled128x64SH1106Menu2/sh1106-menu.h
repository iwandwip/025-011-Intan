/*
 *  sh1106-menu.h
 *
 *  SH1106 menu header
 *  Created on: 2025. 3. 18
 */

#ifndef SH1106_MENU_H
#define SH1106_MENU_H

#pragma message("[COMPILED]: sh1106-menu.h")

#include "Arduino.h"
#include "SH1106Wire.h"
#include "SPI.h"

const uint8_t MAX_BUFF_LEN = 24;

typedef void (*CallbackMenu)();

struct MenuCursor {
  bool up;
  bool down;
  bool select;
  bool back;
  bool show;
};

struct MenuProperties {
  char option[MAX_BUFF_LEN];
  char **text;
  bool *isHasCb;
  CallbackMenu *callbackMenu;
  uint8_t len;
  int select;
  int index;
  int upCount;
};

class SH1106Menu : public SH1106Wire {
private:
  MenuCursor *cursor_;
  uint32_t oledPrintTimer;
  int menuItemHeight;     // Height of each menu item in pixels
  int menuStartY;         // Starting Y position for a menu
  int cursorWidth;        // Width of cursor indicator
  int displayRows;        // Number of rows to display (3 by default)
  int16_t displayWidth;   // Display width in pixels
  int16_t displayHeight;  // Display height in pixels

public:
  // Constructor for the 128x64 SH1106 display (using I2C)
  SH1106Menu(uint8_t address = 0x3C, int sda = -1, int scl = -1, OLEDDISPLAY_GEOMETRY g = GEOMETRY_128_64)
    : SH1106Wire(address, sda, scl, g),
      oledPrintTimer(0), menuItemHeight(12), menuStartY(14),
      cursorWidth(8), displayRows(3), displayWidth(128), displayHeight(64) {}

  void initialize(bool _debug = false, void (*initCallback)() = nullptr);
  void setDisplayParams(int itemHeight = 16, int startY = 10, int cursorW = 10, int rows = 3);
  void onListen(MenuCursor *menuCursor, void (*listenCallback)());
  void showMenu(MenuProperties *properties, bool forced = false, uint32_t showTime = 250);
  void onCursor(MenuProperties *properties);
  void drawCursor(int y, bool isUp = false, bool isDown = false);
  void onSelect(MenuProperties *properties, const char *options, void (*optionCallback)());
  void onSelect(MenuProperties *properties, const char *options, void (*onClickCallback)(), void (*optionCallback)());
  void onSelect(MenuProperties *properties, const char *options, void (*optionCallback)(MenuCursor *cursor));
  void onSelect(MenuProperties *properties, const char *options, void (*onClickCallback)(),
                void (*optionCallback)(MenuCursor *cursor));
  void formatMenu(MenuProperties *properties, uint8_t index, const char *format, ...);
  void clearMenu(MenuProperties *firstMenu, ...);
  int begin(int nums);
  int get(int nums);
  MenuProperties *end();
  void freeCharArray(char *str);
  MenuProperties *createMenu(int menuSize, ...);
  MenuProperties *createEmptyMenu(int menuSize, const char *text = nullptr);
  void freeMenu(MenuProperties *menuProperties);
  void showCursor(bool state);
  void debugPrint(const char *format, ...);
  void debug(MenuProperties *properties, uint8_t index);
  void wait(uint32_t time);

  // Display an information screen with title and 3 content lines
  void renderInfoScreen(const char *title, const char *line1, const char *line2, const char *line3);
};

#endif  // SH1106_MENU_H