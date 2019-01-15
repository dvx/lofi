#include "FileWriteSink.h"
#include "FftComplex.h"

FileWriteSink::FileWriteSink(int Channels, int BitDepth, DWORD sampleRate, DWORD averageByesPerSecond)
{
	m_nChannels = Channels;
	m_bitDepth = BitDepth;
	m_sampleRate = sampleRate;
	std::cout << averageByesPerSecond << std::endl;
	m_complexData.resize((averageByesPerSecond / 1000) * UPDATE_RATE_MS);
	std::cout << m_complexData.size() << std::endl;

	// no need to store redundant "Nyquist" magnitudes
	m_magnitudes.resize(m_complexData.size() / 2);
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
		// waiting
	}
	else {
		for (unsigned int i = 0; i < byteCount; ++i) {
			// filling up data array
			if (m_currentByteNum < m_complexData.size()) {
				m_complexData[m_currentByteNum + 1] = (double)Data[i] / 255.f;
				++m_currentByteNum;
			}
			// ready to calculate FFT and do frequency analysis
			else {
				CalculatePeaks();
				m_currentByteNum = 0;
			}
		}
	}

	HRESULT notImpl = 0;
	return notImpl;
}

/*
void FileWriteSink::CalculatePeaks() {
	std::cout << "time slice ready! reseting fft data " << m_complexData.size() << std::endl;
	FFT(m_complexData);

	double freq_bin[] = { 19.0, 140.0, 400.0, 2600.0, 5200.0, (double)m_sampleRate / 2 };
	
	std::valarray<double> peakmaxArray{ -1, -1, -1, -1, -1 };

	for (int c = 0; c < m_complexData.size() / 2; ++c) {
		int max_index = -1;
		double peakmax = 1.7E-308;
		double freq = c * m_sampleRate / m_complexData.size();
		m_magnitudes[c] = std::sqrt(m_complexData[c].real() * m_complexData[c].real() + m_complexData[c].imag() * m_complexData[c].imag());
		
		for (int b = 0; b < 5; ++b) {
			if ((freq > freq_bin[b]) && (freq <= freq_bin[b + 1])) {
				if (m_magnitudes[c] > peakmaxArray[b]) {
					peakmaxArray[b] = m_magnitudes[c];
				}
			}
		}

		if (m_magnitudes[c] > peakmax) {
			peakmax = m_magnitudes[c];
			max_index = c;
		}

	}

	std::cout << peakmaxArray[0] << " - " << peakmaxArray[1] << " - " << peakmaxArray[2] << " - " << peakmaxArray[3] << " - " << peakmaxArray[4] << " - " << std::endl;
}
*/

#define BUCKETS 5

void FileWriteSink::CalculatePeaks()
{
	double real, imag;
	double peakmax = 1.7E-308;
	int max_index = -1, i, j;
	double magnitude;
	double* peakmaxArray = (double*)malloc(BUCKETS * sizeof(double));
	double nyquist = (double)m_sampleRate / 2;
	double freq_bin[] = { 19.0, 140.0, 400.0, 2600.0, 5200.0, nyquist };

	int frames = m_complexData.size();

	Fft::transform(m_complexData);

	for (i = 0; i<BUCKETS; ++i) peakmaxArray[i] = 1.7E-308;

	for (j = 0; j < frames / 2; ++j) {

		real = m_complexData[j].real();
		imag = m_complexData[j].imag();
		magnitude = sqrt(real*real + imag * imag) / frames / 2;
		double freq = j * m_sampleRate / frames;

		for (i = 0; i < BUCKETS; ++i) {
			if ((freq>freq_bin[i]) && (freq <= freq_bin[i + 1])) {
				if (magnitude > peakmaxArray[i]) {
					peakmaxArray[i] = magnitude;
				}
			}
		}

		if (magnitude > peakmax) {
			peakmax = magnitude;
			max_index = j;
		}
	}

	//results[packet_index].peakpower[ch] = 10 * (log10(peakmax));
	//results[packet_index].peakfreq[ch] = max_index * (double)wavSpec->freq / frames;

	for (i = 0; i< BUCKETS; ++i) {
		std::cout << 10 * (log10(peakmaxArray[i])) << " ";
	}
	std::cout << std::endl;

	for (i = 0; i< BUCKETS; ++i) {
		std::cout << peakmaxArray[i] << " ";
	}
	std::cout << std::endl;

	free(peakmaxArray);
}