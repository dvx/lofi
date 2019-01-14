#pragma once

#include <mmdeviceapi.h>
#include <Audioclient.h>
#include <audiopolicy.h>
#include <iostream>
#include <fstream>
#include "IAudioSink.h"

class FileWriteSink : public IAudioSink
{
	std::ofstream file;

	int m_nChannels;
	int m_bitDepth;
public:
	FileWriteSink(int Channels, int BitDepth);
	~FileWriteSink();
	int CopyData(const BYTE*, const int) override;
};
