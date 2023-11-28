package com.backgroundservice;

import android.annotation.SuppressLint;
import android.os.Handler;
import android.os.PowerManager;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.lang.Runnable;

@ReactModule(name = BackgroundServiceModule.NAME)
public class BackgroundServiceModule extends ReactContextBaseJavaModule {
  private Handler handler;
  private ReactContext reactContext;
  private Runnable runnable;
  private PowerManager powerManager;
  private PowerManager.WakeLock wakeLock;
  private final LifecycleEventListener listener = new LifecycleEventListener(){
    @Override
    public void onHostResume(){}

    @Override
    public void onHostPause(){}

    @Override
    public void onHostDestroy(){
      if(wakeLock.isHeld())  wakeLock.release();
    }
  };
  public static final String NAME = "BackgroundService";

  @SuppressLint("InvalidWakeLockTag")
  public BackgroundServiceModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    this.powerManager = (PowerManager) getReactApplicationContext().getSystemService(reactContext.POWER_SERVICE);
    this.wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "background_wakelock");
    reactContext.addLifecycleEventListener(listener);
  }

  @Override
  @NonNull
  public String getName() {

    return NAME;
  }

  private void sendEvent(ReactContext reactContext, String eventName) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
      .emit(eventName, null);
  }

  @ReactMethod
  public void stop(){
    if(wakeLock.isHeld()) wakeLock.release();

    if(handler != null) handler.removeCallbacks(runnable);
  }

  @ReactMethod
  public void start(final int delay){
    if(!wakeLock.isHeld()) wakeLock.acquire();

    handler = new Handler();
    runnable = () -> sendEvent(reactContext, "backgroundService");

    handler.post(runnable);
  }

  @ReactMethod
  public void setTimeout(final int id, final double timeout){
    Handler handler = new Handler();
    handler.postDelayed(new Runnable() {
      @Override
      public void run() {
        if(getReactApplicationContext().hasActiveReactInstance()){
          getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("backgroundService.timeout", id);
        }
      }
    }, (long) timeout);
  }
}
