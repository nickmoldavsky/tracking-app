import { IParcel } from "./parcel";

export interface IParcelState {
  // parcel: {
    items: IParcel[];
    isLoading: boolean;
    error: boolean | string;
    updateStateFlag: boolean;
  // };
}

export interface IUserState {
  //user: {
    language: string;
    location: string;
  };
//}

export interface ISettingsState {
  //settings: {
    darkmode: boolean;
    colors?: {
      header: string;
      body: string;
      footer: string;
    };
    showDelivered: boolean;
    orderBy: string;
    theme: string;
    language: string;
    location: string;
  };
//}
