import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, Switch, Platform, Button } from "react-native";
//notifications
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
//import Constants from "expo-constants";
import * as Device from "expo-device";
//store
import { useSelector, useDispatch } from "react-redux";
//import { createNotifications } from "../store/parcelSlice";
import { setNotification } from "../helpers/NotificationsHelper";

import { IParcelState, ISettingsState } from "../interfaces/state";
import { AppTheme } from "../styled/theme";
import i18n from "../i18n/i18n";
import { IParcel, IRequestParams } from "../interfaces/parcel";
import { getPackageInfo, checkTrackingStatus } from "../store/parcelSlice";
import { RootState } from "../store/store";

const BACKGROUND_FETCH_TASK = "background-fetch";
let itemsCounter: number = 0;
let createNotifications = () => {};

// 1. Define the task by providing a name and the function that should be executed
// Note: This needs to be called in the global scope (e.g outside of your React components)
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const now = Date.now();
  console.log(
    `Got background fetch call at date: ${new Date(now).toISOString()}`
  );
  try {
    itemsCounter = 0;
    createNotifications();
  } catch (e) {
    console.error(
      "NotificationsComponent/dispatch.createNotifications line 98:",
      e
    );
  }

  // Be sure to return the successful result type!
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

const handleNotification = () => {
  console.log("ok! got your notification!");
};

const askNotification = async () => {
  //console.log("Device", Device);
  // We need to ask for Notification permissions for ios devices
  const { status } = await Notifications.requestPermissionsAsync();
  //TODO change: i didnt found isDevice property
  if (Device.isDevice && status === "granted") {
    console.log("Notification permissions granted.", status);
  } else {
    console.log("Notification permissions not granted!", status);
  }
};

const NotificationsComponent: React.FC = () => {
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.parcel.items);
  const { theme, language, location } = useSelector(
    (state: RootState) => state.settings
  );
  // Constructing styles for current theme
  const styles: any = useMemo(() => createStyles(theme), [theme]);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const [selectedLanguage, setSelectedLanguage] = useState<string>();
  //const [itemsCounter, setItemsCounter] = useState<number>(0);
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

  //notifications loop
  let i = 0;

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const wait = (ms: number) => {
    const start = new Date().getTime();
    let end = start;
    while (end < start + ms) {
      end = new Date().getTime();
    }
  };

  const getStatus = async (uuid: string) => {
    console.log("getStatus/items counter", itemsCounter);
    const response = await dispatch(checkTrackingStatus(uuid));
    console.log("getStatus response.payload.done", response.payload.done);
    if (response.payload.done) {
      itemsCounter++;
      createNotifications();
    } else {
      let now = Date.now();
      console.log("before", now);
      wait(1000);
      now = Date.now();
      console.log("1 sec after", now);
      getStatus(uuid);
    }
  };

  createNotifications = async () => {
    //test
    // const data = {
    //   title: 'TaskManager run in create notification func!',
    //   status: 'Got background fetch call at date',
    // }
    // setNotification(data, 3);
    //test
    //  create a loop function
    console.log(
      "*****createNotifications items counter****** i:",
      itemsCounter
    );
    console.log("*****createNotifications items.length****** i:", items.length);
    if (itemsCounter >= items.length) return;
    if (items[itemsCounter].status === "delivered") {
      itemsCounter++;
      createNotifications();
    } else {
      const requestParams: IRequestParams = {
        trackingId: items[itemsCounter].trackingNumber,
        location: location ? location : 'Israel',
        language: language ? language : 'en',
      };
      const response = await dispatch(getPackageInfo(requestParams));
      if (response.payload?.uuid) {
        getStatus(response.payload?.uuid);
      } else {
        itemsCounter++;
        createNotifications();
      }
    }
  };

  // 2. Register the task at some point in your app by providing the same name,
  // and some configuration options for how the background fetch should behave
  // Note: This does NOT need to be in the global scope and CAN be used in your React components!
  async function registerBackgroundFetchAsync() {
    return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      //minimumInterval: 60 * 360, // 360 minutes
      minimumInterval: 1 * 60, // task will fire 1 minute after app is backgrounded
      stopOnTerminate: false, // android only,
      startOnBoot: true, // android only,
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
      <View style={styles.row}>
        <Text style={styles.text}>
          Background fetch status:{" "}
          {status && BackgroundFetch.BackgroundFetchStatus[status]}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.text}>
          Background fetch task name:{" "}
          {isRegistered ? BACKGROUND_FETCH_TASK : "Not registered yet!"}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.text}>
          {isRegistered
            ? "Disable Push Notification"
            : "Enable Push Notification"}
        </Text>
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
      color: AppTheme[theme].text,
    },
    paragraph: {},
    row: {
      width: "95%",
      flexDirection: "row",
      margin: 10,
      alignItems: "center",
      color: AppTheme[theme].text,
      justifyContent: "space-between",
    },
  });

export default NotificationsComponent;
