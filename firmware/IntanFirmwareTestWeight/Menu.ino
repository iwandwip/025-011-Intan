void lcdMenuCallbackCustom() {
  String beratStr = String(String(weight, 2) + " Kg");
  const char* lines1[] = { "Berat Badan", beratStr.c_str() };
  menu.renderBoxedText(lines1, 2);

  // String tinggiStr = String(String(height, 2) + " cm");
  // const char* lines1[] = { "Tinggi Badan", tinggiStr.c_str() };
  // menu.renderBoxedText(lines1, 2);
}

void initDisplayCallback() {
  menu.clear();
  menu.drawRect(0, 0, 128, 64);
  menu.setColor(WHITE);
  menu.fillRect(0, 0, 128, 15);
  menu.setColor(BLACK);
  menu.setTextAlignment(TEXT_ALIGN_CENTER);
  menu.setFont(ArialMT_Plain_10);
  menu.drawString(64, 3, "ARI INTAN");
  menu.setColor(WHITE);
  menu.drawString(64, 25, "Loading...");
  menu.drawRect(24, 40, 80, 10);
  menu.fillRect(24, 40, 80, 10);
  menu.display();
  delay(1000);
}