import UIKit

@objc(BackgroundService)
class BackgroundService: RCTEventEmitter {
    var bgTask = UIBackgroundTaskIdentifier.invalid
    var delay = 0

    override func supportedEvents() -> [String]! {
        return ["backgroundService", "backgroundService.timeout"]
    }
    
    @objc private func _start() {
        self._stop()
        bgTask = UIApplication.shared.beginBackgroundTask(expirationHandler: {
            UIApplication.shared.endBackgroundTask(self.bgTask)
            self.bgTask = UIBackgroundTaskIdentifier.invalid
        })
        
        let thisBGTask = self.bgTask
        
        DispatchQueue.main.async(execute: {
            if(self.bridge != nil && thisBGTask == self.bgTask){
                self.sendEvent(withName: "backgroundService", body: NSNumber(integerLiteral: thisBGTask.rawValue))
            }
        })
    }
    
    @objc private func _stop(){
        if(bgTask != UIBackgroundTaskIdentifier.invalid){
            UIApplication.shared.endBackgroundTask(bgTask)
            bgTask = UIBackgroundTaskIdentifier.invalid
        }
    }
    
    @objc(start:resolver:rejecter:)
    func start(delay: Double, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock){
        self.delay = Int(delay)
        self._start()
        resolve(NSNumber(booleanLiteral: true))
    }
    
    @objc(stop:rejecter:)
    func stop(resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock){
        self._stop()
        resolve(NSNumber(booleanLiteral: true))
    }
    
    @objc(setTimeout:timeout:resolver:rejecter:)
    func setTimeout(timeoutId: Int, timeout: Double, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock){
        var task = self.bgTask
        
        task = UIApplication.shared.beginBackgroundTask(expirationHandler: {
            UIApplication.shared.endBackgroundTask(task)
        })
        
        DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(Int(timeout)), execute: {
            if(self.bridge != nil){
                self.sendEvent(withName: "backgroundService.timeout", body: NSNumber(integerLiteral: timeoutId))
            }
        })
        
        resolve(NSNumber(booleanLiteral: true))
    }
}
