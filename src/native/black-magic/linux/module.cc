#include <napi.h>

// Linux black magic implementation
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  return exports;
}

NODE_API_MODULE(blackMagic, Init)
