import React, { useEffect, useState, useMemo, useLayoutEffect, useRef } from "react";
import {
  View,
  SafeAreaView,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { ListItem } from "react-native-elements";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons/";
//import LoadingComponent from "../components/LoadingComponent";
import DateTimeHelper from "../helpers/DateTimeHelper";
import CopyToClipboardHelper from "../helpers/CopyToClipboardHelper";

import { useSelector, useDispatch } from "react-redux";
//import { useAppSelector, useAppDispatch } from "../hook/redux"; //types
import { getPackageInfo } from "../store/parcelSlice";

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
  const API_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIzMjUwMDk3MC1mZDNhLTExZWQtYjViZC03MTg2YTk3NzRiOTEiLCJzdWJJZCI6IjY0NzMxZjBmNzNkMGJiNTE5NzllNmJmYiIsImlhdCI6MTY4NTI2NjE5MX0.w4gvxSgOOWM1gsUoKcqR-pTJAWPqjSFPmv7TV_-urCs";
  const [parcelInfo, setParcelInfo] = useState<IParcel>();
  const [elementVisible, setElementVisible] = useState<boolean>(false);
  const [responseError, setResponseError] = useState<boolean>(false);
  const errorMessage =
    "No information about your parcel. We checked all relevant couriers for parcel " +
    trackingId;
  const dispatch = useDispatch<any>();
  //const dispatch = useAppDispatch();
  const { items, isLoading, error } = useSelector((state: IParcelState) => state.parcel);
  const {theme, language, location} = useSelector((state: ISettingsState) => state.settings);
  // Constructing styles for current theme
  const styles: any = useMemo(() => createStyles(theme), [theme]);

  const loadingIndicator: boolean = isLoading;
  const firstUpdate = useRef(true);
  const fetchData = useRef(false);

  //console.log("DetailsScreen user language: ", language);
  //console.log("DetailsScreen user location: ", location);
  //console.log("DetailsScreen state items:", items);
  //console.log("DetailsScreen parcelInfo:", parcelInfo);

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
        const requestParams: IRequestParams = {
          trackingId,
          location,
          language,
        };
        const promise = dispatch(getPackageInfo(requestParams));
        return () =>  {
          promise.abort();
          //alert('exit1');
        }
      }
    }

    //return () => {
      //if (timeOutId) clearTimeout(timeOutId);
      //promise.abort();
      //alert('exit2')
    //};
  }, [parcelInfo]);

  useEffect(() => {
    updateParcelInfo(parcelId);
  }, [items]);

  const updateParcelInfo = (id) => {
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
            <Text style={styles.statusText}>{i18n.t(parcelInfo?.status)}</Text>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor:
                      parcelInfo?.status !== "delivered" ? AppTheme[theme].button : "green",
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
          <ActivityIndicator
              animating={loadingIndicator}
              size="small"
              color={AppTheme[theme].button}
            />
          </View>

          <ScrollView style={styles.scrollView}>
            {parcelInfo?.states &&
              parcelInfo.states.map((state, index) => {
                return (
                  <ListItem key={index} bottomDivider containerStyle={{backgroundColor: AppTheme[theme].container}}>
                    <MaterialCommunityIcons
                      name="circle-double"
                      size={10}
                      color={
                        parcelInfo?.status !== "delivered" ? AppTheme[theme].button : "green"
                      }
                    />
                    <ListItem.Content>
                      <ListItem.Title
                        style={{ fontWeight: "800", fontSize: 15, color: AppTheme[theme].title }}
                      >
                        {state?.status}
                      </ListItem.Title>
                      <ListItem.Subtitle numberOfLines={1} ellipsizeMode="tail" style={{color: AppTheme[theme].title}}>
                        <Text style={{ opacity: 0.5, marginRight: 5 }}>
                          {DateTimeHelper.getFormattedDatetime(state?.date)}
                        </Text>
                      </ListItem.Subtitle>
                    </ListItem.Content>
                    <Text style={{color: AppTheme[theme].title}}>{state?.location}</Text>
                  </ListItem>
                );
              })}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
  container: {
    backgroundColor: AppTheme[theme].container,
    height: "100%"
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
    color: AppTheme[theme].text
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
    color: AppTheme[theme].button
  },
  route: {
    marginLeft: 15,
  },
  scrollView: {
    //backgroundColor: AppTheme[theme].container,
  }
});

export default DetailsScreen;
