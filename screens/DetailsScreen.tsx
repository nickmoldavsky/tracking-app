import React, {
  useEffect,
  useState,
  useMemo,
  useLayoutEffect,
  useRef,
  MutableRefObject,
} from "react";
import {
  View,
  SafeAreaView,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { ListItem } from "react-native-elements";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons/";
//import LoadingComponent from "../components/LoadingComponent";
import DateTimeHelper from "../helpers/DateTimeHelper";
import CopyToClipboardHelper from "../helpers/CopyToClipboardHelper";

import { useSelector, useDispatch } from "react-redux";
//import { useAppSelector, useAppDispatch } from "../hook/redux"; //redux types
import { getPackageInfo, checkTrackingStatus } from "../store/parcelSlice";

//interfaces
import { IParcel, IRequestParams } from "../interfaces/parcel";
import { IParcelState, ISettingsState } from "../interfaces/state";

//styled
import { AppTheme } from "../styled/theme";
import i18n from "../i18n/i18n";

const DetailsScreen = ({ route, navigation }) => {
  const trackingId = route.params?.trackingNumber;
  const parcelId = route.params?.id;
  const parcelIndex = route.params?.index;
  const [parcelInfo, setParcelInfo] = useState<IParcel>();
  const [elementVisible, setElementVisible] = useState<boolean>(false);
  const [responseError, setResponseError] = useState<boolean>(false);
  const errorMessage: string =
    "No information about your parcel. We checked all relevant couriers for parcel " +
    trackingId;
  const dispatch = useDispatch<any>();
  //const dispatch = useAppDispatch();
  const { items, isLoading, error } = useSelector(
    (state: IParcelState) => state.parcel
  );
  const { theme, language, location } = useSelector(
    (state: ISettingsState) => state.settings
  );
  // Constructing styles for current theme
  const styles: any = useMemo(() => createStyles(theme), [theme]); //TODO change <any> type
  const loadingIndicator: boolean = isLoading;
  const firstUpdate: MutableRefObject<boolean> = useRef(true);
  const fetchData: MutableRefObject<boolean> = useRef(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params?.trackingTitle,
      headerTitleAlign: "center",
      headerBackTitleVisible: false,
      headerStyle: { backgroundColor: AppTheme[theme].header },
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setElementVisible(!elementVisible)}>
            <Entypo name="dots-three-vertical" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [elementVisible, theme]);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
    } else {
      if (
        (!parcelInfo?.status || parcelInfo?.status !== "delivered") &&
        !fetchData.current
      ) {
        fetchData.current = true;
        fetchParcelData();
      }
    }
    return () => {
      //TODO: abort request when living page
      //promise.abort();
    };
  }, [parcelInfo]);

  const fetchParcelData = async () => {
    const requestParams: IRequestParams = {
      trackingId,
      location,
      language,
    };
    const response = await dispatch(getPackageInfo(requestParams));
    console.log("DeatailsScreen/getPackageInfo/response:", response.payload);
    if (response.payload?.uuid) {
      getStatus(response.payload?.uuid);
    } else {
      console.log("request getPackageInfo complete!");
    }
  };

  useEffect(() => {
    updateParcelInfo(parcelId);
  }, [items]);

  const delay = async (ms: number) => new Promise((res) => setTimeout(res, ms));

  const getStatus = async (uuid: string) => {
    const response = await dispatch(checkTrackingStatus(uuid));
    console.log(
      "DetailsScreen/dispatch(checkTrackingStatus)/setTimeout:",
      response
    );
    if (response.payload.done) {
      console.log("Request complete");
    } else {
      console.log("delay 1sec ...");
      await delay(1000);
      getStatus(uuid);
    }
  };

  const updateParcelInfo = (id: number) => {
    items.find((item) => {
      if (item.id === id) {
        console.log("item by id:", item);
        setParcelInfo((prevParcelInfo) => {
          return (prevParcelInfo = item);
        });
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {error && (
        <View style={[styles.container, styles.center]}>
          <Text>{errorMessage}</Text>
        </View>
      )}

      {/* {loadingIndicator && <LoadingComponent animation="wave" />} */}

      {!error && (
        <View>
          <View style={[styles.parcel, styles.row]}>
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={24}
              color={AppTheme[theme].button}
            />
            <Text style={styles.statusText}>{trackingId}</Text>
            <MaterialCommunityIcons
              style={styles.copy}
              name="content-copy"
              size={16}
              onPress={() => CopyToClipboardHelper.copyToClipboard(trackingId)}
            />
          </View>

          <View style={[styles.route, styles.row]}>
            <Text style={styles.statusText}>{parcelInfo?.origin}</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={24}
              color={AppTheme[theme].text}
            />
            <Text style={styles.statusText}>{parcelInfo?.destination}</Text>
          </View>

          <View style={styles.status}>
            <Text style={styles.statusText}>
              {!parcelInfo?.status ? "" : i18n.t(parcelInfo?.status)}
            </Text>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor:
                      parcelInfo?.status !== "delivered"
                        ? AppTheme[theme].button
                        : "green",
                    width:
                      parcelInfo?.status !== "delivered"
                        ? parcelInfo?.status !== "arrived"
                          ? "30%"
                          : "85%"
                        : "100%",
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.loadingIndicator}>
            {/* {loadingIndicator && <LoadingComponent animation="wave" />} */}
            {/* <ActivityIndicator
              animating={loadingIndicator}
              size="small"
              color={AppTheme[theme].button}
            /> */}
          </View>

          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={fetchParcelData}
                colors={[AppTheme[theme].button]}
                tintColor={AppTheme[theme].button}
                //enabled={!isLoading}
              />
            }
            style={styles.scrollView}
          >
            {parcelInfo?.states &&
              parcelInfo.states.map((state, index) => {
                return (
                  <ListItem
                    key={index}
                    bottomDivider
                    containerStyle={{
                      backgroundColor: AppTheme[theme].container,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="circle-double"
                      size={10}
                      color={
                        parcelInfo?.status !== "delivered"
                          ? AppTheme[theme].button
                          : "green"
                      }
                    />
                    <ListItem.Content>
                      <ListItem.Title
                        style={{
                          fontWeight: "800",
                          fontSize: 15,
                          color: AppTheme[theme].title,
                        }}
                      >
                        {state?.status}
                      </ListItem.Title>
                      <ListItem.Subtitle
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{ color: AppTheme[theme].title }}
                      >
                        <Text style={{ opacity: 0.5, marginRight: 5 }}>
                          {DateTimeHelper.getFormattedDatetime(state?.date)}
                        </Text>
                      </ListItem.Subtitle>
                    </ListItem.Content>
                    <Text style={{ color: AppTheme[theme].title }}>
                      {state?.location}
                    </Text>
                  </ListItem>
                );
              })}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: string) =>
  StyleSheet.create({
    container: {
      backgroundColor: AppTheme[theme].container,
      height: "100%",
    },
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    parcel: {
      margin: 10,
      alignItems: "center",
    },
    row: {
      flexDirection: "row",
    },
    loading: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    options: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      height: 200,
      backgroundColor: "red",
      alignItems: "center",
      justifyContent: "center",
    },
    status: {
      marginTop: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    statusText: {
      fontSize: 18,
      color: AppTheme[theme].text,
    },
    progressBar: {
      width: "90%",
      height: 10,
      backgroundColor: "#FFF",
      borderWidth: 1,
      borderRadius: 8,
      borderColor: "#CCC",
      flexDirection: "row",
    },
    copy: {
      marginLeft: 10,
      color: AppTheme[theme].button,
    },
    route: {
      marginLeft: 15,
    },
    scrollView: {
      //backgroundColor: AppTheme[theme].container,
    },
  });

export default DetailsScreen;
