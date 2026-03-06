#include <Arduino.h>
#include <Arduino_RouterBridge.h>

extern "C" void matrixWrite(const uint32_t *buf);
extern "C" void matrixBegin();

const int MATRIX_WIDTH  = 13;
const int MATRIX_HEIGHT = 8;

void clearFrame(uint32_t frame[4]);
void setPixelBit(uint32_t frame[4], int x, int y);
void drawDot2x2(uint32_t frame[4], int x, int y);
void drawBrailleMask(int mask, uint32_t frame[4]);

int setBrailleMask(int mask);
int allOnBraille(int dummy);
int allOffBraille(int dummy);

void setup() {
  Bridge.begin();
  matrixBegin();

  Bridge.provide("setBrailleMask", setBrailleMask);
  Bridge.provide("allOnBraille", allOnBraille);
  Bridge.provide("allOffBraille", allOffBraille);
}

void loop() {
  delay(10);
}

int setBrailleMask(int mask) {
  if (mask < 0) mask = 0;
  if (mask > 63) mask = 63;

  uint32_t frame[4];
  drawBrailleMask(mask, frame);
  matrixWrite(frame);

  return mask;
}

int allOnBraille(int dummy) {
  (void)dummy;
  uint32_t frame[4];
  drawBrailleMask(63, frame);
  matrixWrite(frame);
  return 63;
}

int allOffBraille(int dummy) {
  (void)dummy;
  uint32_t frame[4];
  clearFrame(frame);
  matrixWrite(frame);
  return 0;
}

void clearFrame(uint32_t frame[4]) {
  frame[0] = 0;
  frame[1] = 0;
  frame[2] = 0;
  frame[3] = 0;
}

void drawBrailleMask(int mask, uint32_t frame[4]) {
  clearFrame(frame);

  // Deux colonnes de points 2x2
  // avec une colonne vide entre elles
  const int xLeft  = 4;  // occupe x=4,5
  const int xRight = 7;  // occupe x=7,8
  // x=6 reste vide

  // Trois rangees de points 2x2
  // avec une ligne vide entre elles
  const int y1 = 0;      // occupe y=0,1
  const int y2 = 3;      // occupe y=3,4
  const int y3 = 6;      // occupe y=6,7
  // y=2 et y=5 restent vides

  if (mask & (1 << 0)) drawDot2x2(frame, xLeft,  y1);  // point 1
  if (mask & (1 << 1)) drawDot2x2(frame, xLeft,  y2);  // point 2
  if (mask & (1 << 2)) drawDot2x2(frame, xLeft,  y3);  // point 3

  if (mask & (1 << 3)) drawDot2x2(frame, xRight, y1);  // point 4
  if (mask & (1 << 4)) drawDot2x2(frame, xRight, y2);  // point 5
  if (mask & (1 << 5)) drawDot2x2(frame, xRight, y3);  // point 6
}

void drawDot2x2(uint32_t frame[4], int x, int y) {
  setPixelBit(frame, x,     y);
  setPixelBit(frame, x + 1, y);
  setPixelBit(frame, x,     y + 1);
  setPixelBit(frame, x + 1, y + 1);
}

void setPixelBit(uint32_t frame[4], int x, int y) {
  if (x < 0 || x >= MATRIX_WIDTH) return;
  if (y < 0 || y >= MATRIX_HEIGHT) return;

  int index = y * MATRIX_WIDTH + x;
  int word  = index / 32;
  int bit   = index % 32;

  frame[word] |= (1u << bit);
}
