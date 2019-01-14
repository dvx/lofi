#include "FileWriteSink.h"
#include <iostream>
#include <fstream>

#include <complex>
#include <iostream>
#include <valarray>

const double PI = 3.141592653589793238460;

typedef std::complex<double> Complex;
typedef std::valarray<Complex> CArray;

// Cooley–Tukey FFT (in-place, divide-and-conquer)
// Higher memory requirements and redundancy although more intuitive
void fft(CArray& x)
{
	const size_t N = x.size();
	if (N <= 1) return;

	// divide
	CArray even = x[std::slice(0, N / 2, 2)];
	CArray  odd = x[std::slice(1, N / 2, 2)];

	// conquer
	fft(even);
	fft(odd);

	// combine
	for (size_t k = 0; k < N / 2; ++k)
	{
		Complex t = std::polar(1.0, -2 * PI * k / N) * odd[k];
		x[k] = even[k] + t;
		x[k + N / 2] = even[k] - t;
	}
}

FileWriteSink::FileWriteSink(int Channels, int BitDepth)
{
	m_nChannels = Channels;
	m_bitDepth = BitDepth;
	file.open("test.pcm", std::ios::out | std::ios::app | std::ios::binary);
}


FileWriteSink::~FileWriteSink()
{
	file.close();
}

int FileWriteSink::CopyData(const BYTE* Data, const int NumFramesAvailable)
{
	int bytesPerSample = m_bitDepth / 8;
	unsigned int byteCount = NumFramesAvailable * bytesPerSample * m_nChannels;

	if (Data == NULL) {
		std::cout << byteCount << std::endl;
	}
	else {
		std::cout << (double)Data[0] / 255.f << std::endl;
		//file.write((const char *)Data, byteCount);
	}

	HRESULT notImpl = 0;
	return notImpl;
}
