#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// LIFT: iOS side of lib/rest-alert.js (Android has RestAlert.java).
CAP_PLUGIN(RestAlertPlugin, "RestAlert",
           CAP_PLUGIN_METHOD(schedule, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(cancel, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(hold, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(buzz, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setAccent, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setNext, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(requestPermission, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(cue, CAPPluginReturnPromise);
)
