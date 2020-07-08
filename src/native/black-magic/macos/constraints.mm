#import <objc/runtime.h>
#import <Foundation/Foundation.h>
#import <Cocoa/Cocoa.h>

@interface Constraints : NSObject
 
@end

@implementation Constraints

- (NSRect)dontConstrainFrameRect:(NSRect)frameRect toScreen:(NSScreen *)screen {
  return frameRect;
}

+ (void)load {
  NSLog(@"Attempting to suppress ElectronNSWindow constraints...");
  static dispatch_once_t once_token;
  dispatch_once(&once_token,  ^{
    Class clazz = objc_getClass("ElectronNSWindow");
    SEL constrainFrameRectSelector = @selector(constrainFrameRect:toScreen:);
    SEL dontConstrainFrameRectSelector = @selector(dontConstrainFrameRect:toScreen:);
    Method originalMethod = class_getInstanceMethod(clazz, constrainFrameRectSelector);
    Method extendedMethod = class_getInstanceMethod(self, dontConstrainFrameRectSelector);
    method_exchangeImplementations(originalMethod, extendedMethod);
  });
}

@end
