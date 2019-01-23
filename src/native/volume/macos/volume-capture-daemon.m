#import <Foundation/Foundation.h>
#import <CoreAudio/CoreAudio.h>
#import <AVFoundation/AVFoundation.h>

#define IPC_IMPLEMENTATION
#include "ipc.h"

#define BUCKETS 64

@interface VolumeDelegator : NSObject<AVCaptureAudioDataOutputSampleBufferDelegate>
- (void)captureOutput:(AVCaptureOutput *)output didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer fromConnection:(AVCaptureConnection *)connection;
@property float volume;
@property int pID;
@end

@implementation VolumeDelegator
- (void)captureOutput:(AVCaptureOutput *)output didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer fromConnection:(AVCaptureConnection *)connection {
    CMItemCount numSamplesInBuffer = CMSampleBufferGetNumSamples(sampleBuffer);
    
    AudioBufferList audioBufferList;
    CMBlockBufferRef buffer;
    ipc_sharedmemory mem;
    ipc_mem_init(&mem, "lofi-volume-capture", 1024);
    ipc_mem_open_existing(&mem);
    
    OSStatus err = CMSampleBufferGetAudioBufferListWithRetainedBlockBuffer(sampleBuffer, nil, &audioBufferList, sizeof(audioBufferList), nil, nil, kCMSampleBufferFlag_AudioBufferList_Assure16ByteAlignment, &buffer);
    
    for (UInt32 bufferCount = 0; bufferCount < audioBufferList.mNumberBuffers; bufferCount++) {
        Float32* samples = (Float32*)audioBufferList.mBuffers[bufferCount].mData;
        Float32 sum = 0;
        for (int i = 0;i < numSamplesInBuffer; ++i) {
            sum += fabs(samples[i]);
        }
        //self.volume = sum / numSamplesInBuffer;
        float vol = sum / numSamplesInBuffer;
        memcpy(mem.data,&vol,sizeof(float));        
        //NSLog(@"%f", self.volume);
    }
    CFRelease(buffer);
}
@end

int main() {
    ipc_sharedmemory mem;
    AVCaptureSession *captureSession = [[AVCaptureSession alloc] init];
    VolumeDelegator *volumeDelegator = [[VolumeDelegator alloc] init];
    NSArray<AVCaptureDevice *> *devices = [AVCaptureDevice devicesWithMediaType:AVMediaTypeAudio];
    AVCaptureDevice *audioCaptureDevice = Nil;
    
    for (AVCaptureDevice *device in devices) {
        NSLog(@"Found: %@", [device localizedName]);
        if ([[device localizedName] isEqualToString: @"iShowU Audio Capture"]) {
            NSLog(@"OK: %@", [device localizedName]);
            audioCaptureDevice = device;
        }
    }
    
    NSError *error = nil;
    AVCaptureDeviceInput *audioInput = [AVCaptureDeviceInput deviceInputWithDevice:audioCaptureDevice error:&error];
    AVCaptureAudioDataOutput *audioOutput = [[AVCaptureAudioDataOutput alloc] init];
    
    NSMutableDictionary *outputSettings = [[NSMutableDictionary alloc] initWithCapacity:10];
    [outputSettings setObject:[NSNumber numberWithInt: kAudioFormatLinearPCM] forKey: AVFormatIDKey];
    [outputSettings setObject:[NSNumber numberWithFloat:44100] forKey: AVSampleRateKey];
    [outputSettings setObject:[NSNumber numberWithInt:2] forKey:AVNumberOfChannelsKey];
    [outputSettings setObject:[NSNumber numberWithInt:32] forKey:AVLinearPCMBitDepthKey];
    [outputSettings setObject:[NSString stringWithFormat:@"NO"] forKey:AVLinearPCMIsBigEndianKey];
    [outputSettings setObject:[NSString stringWithFormat:@"YES"] forKey:AVLinearPCMIsFloatKey];
    
    [audioOutput setAudioSettings:outputSettings];
    //[audioOutput setSampleBufferDelegate:volumePeakMeter queue:dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0) ];
    dispatch_queue_t queue = dispatch_queue_create("lofi.volume.meter", DISPATCH_QUEUE_SERIAL);
    [audioOutput setSampleBufferDelegate:volumeDelegator queue:queue ];
    
    if ([captureSession canAddInput:audioInput] && [captureSession canAddOutput:audioOutput]) {
        NSLog(@"Adding input and output!");
        [captureSession beginConfiguration];
        [captureSession addInput:audioInput];
        [captureSession addOutput:audioOutput];
        [captureSession commitConfiguration];
    }

    NSLog(@"Setting up shared memory...");
    ipc_mem_init(&mem, "lofi-volume-capture", 1024);
	if (ipc_mem_open_existing(&mem)) {
			ipc_mem_create(&mem);
			memset(mem.data, 0, mem.size);
	}    
    NSLog(@"Dispatching thread...");
    dispatch_async(queue, ^(void) {
        [captureSession startRunning];
    });

    while (1) {
        usleep(5000000);
  }
}
