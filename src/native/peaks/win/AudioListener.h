#pragma once

#include <mmdeviceapi.h>
#include <Audioclient.h>
#include <audiopolicy.h>
#include "IAudioSink.h"

class AudioListener
{
private:
	#define SAFE_RELEASE(punk)  \
				  if ((punk) != NULL)  \
					{ (punk)->Release(); (punk) = NULL; }

	WAVEFORMATEX* m_pwfx = NULL;

	IAudioClient* m_pAudioClient = NULL;
	IAudioCaptureClient* m_pCaptureClient = NULL;
	IMMDeviceEnumerator* m_pEnumerator = NULL;
	IMMDevice* m_pDevice = NULL;

	UINT32 m_bufferFrameCount;
	REFERENCE_TIME m_hnsActualDuration;

	const int m_refTimesPerMS = 10000;
	const int m_refTimesPerSec = 10000000;
	
	const CLSID m_CLSID_MMDeviceEnumerator = __uuidof(MMDeviceEnumerator);
	const IID m_IID_IMMDeviceEnumerator = __uuidof(IMMDeviceEnumerator);
	const IID m_IID_IAudioClient = __uuidof(IAudioClient);
	const IID m_IID_IAudioCaptureClient = __uuidof(IAudioCaptureClient);

public:
	DWORD GetAverageBytesPerSecond();
	DWORD GetSamplesPerSecond();
	AudioListener(int BitsPerSample, int FormatTag, int BlockAlign, int XSize);
	~AudioListener();
	HRESULT RecordAudioStream(IAudioSink*);
};