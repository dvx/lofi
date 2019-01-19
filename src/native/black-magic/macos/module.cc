#include <napi.h>

// MacOS black magic includes
#include "constraints.mm"

// MacOS black magic implementation
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  return exports;
}

NODE_API_MODULE(blackMagic, Init)
