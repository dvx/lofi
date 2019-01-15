#pragma once

#include <mmdeviceapi.h>
#include <Audioclient.h>
#include <audiopolicy.h>
#include <iostream>
#include <fstream>
#include "IAudioSink.h"
#include <complex>
#include <valarray>
#include <vector>

const double PI = 3.141592653589793238460;
const double UPDATE_RATE_MS = .1;

typedef std::complex<double> Complex;

class FileWriteSink : public IAudioSink
{
	std::ofstream file;

	std::vector<Complex> m_complexData = std::vector<Complex>();
	std::valarray<double> m_magnitudes;
	DWORD m_sampleRate;
	int m_nChannels;
	int m_bitDepth;
	int m_currentByteNum = 0;
	void CalculatePeaks();
public:
	FileWriteSink(int Channels, int BitDepth, DWORD sampleRate, DWORD averageByesPerSecond);
	~FileWriteSink();
	int CopyData(const BYTE*, const int) override;
};
