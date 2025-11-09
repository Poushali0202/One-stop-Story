import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './screens/WelcomeScreen';
import IntakeScreen from './screens/IntakeScreen';
import ReviewScreen from './screens/ReviewScreen';
import ConsentScreen from './screens/ConsentScreen';
import FacilityMatchScreen from './screens/FacilityMatchScreen';
import BackpackScreen from './screens/BackpackScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Intake" component={IntakeScreen} options={{ title: 'Tell Your Story' }} />
        <Stack.Screen name="Review" component={ReviewScreen} options={{ title: 'Review & Edit' }} />
        <Stack.Screen name="Consent" component={ConsentScreen} options={{ title: 'Consent & Share' }} />
        <Stack.Screen name="Facilities" component={FacilityMatchScreen} options={{ title: 'Facility Match' }} />
        <Stack.Screen name="Backpack" component={BackpackScreen} options={{ title: 'Backpack' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
