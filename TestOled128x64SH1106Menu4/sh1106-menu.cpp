/*
 *  sh1106-menu.cpp
 *
 *  SH1106 menu implementation
 *  Created on: 2025. 3. 18
 *  Enhanced UI version - without header
 *  Updated with WiFi support
 */

#include "sh1106-menu.h"

void SH1106Menu::initialize(bool _debug, void (*initCallback)()) {
  // Default values for 128x64 OLED with 3 menu items - adjusted for better visibility
  setDisplayParams(16, 0, 8, 4);  // Mengatur ukuran item menu dan mulai dari Y=0

  // Initialize display with reliable settings
  SH1106Wire::init();
  // Make sure we're using the standard orientation
  // Comment out this line if your display is upside down
  // SH1106Wire::flipScreenVertically();

  // Use a smaller font for better readability
  SH1106Wire::setFont(ArialMT_Plain_10);
  SH1106Wire::setTextAlignment(TEXT_ALIGN_LEFT);
  SH1106Wire::clear();

  // Test pattern to verify display is working
  SH1106Wire::drawRect(0, 0, displayWidth, displayHeight);
  SH1106Wire::drawString(5, 5, "SH1106 INIT");
  SH1106Wire::display();
  delay(500);
  SH1106Wire::clear();
  SH1106Wire::display();

  if (initCallback != nullptr) initCallback();

  if (!_debug) return;
  Serial.print("| [NAME]: ");
  Serial.print("SH1106");
  Serial.print(" [INFO]: Init Success");
  Serial.println();
}

void SH1106Menu::setDisplayParams(int itemHeight, int startY, int cursorW, int rows) {
  menuItemHeight = itemHeight;
  menuStartY = startY;
  cursorWidth = cursorW;
  displayRows = rows;
  displayWidth = this->width();
  displayHeight = this->height();
}

void SH1106Menu::onListen(MenuCursor *menuCursor, void (*listenCallback)()) {
  cursor_ = menuCursor;
  listenCallback();
}

void SH1106Menu::showMenu(MenuProperties *properties, bool forced, uint32_t showTime) {
  if (strlen(properties->option) != 0 && !forced) return;

  if (millis() - oledPrintTimer >= showTime || forced) {
    clear();

    // Set text alignment and font for better menu display
    setTextAlignment(TEXT_ALIGN_LEFT);
    setFont(ArialMT_Plain_10);

    // Calculate how many menu items to show
    int maxItems = min(displayRows, properties->len - properties->select);

    // Tentukan posisi y awal untuk menu items
    int menuY = menuStartY;

    // Display visible menu items with boxes
    for (int i = 0; i < maxItems; i++) {
      int textIndex = properties->select + i;

      bool isSelected = (properties->index == textIndex);

      // Draw menu boxes with no gaps
      if (isSelected) {
        // Selected item has white background
        setColor(WHITE);
        fillRect(0, menuY, displayWidth, menuItemHeight);
        setColor(BLACK);
      } else {
        // Non-selected items have white border
        setColor(BLACK);
        fillRect(0, menuY, displayWidth, menuItemHeight);
        setColor(WHITE);
        drawRect(0, menuY, displayWidth, menuItemHeight);
      }

      // Calculate vertical center position for text
      // Font height untuk ArialMT_Plain_10 sekitar 10 piksel
      int textYposition = menuY + (menuItemHeight - 10) / 2;

      // Draw menu text centered vertically with a bit of padding (8px dari kiri)
      if (isSelected) {
        // Black text on white background for selected item
        drawString(8, textYposition, properties->text[textIndex]);
      } else {
        // White text on black background for non-selected items
        drawString(8, textYposition, properties->text[textIndex]);
      }

      // Perbarui posisi y untuk item berikutnya (tanpa gap)
      menuY += menuItemHeight;
    }

    // Show navigation indicators if needed
    if (!forced && cursor_->show) {
      if (properties->select > 0) {
        // Draw up arrow indicator at top-right
        setColor(WHITE);
        fillTriangle(
          displayWidth - 10, 5,
          displayWidth - 5, 5,
          displayWidth - 7, 2);
      }

      if (properties->select + displayRows < properties->len) {
        // Draw down arrow indicator at bottom-right
        setColor(WHITE);
        fillTriangle(
          displayWidth - 10, displayHeight - 5,
          displayWidth - 5, displayHeight - 5,
          displayWidth - 7, displayHeight - 2);
      }
    }

    display();
    oledPrintTimer = millis();
  }

  if (forced) return;
  this->onCursor(properties);
}

