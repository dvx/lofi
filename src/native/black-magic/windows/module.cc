#include <napi.h>

// Windows black magic implementation
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  return exports;
}

NODE_API_MODULE(blackMagic, Init)
