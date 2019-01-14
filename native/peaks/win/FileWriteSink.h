#pragma once

#include <mmdeviceapi.h>
#include <Audioclient.h>
#include <audiopolicy.h>
#include <iostream>
#include <fstream>
#include "IAudioSink.h"
#include <complex>
#include <valarray>

const double PI = 3.141592653589793238460;
const double UPDATE_RATE_MS = 1000;

typedef std::complex<double> Complex;
typedef std::valarray<Complex> CArray;

class FileWriteSink : public IAudioSink
{
	std::ofstream file;

	CArray m_complexData;
	std::valarray<double> m_magnitudes;
	DWORD m_sampleRate;
	int m_nChannels;
	int m_bitDepth;
	int m_currentByteNum = 0;
public:
	FileWriteSink(int Channels, int BitDepth, DWORD sampleRate, DWORD averageByesPerSecond);
	~FileWriteSink();
	int CopyData(const BYTE*, const int) override;
	void FFT(CArray & data);
};