void SH1106Menu::onCursor(MenuProperties *properties) {
  if (cursor_->down) {
    if (properties->index < properties->len - 1) {
      properties->index++;

      // Adjust display window if needed
      if (properties->index >= properties->select + displayRows) {
        properties->select++;
      }
    } else {
      // Wrap to first item
      properties->index = 0;
      properties->select = 0;
    }
  }

  if (cursor_->up) {
    if (properties->index > 0) {
      properties->index--;

      // Adjust display window if needed
      if (properties->index < properties->select) {
        properties->select--;
      }
    } else {
      // Wrap to last item
      properties->index = properties->len - 1;

      // Calculate appropriate select value for last item
      int maxItemsVisible = min(displayRows, (int)properties->len);
      properties->select = max(0, properties->len - maxItemsVisible);
    }
  }

  if (cursor_->select) {
    cursor_->select = 0;
    if (properties->isHasCb[properties->index]) {
      if (properties->callbackMenu != nullptr && properties->callbackMenu[properties->index] != nullptr) {
        properties->callbackMenu[properties->index]();
      }
      strcpy(properties->option, properties->text[properties->index]);
    }
  }
}

void SH1106Menu::drawCursor(int y, bool isUp, bool isDown) {
  if (isUp) {
    // Draw up arrow
    setColor(WHITE);
    fillTriangle(
      displayWidth / 2 - 5, y,
      displayWidth / 2 + 5, y,
      displayWidth / 2, y - 5);
  } else if (isDown) {
    // Draw down arrow
    setColor(WHITE);
    fillTriangle(
      displayWidth / 2 - 5, y,
      displayWidth / 2 + 5, y,
      displayWidth / 2, y + 5);
  }
}

void SH1106Menu::onSelect(MenuProperties *properties, const char *options, void (*optionCallback)()) {
  for (int i = 0; i < properties->len; ++i) {
    if (strcmp(properties->text[i], options) == 0) {
      properties->isHasCb[i] = true;
    }
  }

  if (strcmp(properties->option, options) == 0 && optionCallback != nullptr) {
    optionCallback();
    if (cursor_->back) {
      cursor_->back = 0;
      freeCharArray(properties->option);
      properties->select = 0;
      properties->index = 0;
      properties->upCount = 0;
    }
  }
}

void SH1106Menu::onSelect(MenuProperties *properties, const char *options, void (*onClickCallback)(),
                          void (*optionCallback)()) {
  for (int i = 0; i < properties->len; ++i) {
    if (strcmp(properties->text[i], options) == 0) {
      properties->isHasCb[i] = true;
      properties->callbackMenu[i] = onClickCallback;
    }
  }

  if (strcmp(properties->option, options) == 0 && optionCallback != nullptr) {
    optionCallback();
    if (cursor_->back) {
      cursor_->back = 0;
      freeCharArray(properties->option);
      properties->select = 0;
      properties->index = 0;
      properties->upCount = 0;
    }
  }
}

void SH1106Menu::onSelect(MenuProperties *properties, const char *options, void (*optionCallback)(MenuCursor *cursor)) {
  for (int i = 0; i < properties->len; ++i) {
    if (strcmp(properties->text[i], options) == 0) {
      properties->isHasCb[i] = true;
    }
  }

  if (strcmp(properties->option, options) == 0 && optionCallback != nullptr) {
    optionCallback(cursor_);
    if (cursor_->back) {
      cursor_->back = 0;
      freeCharArray(properties->option);
      properties->select = 0;
      properties->index = 0;
      properties->upCount = 0;
    }
  }
}

