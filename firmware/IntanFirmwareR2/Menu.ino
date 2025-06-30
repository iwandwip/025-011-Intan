void initializeDisplayCallback() {
  const char *initLines[] = { "SISTEM INTAN", "MENGINISIALISASI...", "MOHON TUNGGU" };
  displayMenu.renderBoxedText(initLines, 3);
  delay(1000);
}

void menuCallback() {
}