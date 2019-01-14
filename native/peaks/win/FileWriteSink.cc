#include "FileWriteSink.h"

void FileWriteSink::FFT(CArray& data)
{
	const size_t N = data.size();
	if (N <= 1) return;

	// divide
	CArray even = data[std::slice(0, N / 2, 2)];
	CArray  odd = data[std::slice(1, N / 2, 2)];

	// conquer
	FFT(even);
	FFT(odd);

	// combine
	for (size_t k = 0; k < N / 2; ++k)
	{
		Complex t = std::polar(1.0, -2 * PI * k / N) * odd[k];
		data[k] = even[k] + t;
		data[k + N / 2] = even[k] - t;
	}
}

FileWriteSink::FileWriteSink(int Channels, int BitDepth, DWORD sampleRate, DWORD averageByesPerSecond)
{
	m_nChannels = Channels;
	m_bitDepth = BitDepth;
	m_sampleRate = sampleRate;
	m_complexData.resize((averageByesPerSecond / 1000) * UPDATE_RATE_MS);

	// no need to store redundant "Nyquist" magnitudes
	m_magnitudes.resize(m_complexData.size() / 2);
}

FileWriteSink::~FileWriteSink()
{
	file.close();
}

int FileWriteSink::CopyData(const BYTE* Data, const int NumFramesAvailable)
{
	//system("cls");
	int bytesPerSample = m_bitDepth / 8;
	unsigned int byteCount = NumFramesAvailable * bytesPerSample * m_nChannels;
	int maxData = m_complexData.size();

	if (Data == NULL) {
		//std::cout << byteCount << std::endl;
	}
	else {
		for (unsigned int i = 0; i < byteCount; ++i) {
			if (m_currentByteNum < maxData) {
				m_complexData[m_currentByteNum + 1] = (double)Data[i] / 255.f;
				++m_currentByteNum;
			}
			else
			{
				//std::cout << "time slice ready! reseting fft data " << m_complexData.size() << std::endl;
				FFT(m_complexData);

				double freq_bin[] = { 19.0, 140.0, 400.0, 2600.0, 5200.0, (double)m_sampleRate / 2 };
				double peakmax = 1.7E-308;
				int max_index = -1;
				std::valarray<double> peakmaxArray{ peakmax, peakmax, peakmax, peakmax, peakmax };

				for (int c = 0; c < maxData / 2; ++c) {
					double freq = c * m_sampleRate / maxData;
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

				//for (int b = 0; b < 5; ++b) {
				//	peakmaxArray[b] = 20 * (std::log10(peakmaxArray[b] / 20000));
				//}
				std::cout << peakmaxArray[0] << " _ " << peakmaxArray[1] << " _ " << peakmaxArray[2] << " _ " << peakmaxArray[3] << " _ " << peakmaxArray[4] << std::endl;
				m_currentByteNum = 0;
			}
		}
		//fft(complexData);
		//std::cout << complexData[0] << std::endl;
		//file.write((const char *)Data, byteCount);
	}

	HRESULT notImpl = 0;
	return notImpl;
}