void SH1106Menu::onSelect(MenuProperties *properties, const char *options, void (*onClickCallback)(),
                          void (*optionCallback)(MenuCursor *cursor)) {
  for (int i = 0; i < properties->len; ++i) {
    if (strcmp(properties->text[i], options) == 0) {
      properties->isHasCb[i] = true;
      properties->callbackMenu[i] = onClickCallback;
    }
  }

  if (strcmp(properties->option, options) == 0 && optionCallback != nullptr) {
    optionCallback(cursor_);
    if (cursor_->back) {
      cursor_->back = 0;
      freeCharArray(properties->option);
      properties->select = 0;
      properties->index = 0;
      properties->upCount = 0;
    }
  }
}

// New function to display information screens with title and 3 content lines
void SH1106Menu::renderInfoScreen(const char *title, const char *line1, const char *line2, const char *line3) {
  clear();

  // Draw title bar
  setColor(WHITE);
  fillRect(0, 0, 128, 15);
  setColor(BLACK);
  setTextAlignment(TEXT_ALIGN_CENTER);
  drawString(64, 3, title);

  // Draw info box
  setColor(WHITE);
  drawRect(0, 15, 128, 49);

  // Content lines with vertically centered positions
  setTextAlignment(TEXT_ALIGN_LEFT);
  drawString(8, 20, line1);
  drawString(8, 32, line2);
  drawString(8, 44, line3);
  display();
}

// New function to connect to WiFi
bool SH1106Menu::connectToWiFi(const char *ssid, const char *password, int timeoutSeconds) {
  Serial.println("Connecting to WiFi...");

  // Connect to WiFi network
  WiFi.begin(ssid, password);

  // Show connecting message on display
  clear();
  setTextAlignment(TEXT_ALIGN_CENTER);
  setFont(ArialMT_Plain_10);
  drawString(64, 10, "Connecting to WiFi");
  drawString(64, 25, ssid);

  // Add a progress bar
  drawRect(24, 40, 80, 10);

  // Try to connect with timeout
  int timeout = timeoutSeconds * 2;  // Half-second increments
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < timeout) {
    // Update progress bar - scale to show progress over entire bar
    int progressBarWidth = map(tries, 0, timeout, 0, 80);
    fillRect(24, 40, progressBarWidth, 10);
    display();

    delay(500);
    Serial.print(".");
    tries++;
  }
  Serial.println();

  // Check connection result
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    // Show success message
    clear();
    drawString(64, 10, "WiFi Connected!");
    drawString(64, 25, "IP Address:");
    drawString(64, 40, WiFi.localIP().toString());
    display();
    delay(2000);  // Show success message for 2 seconds
    return true;
  } else {
    Serial.println("WiFi connection failed");

    // Show failure message
    clear();
    drawString(64, 25, "WiFi Connection Failed");
    display();
    delay(2000);  // Show failure message for 2 seconds
    return false;
  }
}

// Get WiFi status as a string
String SH1106Menu::getWiFiStatus() {
  switch (WiFi.status()) {
    case WL_CONNECTED:
      return "Connected to " + String(WiFi.SSID());
    case WL_CONNECT_FAILED:
      return "Connection Failed";
    case WL_IDLE_STATUS:
      return "Idle";
    case WL_NO_SSID_AVAIL:
      return "No SSID Available";
    case WL_DISCONNECTED:
      return "Disconnected";
    default:
      return "Status: " + String(WiFi.status());
  }
}

// Get IP address as a string
String SH1106Menu::getIPAddress() {
  if (WiFi.status() == WL_CONNECTED) {
    return WiFi.localIP().toString();
  } else {
    return "0.0.0.0";
  }
}

// Sisa kode tidak berubah
void SH1106Menu::formatMenu(MenuProperties *properties, uint8_t index, const char *format, ...) {
  va_list args;
  va_start(args, format);
  vsnprintf(properties->text[index], MAX_BUFF_LEN, format, args);
  va_end(args);
  return;
}

