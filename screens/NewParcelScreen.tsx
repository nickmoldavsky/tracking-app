import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
  ImageStyle,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import { Input, Button } from "react-native-elements";
import { StackActions } from "@react-navigation/native";
//store
import { useSelector, useDispatch } from "react-redux";
import { addParcel, editParcel } from "../store/parcelSlice";
//interface
import { IParcelState, ISettingsState, IUserState } from "../interfaces/state";
import { IParcel } from "../interfaces/parcel";
//style
import { AppTheme } from "../styled/theme";
import i18n from "../i18n/i18n";

const NewParcelScreen = ({ navigation, route }) => {
  //store
  const dispatch = useDispatch();
  const parcels = useSelector((state: IParcelState) => state.parcel.items);
  console.log("newParcelScreen useSelector state.parcel:", parcels);
  const {theme, language} = useSelector((state: ISettingsState) => state.settings);
  i18n.locale = language;

  // Constructing styles for current theme
  const styles: any = useMemo(() => createStyles(theme), [theme]);

  const [inputTrackNumber, setInputTrackNumber] = useState(
    route.params?.action === "add" ? "" : route.params?.trackingNumber
  );
  const [inputTrackTitle, setInputTrackTitle] = useState(
    route.params?.action === "add" ? "" : route.params?.title
  );
  const trackingId = route.params?.id;
  const uid = Math.floor(Math.random() * 10000) + 1;
  const actionTitle = route.params?.action;
  const input = useRef<HTMLInputElement>();  //TODO check correct type
  const pageTitle = i18n.t("ADD_NEW_PARCEL_TITLE");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: pageTitle,
      headerStyle: { backgroundColor: AppTheme[theme].header },
    });
  }, [theme]);

  useEffect(() => {
    input.current.focus();
  }, []);

  const addNewParcel = (action = "Add") => {
    if(!inputTrackNumber) {
      input.current?.shake();
      return;
    }
    
    if (action !== "Add") {
      const payload: IParcel = {
        id: trackingId,
        trackingNumber: inputTrackNumber,
        title: inputTrackTitle,
      };
      console.log("edit payload: ", payload);
      dispatch(editParcel(payload));
      navigation.navigate("Home");
      return;
    }

    const newParcel: IParcel = {
      id: uid,
      title: inputTrackTitle,
      trackingNumber: inputTrackNumber,
    };

    dispatch(addParcel(newParcel));
    //navigate to the main screen
    navigation.dispatch(StackActions.popToTop());
    navigation.navigate("Details", {
      trackingNumber: inputTrackNumber,
      id: newParcel.id,
      trackingTitle: inputTrackTitle,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* <View style={styles.imageWrapper}>
        <Image style={styles.image} source={require("../assets/moto.jpeg")} />
      </View> */}

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.formView, styles.inner]}>
          {/* <Text style={styles.formTitle}>{actionTitle + " shipment"}</Text> */}
          <Input
            ref={input}
            placeholderTextColor={AppTheme[theme].text}
            inputStyle={[styles.formInput]}
            value={inputTrackNumber}
            placeholder={i18n.t("formTrackingNumber")}
            leftIcon={{
              type: "font-awesome",
              name: "barcode",
              color: AppTheme[theme].button,
            }}
            onChangeText={(value) => setInputTrackNumber(value)}
          />
          <Input
            placeholderTextColor={AppTheme[theme].text}
            inputStyle={[styles.formInput]}
            value={inputTrackTitle}
            placeholder={i18n.t("formTitle")}
            leftIcon={{
              type: "font-awesome",
              name: "file-text-o",
              color: AppTheme[theme].button,
            }}
            onChangeText={(value) => setInputTrackTitle(value)}
          />
          <View style={styles.buttonsWrapper}>
            <Button
              //disabled={!inputTrackNumber}
              buttonStyle={{
                width: 200,
                backgroundColor: AppTheme[theme].button,
                borderRadius: 3,
              }}
              title={i18n.t(actionTitle)}
              onPress={() => addNewParcel(actionTitle)}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

type Style = {
  container;
  formView;
  formInput;
  buttonsWrapper;
  button;
  inner: ViewStyle;
  formTitle: TextStyle;
  imageWrapper;
  image: ImageStyle;
};

const createStyles = (theme) =>
  StyleSheet.create<Style>({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: AppTheme[theme].container,
    },
    inner: {},
    formTitle: {
      marginBottom: 15,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "500",
      color: AppTheme[theme].title,
    },
    formView: {
      width: "80%",
    },
    formInput: {
      color: AppTheme[theme].text,
    },
    buttonsWrapper: {
      flexDirection: "row",
      justifyContent: "center",
    },
    button: {
      padding: 10,
      backgroundColor: AppTheme[theme].button,
      color: AppTheme[theme].button,
    },
    imageWrapper: {
      flex: 1,
      backgroundColor: "#4028b6",
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    image: {},
  });

export default NewParcelScreen;
