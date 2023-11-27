import { NativeEventEmitter } from 'react-native';
import {
  DeviceEventEmitter,
  NativeAppEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-background-service' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const RNBackgroundService = NativeModules.BackgroundService
  ? NativeModules.BackgroundService
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

type CallbacksType = {
  [key: string]: {
    callback: () => void;
    interval: boolean;
    timeout: number;
  };
};

type Callback = () => void;
class BackgroundService {
  uniqueId = 0;
  callbacks: CallbacksType = {};

  constructor() {
    this.uniqueId = 0;
    this.callbacks = {};

    new NativeEventEmitter(RNBackgroundService).addListener(
      'backgroundService.timeout',
      (id: number) => {
        if (this.callbacks[id] !== undefined) {
          const { callback } = this.callbacks[id];
          if (!this.callbacks[id]?.interval) {
            delete this.callbacks[id];
          } else {
            RNBackgroundService.setTimeout(id, this.callbacks[id]?.timeout);
          }
          callback();
        }
      }
    );
  }

  start = (delay: number): Promise<void> => {
    return RNBackgroundService.start(delay);
  };

  stop = (): Promise<void> => {
    return RNBackgroundService.stop();
  };

  setTimeout = (callback: Callback, timeout: number) => {
    this.uniqueId += 1;
    this.callbacks[this.uniqueId] = {
      callback,
      interval: false,
      timeout,
    };

    RNBackgroundService.setTimeout(this.uniqueId, timeout);
    return this.uniqueId;
  };

  setInterval = (callback: Callback, timeout: number) => {
    this.uniqueId += 1;

    this.callbacks[this.uniqueId] = {
      callback,
      interval: true,
      timeout,
    };
    RNBackgroundService.setTimeout(this.uniqueId, timeout);
    return this.uniqueId;
  };

  addBackgroundService = (callback: Callback, timeout: number) => {
    const emitter = Platform.select({
      ios: () => NativeAppEventEmitter,
      default: () => DeviceEventEmitter,
    })();

    this.start(timeout);
    this.backgroundListener = emitter.addListener('backgroundService', () => {
      this.backgroundListener.remove();
      this.backgroundClockMethod(callback, timeout);
    });
  };

  stopBackgroundService = () => {
    this.stop();
    clearTimeout(this.backgroundTimer);
  };

  backgroundClockMethod = (callback: Callback, delay: number) => {
    this.backgroundTimer = setTimeout(() => {
      callback();
      this.backgroundClockMethod(callback, delay);
    }, delay);
  };
}

export default new BackgroundService();