void SH1106Menu::clearMenu(MenuProperties *firstMenu, ...) {
  cursor_->up = false;
  cursor_->down = false;
  cursor_->select = false;
  cursor_->back = false;

  va_list args;
  va_start(args, firstMenu);
  MenuProperties *currentMenu = firstMenu;
  while (currentMenu != nullptr) {
    freeCharArray(currentMenu->option);
    currentMenu->select = 0;
    currentMenu->index = 0;
    currentMenu->upCount = 0;
    currentMenu = va_arg(args, MenuProperties *);
  }
  va_end(args);
}

int SH1106Menu::begin(int nums) {
  return nums;
}

int SH1106Menu::get(int nums) {
  return nums;
}

MenuProperties *SH1106Menu::end() {
  return nullptr;
}

void SH1106Menu::freeCharArray(char *str) {
  for (int i = 0; str[i] != '\0'; ++i) {
    str[i] = '\0';
  }
}

MenuProperties *SH1106Menu::createMenu(int menuSize, ...) {
  va_list args;
  va_start(args, menuSize);

  MenuProperties *properties = new MenuProperties;

  properties->option[0] = '\0';
  properties->len = menuSize;

  properties->select = 0;
  properties->index = 0;
  properties->upCount = 0;

  if (menuSize > 0) {
    properties->text = new char *[menuSize];
    properties->isHasCb = new bool[menuSize];
    properties->callbackMenu = new CallbackMenu[menuSize];
    for (uint8_t i = 0; i < menuSize; ++i) {
      const char *menuItem = va_arg(args, const char *);
      properties->text[i] = new char[MAX_BUFF_LEN];
      strcpy(properties->text[i], "default");
      if (menuItem != nullptr) strcpy(properties->text[i], menuItem);
      properties->isHasCb[i] = false;
      properties->callbackMenu[i] = nullptr;
    }
  } else {
    properties->text = nullptr;
    properties->isHasCb = nullptr;
    properties->callbackMenu = nullptr;
  }

  va_end(args);
  return properties;
}

MenuProperties *SH1106Menu::createEmptyMenu(int menuSize, const char *text) {
  MenuProperties *properties = new MenuProperties;

  properties->option[0] = '\0';
  properties->len = menuSize;

  properties->select = 0;
  properties->index = 0;
  properties->upCount = 0;

  if (menuSize > 0) {
    properties->text = new char *[menuSize];
    properties->isHasCb = new bool[menuSize];
    properties->callbackMenu = new CallbackMenu[menuSize];
    for (uint8_t i = 0; i < menuSize; ++i) {
      properties->text[i] = new char[MAX_BUFF_LEN];
      strcpy(properties->text[i], "default");
      if (text != nullptr) strcpy(properties->text[i], text);
      properties->isHasCb[i] = false;
      properties->callbackMenu[i] = nullptr;
    }
  } else {
    properties->text = nullptr;
    properties->isHasCb = nullptr;
    properties->callbackMenu = nullptr;
  }
  return properties;
}

void SH1106Menu::freeMenu(MenuProperties *menuProperties) {
  if (menuProperties->text) {
    for (uint8_t i = 0; i < menuProperties->len; ++i) {
      delete[] menuProperties->text[i];
    }
    delete[] menuProperties->text;
  }
  delete[] menuProperties->isHasCb;
  delete[] menuProperties->callbackMenu;
  delete menuProperties;
}

void SH1106Menu::showCursor(bool state) {
  cursor_->show = state;
}

void SH1106Menu::debugPrint(const char *format, ...) {
  va_list args;
  va_start(args, format);
  char buffer[256];
  vsnprintf(buffer, sizeof(buffer), format, args);
  Serial.println(buffer);
  va_end(args);
}

void SH1106Menu::debug(MenuProperties *properties, uint8_t index) {
  debugPrint(properties->text[index]);
}

void SH1106Menu::wait(uint32_t time) {
  delay(time);
}