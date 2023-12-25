import { StatusBar } from "expo-status-bar";
import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  ReactPropTypes,
} from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  FlatList,
  Pressable,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { SearchBar, Avatar } from "react-native-elements";
import {
  AntDesign,
  FontAwesome,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons/";

import {
  useIsFocused,
  RouteProp,
  NavigationProp,
} from "@react-navigation/native";

//store
import { useSelector, useDispatch } from "react-redux";
import {
  deleteParcel,
  setUpdateStateFlag,
  setErrorStateFlag,
  editParcel,
  updateParcel,
} from "../store/parcelSlice";
import { DateTime } from "i18n-js";
//#store

//interfaces
import { IParcel } from "../interfaces/parcel";
import { IParcelState, ISettingsState } from "../interfaces/state";
//styled
import { AppTheme } from "../styled/theme";
import i18n from "../i18n/i18n";

//const ICON_TYPE = "string";

interface Props {
  navigation: NavigationProp<{}>;
  route: RouteProp<{}>;
  //route: RouteProp<{ params: { trackingNumber: ICON_TYPE } }, 'params'>
}

const HomeScreen: React.FC = ({ navigation, route }: Props) => {
  const [search, setSearch] = useState<string>("");
  const [filteredDataSource, setFilteredDataSource] = useState<IParcel[]>([]);
  const [masterDataSource, setMasterDataSource] = useState<IParcel[]>([]);
  const isFocused = useIsFocused();
  const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [itemData, setItemData] = useState<IParcel>();
  const [activeTab, setActiveTab] = useState<string>("");
  //TODO delete it
  const [modal, setModal] = useState({ action: "", value: "", visible: false });

  //store
  const dispatch = useDispatch();
  const { items, updateStateFlag } = useSelector(
    (state: IParcelState) => state.parcel
  );
  const { theme, darkmode, language, location } = useSelector(
    (state: ISettingsState) => state.settings
  );
  i18n.locale = language;
  // Constructing styles for current theme
  const styles = useMemo(() => createStyles(theme), [theme]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
      headerTitleAlign: "left",
      headerBackTitleVisible: false,
      headerStyle: { backgroundColor: AppTheme[theme].header },
      headerTitle: () => (
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <Avatar rounded source={require("../assets/moto.jpeg")} />
          <Text
            style={{
              color: "white",
              marginLeft: 10,
              fontWeight: "700",
            }}
          >
            Track4Parcel
          </Text>
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <FontAwesome name="gear" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [theme]);

  useEffect(() => {
    setData();
    clearParams();
  }, [updateStateFlag]);

  useEffect(() => {
    tabFilterFunction("shipping");
  }, [masterDataSource]);

  useEffect(() => {
    console.log("home page route params:", route.params);
    if (isFocused) {
      dispatch(setErrorStateFlag(false));
      if (updateStateFlag) {
        setData();
        clearParams();
      }
    }
    return () => {
      closeEditModal();
    };
  }, [isFocused]);

  const setData = () => {
    setMasterDataSource(items);
  };

  const openEditModal = (item: IParcel) => {
    if (item.id) {
      setItemData(item);
      setEditModalVisible(true);
      console.log("setItemData item", item);
    }
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
  };

  const clearParams = () => {
    dispatch(setUpdateStateFlag(false));
    navigation.setParams({
      trackingNumber: null,
      trackingTitle: null,
      updateState: false,
    });
  };

  //TODO: change it
  const tabFilterFunction = (tab: string) => {
    // const shipping_ = ["transit", "arrived"];
    // const shippingSet = new Set(shipping_),
    // events = [{ file: 'css/style.css', type: 'css' }, { file: 'js/app.js', type: 'js' }, { file: 'index/html.html', type: 'html' }],
    // list = masterDataSource.filter((item) => shippingSet.has(item.status));
    // console.log("list: ", list);
    //let data = masterDataSource.sort((a, b) => a.status.localeCompare(b.status));
    //console.log('data sort by:', data);

    const shipping = ["TRANSIT", "ARRIVED", "PICKUP", "ARCHIVE"];
    setActiveTab(tab);
    if (tab) {
      const newData = masterDataSource.filter(function (item: IParcel) {
        const itemData = item.status ? item.status.toUpperCase() : "";
        const textData = tab.toUpperCase();
        if (tab === "shipping") {
          return shipping.indexOf(itemData) > -1;
        } else {
          return itemData.indexOf(textData) > -1;
        }
      });
      console.log("newData:", newData);
      setFilteredDataSource(newData);
    } else {
      setFilteredDataSource(masterDataSource);
    }
  };

  const searchFilterFunction = (text: string) => {
    // Check if searched text is not blank
    if (text) {
      // Filter the masterDataSource and update FilteredDataSource
      const newData = masterDataSource.filter(function (item: IParcel) {
        // Applying filter for the inserted text in search bar
        const itemData = item.title
          ? item.title.toUpperCase()
          : "".toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredDataSource(newData);
      setSearch(text);
    } else {
      // Inserted text is blank
      // Update FilteredDataSource with masterDataSource
      setFilteredDataSource(masterDataSource);
      setSearch(text);
    }
  };

  const getItemDetails = (item: IParcel, index: string) => {
    console.log("getItemDetails item:", item);
    navigation.navigate("Details", {
      trackingNumber: item.trackingNumber,
      trackingTitle: item.title,
      id: item.id,
      index: index,
    });
  };

  const itemView = ({ item, index }) => {
    //console.log("item:", item);
    //console.log("index:", index);
    return (
      // <TouchableOpacity onPress={() => getItemDetails(item)}>
      <View style={styles.listItem}>
        {item?.status &&
          item?.status !== "delivered" &&
          item?.status !== "pickup" &&
          item.status !== "arrived" && (
            <MaterialCommunityIcons
              name="truck-delivery-outline"
              size={40}
              color={AppTheme[theme].button}
              style={{ opacity: 0.5 }}
            />
          )}
        {item?.status === "arrived" && (
          <MaterialCommunityIcons
            name="truck-check-outline"
            size={40}
            color={AppTheme[theme].button}
          />
        )}
        {item?.status === "delivered" && (
          <MaterialCommunityIcons
            name="check-circle"
            size={40}
            color={AppTheme[theme].button}
          />
        )}
        {item?.status === "pickup" && (
          <MaterialCommunityIcons
            name="hand-extended"
            size={40}
            color={AppTheme[theme].button}
          />
        )}
        {!item.status && (
          <MaterialCommunityIcons name="truck-remove" size={40} color="red" />
        )}
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={styles.text} onPress={() => getItemDetails(item, index)}>
            {item?.title}
          </Text>
          <Text style={styles.text}>{item?.trackingNumber}</Text>
          <Text style={styles.text}>{i18n.t(item?.status)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => openEditModal(item)}
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Entypo
            name="dots-three-vertical"
            size={24}
            color={AppTheme[theme].button}
          />
        </TouchableOpacity>
      </View>
      // </TouchableOpacity>
    );
  };

  const itemSeparatorView = () => {
    return (
      // Flat List Item Separator
      <View
        style={{
          height: 0.5,
          width: "100%",
          backgroundColor: AppTheme[theme].itemSeparator,
        }}
      />
    );
  };

  const deleteItem = () => {
    if (itemData.id) {
      const filteredData = filteredDataSource.filter(function (item) {
        return item.id !== itemData.id;
      });
      setFilteredDataSource(filteredData);
      dispatch(deleteParcel(itemData.id));
      closeEditModal();
    } else {
      console.log("deleteItem error - no itemData id");
    }
  };

  const showConfirmDialog = () => {
    return Alert.alert(
      "Delete parcel?",
      "Are you sure you want to remove " + itemData.title + "?",
      [
        {
          text: "Cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            deleteItem();
          },
        },
      ]
    );
  };

  const updateParcel = (status: string) => {
    const payload = {
      id: itemData.id,
      action: "UPDATE_STATUS",
      status,
    };
    dispatch(editParcel(payload));
    closeEditModal();
  };

  // const closeNewItemModal = () => {
  //   //alert('HomeScreen/closeNewItemModal function');
  //   //setClick(false);
  //   setModal({ visible: false });
  // };

  // const toggleModal = (action = "", value = "") => {
  //   if (action === "update") {
  //     //setClick(true);
  //     setModal({ action: action, visible: true });
  //   } else {
  //     setModal({ action: action, visible: true });
  //   }
  // };

  //const onPress = () => {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <SearchBar
            placeholder={i18n.t("search")}
            onChangeText={(value) => searchFilterFunction(value)}
            value={search}
            lightTheme={!darkmode}
            round="true"
            containerStyle={styles.searchBarContainer}
          />
        </View>

        <View style={[styles.tabView, styles.row]}>
          <Pressable
            style={[
              styles.button,
              {
                borderBottomColor:
                  activeTab === "shipping"
                    ? AppTheme[theme].button
                    : AppTheme[theme].container,
              },
            ]}
            onPress={() => tabFilterFunction("shipping")}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color:
                    activeTab === "shipping" ? AppTheme[theme].text : "#CCC",
                },
              ]}
            >
              {i18n.t("shipping")}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.button,
              {
                borderBottomColor:
                  activeTab === "delivered"
                    ? AppTheme[theme].button
                    : AppTheme[theme].container,
              },
            ]}
            onPress={() => tabFilterFunction("delivered")}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color:
                    activeTab === "delivered" ? AppTheme[theme].text : "#CCC",
                },
              ]}
            >
              {i18n.t("delivered")}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.button,
              {
                borderBottomColor: !activeTab
                  ? AppTheme[theme].button
                  : AppTheme[theme].container,
              },
            ]}
            onPress={() => tabFilterFunction("")}
          >
            <Text
              style={[
                styles.buttonText,
                { color: !activeTab ? AppTheme[theme].text : "#CCC" },
              ]}
            >
              {i18n.t("all")}
            </Text>
          </Pressable>
        </View>

        <FlatList
          data={filteredDataSource}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={itemSeparatorView}
          renderItem={itemView}
        />

        <View style={styles.circleButtonContainer}>
          <Pressable
            style={styles.circleButton}
            onPress={() => navigation.navigate("NewParcel", { action: "add" })}
            //onPress={() => navigation.navigate("Notifications", { action: "add" })}
          >
            <AntDesign
              name="pluscircle"
              size={54}
              color={AppTheme[theme].button}
            />
          </Pressable>
        </View>

        <StatusBar style="light" />
      </View>

      <Modal
        style={styles.modal}
        visible={isEditModalVisible}
        onRequestClose={closeEditModal}
        animationType="fade"
        transparent
      >
        <Pressable style={styles.upper} onPress={closeEditModal} />
        <View style={styles.lower}>
          <Text style={styles.modalTitle}>
            {itemData?.title} {itemData?.trackingNumber}
          </Text>
          <Pressable
            style={styles.row}
            onPress={() => updateParcel("delivered")}
            disabled={itemData?.status === "delivered"}
          >
            <MaterialCommunityIcons
              style={styles.modalIcon}
              name="archive-arrow-down-outline"
              size={24}
              color="black"
            />
            <Text style={styles.text}>{i18n.t("ARCHIVE")}</Text>
          </Pressable>
          <Pressable
            style={styles.row}
            onPress={() =>
              navigation.navigate("NewParcel", {
                action: "edit",
                id: itemData?.id,
                trackingNumber: itemData?.trackingNumber,
                title: itemData?.title,
              })
            }
          >
            <MaterialCommunityIcons
              style={styles.modalIcon}
              name="archive-edit-outline"
              size={24}
              color="black"
            />
            <Text style={styles.text}>{i18n.t("EDIT")}</Text>
          </Pressable>
          <Pressable style={styles.row} onPress={showConfirmDialog}>
            <AntDesign
              style={styles.modalIcon}
              name="delete"
              size={24}
              color="black"
            />
            <Text style={styles.text}>{i18n.t("DELETE")}</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (theme: string) =>
  StyleSheet.create({
    container: {
      backgroundColor: AppTheme[theme].container,
      flex: 1,
    },
    tabView: {
      justifyContent: "space-between",
      //alignItems: 'center',
    },
    searchBarContainer: {
      borderBottomColor: "transparent",
      borderTopColor: "transparent",
    },
    button: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      borderBottomWidth: 1,
    },
    buttonText: {
      color: "#CCC",
      padding: 5,
    },
    listItem: {
      margin: 10,
      padding: 10,
      backgroundColor: AppTheme[theme].container,
      width: "95%",
      flex: 1,
      alignSelf: "center",
      flexDirection: "row",
      borderRadius: 5,
    },
    text: {
      color: AppTheme[theme].text,
    },
    circleButtonContainer: {
      alignSelf: "flex-end",
      position: "absolute",
      bottom: 25,
      right: 25,
    },
    row: {
      flexDirection: "row",
      margin: 10,
      alignItems: "center",
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 22,
    },
    textStyle: {
      color: AppTheme[theme].text,
      fontWeight: "bold",
      textAlign: "center",
    },
    modal: {},
    modalIcon: {
      paddingRight: 10,
      paddingLeft: 10,
      color: AppTheme[theme].text,
    },
    modalTitle: {
      paddingLeft: 20,
      fontWeight: "bold",
      color: AppTheme[theme].title,
    },
    upper: {
      height: "75%",
      backgroundColor: "#000",
      opacity: 0.7,
    },
    lower: {
      flex: 1,
      backgroundColor: AppTheme[theme].container,
      height: "25%",
      justifyContent: "center",
      alignItems: "flex-start",
    },
  });

export default HomeScreen;
