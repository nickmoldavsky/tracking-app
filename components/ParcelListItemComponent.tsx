import React, { Component, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { IParcel } from "../interfaces/parcel";
import { AppTheme } from "../styled/theme";
import i18n from "../i18n/i18n";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons/";
import { useAppSelector } from "../hooks/redux";
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from "@react-navigation/native-stack/lib/typescript/src/types";
import { RootStackParamList } from "../types/types";

type Props = {
  item: IParcel,
  openEditModal: any,  //TODO change type
}

type NavigationProps = NativeStackScreenProps<RootStackParamList, "Details">;

const ParcelListItem: React.FC = ( {item, openEditModal}: Props) => {
  console.log('ParcelListItemComponent/props', item);
  const { navigate } = useNavigation<NavigationProps>();
  const { theme } = useAppSelector((state) => state.settings);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const getItemDetails = ({trackingNumber, title}: IParcel) => {
    navigate("Details", {
      trackingNumber,
      trackingTitle: title,
    });
  };

  return (
    <TouchableOpacity onPress={() => getItemDetails(item)}>
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
          <Text style={styles.text}>{item?.title}</Text>
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
    </TouchableOpacity>
  );
};

const createStyles = (theme: string) =>
  StyleSheet.create({
    text: {
      color: AppTheme[theme].text,
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
  });

export default ParcelListItem;
