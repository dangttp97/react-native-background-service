# react-native-background-service

A simple React Native library inspired by react-native-background-timer for managing background service and task

## Installation

```sh
npm install @dangttp/react-native-background-service
```

or

```sh
yarn add @dangttp/react-native-background-service
```

## Usage

```js
import BackgroundService from '@dangttp/react-native-background-service';
```

Call `addBackgroundService(callback: () => void, delay: number)` when you want to loop after amount of miliseconds (even in background mode) like shown below

```js
/** In my example I use it in my App.tsx initial useEffect */

useEffect(() => {
  BackgroundService.addBackgroundService(async () => {
    const location = await fetchLocation();
    emitLocationToSocket(location);
  }, 10000);

  return () => {
    BackgroundService.stopBackgroundService();
  };
}, []);
```

Call `stopBackgroundService()` when you discard your app like shown below

```js
useEffect(() => {
  // Your code here

  return () => {
    BackgroundService.stopBackgroundService();
  };
}, []);
```

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
