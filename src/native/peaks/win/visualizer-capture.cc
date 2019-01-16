#include "AudioListener.h"
#include "FileWriteSink.h"
#include "IAudioSink.h"

int main() {
	CoInitialize(nullptr);
	int bitDepth = 16;
	int channels = 2;
	AudioListener listener(bitDepth, WAVE_FORMAT_PCM, 4, 0);
	FileWriteSink sink(channels, bitDepth, listener.GetSamplesPerSecond(), listener.GetAverageBytesPerSecond());
	listener.RecordAudioStream(&sink);
}