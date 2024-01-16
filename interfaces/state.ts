import { IParcel } from "./parcel";

export interface IParcelState {
  items: IParcel[];
  isLoading: boolean;
  error: boolean | string;
  updateStateFlag: boolean;
}

export interface IUserState {
  language: string;
  location: string;
}

export interface ISettingsState {
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
}
