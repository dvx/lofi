// Here be dragons...
// This node module handles ugly OS-specific hacks

#if defined(_WIN32) || defined(_WIN64) || defined(__WINDOWS__)
  #include "windows/module.cc"
#elif defined(__APPLE__) && defined(__MACH__)
  #include "macos/module.cc"
#elif defined(__linux__) || defined(__unix__)
  #include "linux/module.cc"
#endif