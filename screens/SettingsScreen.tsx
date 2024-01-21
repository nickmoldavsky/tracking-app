import React, { useEffect, useLayoutEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Platform,
  Pressable,
} from "react-native";
//i18n
import * as Localization from "expo-localization";
import i18n from "../i18n/i18n";
//store
import { useSelector, useDispatch } from "react-redux";
import { setDarkTheme, setDefaultTheme } from "../store/settingsSlice";
//components
import NotificationsComponent from "../components/NotificationsComponent";
//theme
//import { ThemeProvider } from "styled-components";
import styled from "styled-components/native";
import { AppTheme } from "../styled/theme";
import { ISettingsState } from "../interfaces/state";
import FooterComponent from "../components/FooterComponent";
import { RootState } from "../store/store";
import { SettingsScreenProps } from "../types/types";

const SettingsScreen: React.FC = ({ navigation }: SettingsScreenProps) => {
  const dispatch = useDispatch();
  const { theme, colors, darkmode, language, location } = useSelector(
    (state: RootState) => state.settings
  );
  const Container = styled.View`
    background-color: ${darkmode ? "#000" : "#fff"};
  `;

  //i18n
  let deviceLanguage = Localization.locale.replace(/-US/g, "").toLowerCase();
  if (!deviceLanguage || deviceLanguage !== "en" && deviceLanguage !== "ru") {
    deviceLanguage = "en";
  } else {
    //set app language
  }
  i18n.locale = language;
  //i18n.defaultLocale

  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [darkThemeIsEnabled, setDarkThemeIsEnabled] = useState<boolean>(darkmode);
  const styles = useMemo(() => createStyles(theme), [theme]);
  //const [locationInfo, setLocationInfo] = useState([]);

  //const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const INDEX = 0;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: i18n.t("SETTINGS"),
      headerStyle: {
        backgroundColor: AppTheme[theme].header,
      },
    });
  }, [language, theme]);

  useEffect(() => {}, []);

  const setDark = () => {
    dispatch(setDarkTheme());
  };

  const setDefault = () => {
    dispatch(setDefaultTheme());
  };

  const switchTheme = () => {
    if (darkThemeIsEnabled) {
      setDarkThemeIsEnabled(false);
      setDefault();
    } else {
      setDarkThemeIsEnabled(true);
      setDark();
    }
  };

  return (
    //<ThemeProvider theme={theme}>
    //<Container>
    <View style={styles.container}>

      {/* <View style={styles.row}>
        <Pressable>
          <Text style={styles.text}> Locale city: {locationInfo[INDEX]?.city}</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Pressable>
          <Text style={styles.text}> Device Language: {locationInfo[INDEX]?.country}</Text>
        </Pressable>
      </View> */}

      <View style={styles.row}>
        <Pressable
          style={styles.row}
          onPress={() =>
            navigation.navigate("Location", {
              action: "SET_LANGUAGE",
            })
          }
        >
          <Text style={styles.text}>{i18n.t("APP_LANGUAGE")}</Text>
          <Text style={styles.text}>{language}</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Pressable
          style={styles.row}
          onPress={() =>
            navigation.navigate("Location", {
              action: "SET_LOCATION",
            })
          }
        >
          <Text style={styles.text}>{i18n.t("DESTINATION_COUNTRY")}</Text>
          <Text style={styles.text}>{location}</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Text style={styles.text}>{i18n.t("DARK_THEME")}</Text>
        <Switch
          style={styles.switch}
          trackColor={{ false: "#3e3e3e", true: AppTheme[theme].button }}
          thumbColor={isEnabled ? "#2C6BED" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={switchTheme}
          value={darkThemeIsEnabled}
        />
      </View>

      <NotificationsComponent />
    </View>
    //</Container>
    //</ThemeProvider>
    
  );
};

const createStyles = (theme: string) =>
  StyleSheet.create({
    container: {
      height: "100%",
      alignItems: "center",
      backgroundColor: AppTheme[theme].container,
    },
    row: {
      width: "95%",
      flexDirection: "row",
      margin: 10,
      alignItems: "center",
      color: AppTheme[theme].text,
      justifyContent: "space-between"
    },
    text: {
      color: AppTheme[theme].text,
      
    },
    switch: {
     
    },
    paragraph: {},
  });

export default SettingsScreen;
