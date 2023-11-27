import * as React from 'react';
import { useEffect } from 'react';

import { StyleSheet, View } from 'react-native';

import BackgroundService from '@dangttp/react-native-background-service';
import RNLocation from 'react-native-location';

export default function App() {
  // const [result, setResult] = React.useState<number | undefined>();

  useEffect(() => {
    RNLocation.configure({
      distanceFilter: 100, // Meters
      desiredAccuracy: {
        ios: 'best',
        android: 'balancedPowerAccuracy',
      },
    });

    RNLocation.requestPermission({
      ios: 'always',
      android: {
        detail: 'coarse',
      },
    });

    BackgroundService.addBackgroundService(() => {
      RNLocation.subscribeToLocationUpdates((locations) => {
        console.log('Location', JSON.stringify(locations[0]));
      });
    }, 10000);

    return () => {
      BackgroundService.stopBackgroundService();
    };
  }, []);

  return (
    <View style={styles.container}>{/* <Text>Result: {result}</Text> */}</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
