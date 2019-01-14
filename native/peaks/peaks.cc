#include <napi.h>

const float NOT_IMPLEMENTED = -1.0;
float peak;

#if defined(_WIN32) || defined(_WIN64) || defined(__WINDOWS__)
#include <Windows.h>
#include <objbase.h>
#include <mmdeviceapi.h>
#include <endpointvolume.h>

// holds volume peak information
// treble and bass not available
IAudioMeterInformation *pMeter = NULL;

#elif defined(__APPLE__) && defined(__MACH__)
  // TODO: OSX implementation
#endif

void RunCallback(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::Function cb = info[0].As<Napi::Function>();

#if defined(_WIN32) || defined(_WIN64) || defined(__WINDOWS__)
  pMeter->GetPeakValue(&peak);
#elif defined(__APPLE__) && defined(__MACH__)
  // TODO: OSX implementation
  peak = NOT_IMPLEMENTED;
#else
  // fallback returns -1.0
  peak = NOT_IMPLEMENTED;
#endif  

  cb.Call(env.Global(), { Napi::Number::New(env, peak) });
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
  // TODO: OSX implementation
#endif
    
  return Napi::Function::New(env, RunCallback);
}

NODE_API_MODULE(peaks, Init)
