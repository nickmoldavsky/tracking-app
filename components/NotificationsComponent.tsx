import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, Switch, Platform, Button } from "react-native";
//notifications
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
//store
import { useSelector, useDispatch } from "react-redux";
import { createNotifications } from "../store/parcelSlice";

import { IParcelState, ISettingsState } from "../interfaces/state";
import { AppTheme } from "../styled/theme";
import i18n from "../i18n/i18n";

const BACKGROUND_FETCH_TASK = "background-fetch";

export function setNotification(data, seconds) {
  const schedulingOptions = {
    content: {
      title: data.title,
      body: data.status,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      color: "blue",
    },
    trigger: {
      seconds: seconds,
    },
  };
  // Notifications show only when app is not active.
  // (ie. another app being used or device's screen is locked)
  Notifications.scheduleNotificationAsync(schedulingOptions);
}

// //test
// export function getColors() {
//   const colors = useSelector((state) => state.colors);
//   return colors;
// }
// //

const handleNotification = () => {
  console.warn("ok! got your notification!");
};

const askNotification = async () => {
  // We need to ask for Notification permissions for ios devices
  const { status } = await await Notifications.requestPermissionsAsync();
  //TODO change: i didnt found isDevice property
  if (Constants.isDevice && status === "granted")
    console.log("Notification permissions granted.");
};

const NotificationsComponent = () => {
  const dispatch = useDispatch();
  const items = useSelector((state: IParcelState) => state.parcel.items);
  const { theme, language, location } = useSelector((state: ISettingsState) => state.settings);
  // Constructing styles for current theme
  const styles: any = useMemo(() => createStyles(theme), [theme])
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const [selectedLanguage, setSelectedLanguage] = useState();
  const [locationInfo, setLocationInfo] = useState([]);
  const INDEX = 0;
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    askNotification();
    checkStatusAsync();
    // If we want to do something with the notification when the app
    // is active, we need to listen to notification events and
    // handle them in a callback
    const listener =
      Notifications.addNotificationReceivedListener(handleNotification);
    return () => listener.remove();
  }, []);

  const checkStatusAsync = async () => {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_FETCH_TASK
    );
    setStatus(status);
    setIsRegistered(isRegistered);
  };

  const toggleFetchTask = async () => {
    if (isRegistered) {
      await unregisterBackgroundFetchAsync();
    } else {
      await registerBackgroundFetchAsync();
    }
    checkStatusAsync();
  };

  // 1. Define the task by providing a name and the function that should be executed
  // Note: This needs to be called in the global scope (e.g outside of your React components)
  TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    const now = Date.now();
    console.log(
      `Got background fetch call at date: ${new Date(now).toISOString()}`
    );

    try {
      dispatch(createNotifications(now));
    } catch (e) {
      console.error(
        "NotificationsComponent/dispatch.createNotifications line 98:",
        e
      );
    }

    // Be sure to return the successful result type!
    return BackgroundFetch.BackgroundFetchResult.NewData;
  });

  // 2. Register the task at some point in your app by providing the same name,
  // and some configuration options for how the background fetch should behave
  // Note: This does NOT need to be in the global scope and CAN be used in your React components!
  async function registerBackgroundFetchAsync() {
    return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      //minimumInterval: 60 * 15, // 15 minutes
      minimumInterval: 1 * 60, // task will fire 1 minute after app is backgrounded
      stopOnTerminate: false, // android only,
      startOnBoot: true, // android only
    });
  }

  // 3. (Optional) Unregister tasks by specifying the task name
  // This will cancel any future background fetch calls that match the given name
  // Note: This does NOT need to be in the global scope and CAN be used in your React components!
  async function unregisterBackgroundFetchAsync() {
    return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
  }

  return (
    <>

      {/* <View style={styles.textContainer}>
        <Text style={styles.text}>
          Background fetch status:{" "}
          {status && BackgroundFetch.BackgroundFetchStatus[status]}
        </Text>
        <Text style={styles.text}>
          Background fetch task name:{" "}
          {isRegistered ? BACKGROUND_FETCH_TASK : "Not registered yet!"}
        </Text>
      </View> */}

      <View style={styles.row}>
        <Text style={styles.text}>{isRegistered ? "Disable Push Notification" : "Enable Push Notification"}</Text>
        <Switch
          trackColor={{ false: "#3e3e3e", true: AppTheme[theme].button }}
          thumbColor={isEnabled ? "#2C6BED" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleFetchTask}
          value={isRegistered}
        />
      </View>
     
      
    </>
  );
};

const createStyles = (theme: string) =>
StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppTheme[theme].container,
  },
  text: {
    color: AppTheme[theme].text
  },
  paragraph: {},
  row: {
    width: "65%",
    flexDirection: "row",
    margin: 10,
    alignItems: "center",
    color: AppTheme[theme].text,
    justifyContent: "space-between",
  },
});

export default NotificationsComponent;
