#include <napi.h>

#define NOT_IMPLEMENTED .0f

#if defined(_WIN32) || defined(_WIN64) || defined(__WINDOWS__)
#include <Windows.h>
#include <objbase.h>
#include <mmdeviceapi.h>
#include <endpointvolume.h>

// holds volume peak information
// treble and bass not available
IAudioMeterInformation *pMeter = NULL;

#elif defined(__APPLE__) && defined(__MACH__)
#define IPC_IMPLEMENTATION
#include "macos/ipc.h"
ipc_sharedmemory mem;
#endif

Napi::Number NativeVolume(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
	float peak = NOT_IMPLEMENTED;
#if defined(_WIN32) || defined(_WIN64) || defined(__WINDOWS__)
  pMeter->GetPeakValue(&peak);
#elif defined(__APPLE__) && defined(__MACH__)
  memcpy(&peak,mem.data,sizeof(float));
#else
  // fallback returns NOT_IMPLEMENTED
#endif  

	return Napi::Number::New(env, peak);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
#if defined(_WIN32) || defined(_WIN64) || defined(__WINDOWS__)
	CoInitialize(NULL);
	IMMDeviceEnumerator *pEnum = NULL;
	IMMDevice *pDevice = NULL;

	HRESULT hr;
	hr = CoCreateInstance(__uuidof(MMDeviceEnumerator),
		NULL,
		CLSCTX_INPROC_SERVER,
		__uuidof(IMMDeviceEnumerator),
		(void**)&pEnum);

	hr = pEnum->GetDefaultAudioEndpoint(eRender, eConsole, &pDevice);

	pDevice->Activate(__uuidof(IAudioMeterInformation),
		CLSCTX_ALL,
		NULL,
		(void**)&pMeter);  
#elif defined(__APPLE__) && defined(__MACH__)
	ipc_mem_init(&mem, (char*)"lofi-volume-capture", 1024);
	if (ipc_mem_open_existing(&mem)) {
			ipc_mem_create(&mem);
			memset(mem.data, 0, mem.size);
	}
#endif
    
  exports.Set(Napi::String::New(env, "volume"),
              Napi::Function::New(env, NativeVolume));
  return exports;
}

NODE_API_MODULE(volume, Init)
