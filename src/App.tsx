import React, { useEffect, useState } from 'react';
import { checkAvailable, loggingStop, myModuleEvt } from './pedometer';
import { Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';
import RNShake from 'react-native-shake';
import Pedometer from 'react-native-pedometer-ios-android';
import { askFor, checkPermission } from './permission';

const App = () => {
  const [allowed, setAllow] = useState(false);
  const [steps, setSteps] = useState(0);

  /** get user's motion permission and check pedometer is available */
  useEffect(() => {
    const askPermission = async () => {
      await askFor();
      const isOk = await (Platform.OS === 'ios'
        ? checkPermission(PERMISSIONS.IOS.MOTION)
        : checkPermission(PERMISSIONS.ANDROID.BODY_SENSORS_BACKGROUND));
      console.debug('🚀 - file: App.tsx:18 - isOk', isOk);
      const possible = await checkAvailable();
      console.debug('🚀 - file: App.tsx:21 - possible', possible);
      setAllow(isOk && possible);
    };
    askPermission();
  }, []);

  /** get user's step count change and set-state of it */
  useEffect(() => {
    if (allowed) {
      myModuleEvt.addListener('StepCounter', data => {
        setSteps(step => {
          console.log('STEPS', step);
          return data.steps;
        });
      });
      RNShake.addListener(() => {
        console.log('Maybe, This User is Cheating');
      });
      Pedometer.startStepCounter();
    }
    return () => {
      loggingStop();
      RNShake.removeAllListeners();
    };
  }, [allowed]);

  return (
    <SafeAreaView>
      <View style={styles.screen}>
        <Text style={styles.step}>사용가능:{allowed ? `🅾️` : `️❎`}</Text>
        <Text style={styles.step}>걸음 수: {steps}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  step: {
    fontSize: 36,
    color: '#000',
  },
});

export default App;