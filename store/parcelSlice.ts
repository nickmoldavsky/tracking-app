import {
  createSlice,
  createAsyncThunk,
  current,
  PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
//notification
import { setNotification } from "../helpers/NotificationsHelper";
//interfaces
import { IParcel, IRequestParams } from "../interfaces/parcel";
import { IParcelState } from "../interfaces/state";
import { UpdateParcelParams, Notification } from "../types/types";

// Create an instance of Axios
const api = axios.create();

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('interceptors.request:', config);
    alert('request interceptor!!!!');
    // Modify the request config (e.g., add headers):
    // config.headers.Authorization = 'Bearer YOUR_TOKEN';
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

const initialState: IParcelState = {
  items: [],
  isLoading: false,
  error: false,
  updateStateFlag: false,
};

const randomRgb = () => {
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);
  return `rgb(${red}, ${green}, ${blue})`;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

//let timeOutId: number | null = null;
let timeOutId: ReturnType<typeof setTimeout>;

export const checkTrackingStatus = createAsyncThunk<IParcel[], string>(
  "parcel/checkTrackingStatus",
  async (uuid, { dispatch, getState, rejectWithValue }) => {
    const res = await axios.get( //<IParcel[]>
      API_URL + "?uuid=" + uuid + "&apiKey=" + API_KEY
    );
    const data = res.data;
    console.log("parcelSlice/checkTrackingStatus response:", data);
    //
    if (data.done) {
      if (data.shipments[0].error) {
        console.log("checkTrackingStatus error:", data.shipments[0].error);
        if (timeOutId) {
          clearTimeout(timeOutId);
        }
        return rejectWithValue(data.shipments[0].error);
      } else {
        dispatch(updateParcel(data));
        console.log("Tracking complete");
        if (timeOutId) {
          clearTimeout(timeOutId);
        }
        return data;
      }
    } else {
      console.log("Tracking in progress...");
      //  timeOutId = setTimeout(() => {
      //    dispatch(checkTrackingStatus(uuid));
      //    // polling in 1 sec cycles
      //  }, 1000);
      //
      //    return new Promise((resolve) => setTimeout(function () {
      //     console.log('promise...');
      //     dispatch(checkTrackingStatus(uuid));
      //     //resolve();
      // }, 3000))
      //
      //console.log("setTimeout timeOutId:", timeOutId);
      return data;
    }
  }
);

export const getPackageInfo = createAsyncThunk<IParcel[], IRequestParams>(
  "parcel/getPackageInfo",
  async (requestParams, { dispatch }) => {
    const res = await axios.post(API_URL, {
      shipments: [
        {
          trackingId: requestParams.trackingId,
          destinationCountry: requestParams.location,
        },
      ],
      language: requestParams.language,
      apiKey: API_KEY,
    });
    const data = await res.data; //TODO check if need it
    console.log("parcelslice/getPackageInfo response data:", data);

    if (!data.error) {
      if (data.done) {
        dispatch(updateParcel(data));
        return data;
      } else {
        if (data.uuid) {
          console.log("calling checkTrackingStatus function...");
          //dispatch(checkTrackingStatus(data.uuid));
          return data;
        }
      }
    } else {
      console.error(data.error);
    }
  }
);

// export const createNotifications = createAsyncThunk(
//   "parcel/createNotifications",
//   async (time, { dispatch, getState }) => {
//     const items: IParcel[] = getState().parcel.items;
//     let counter = 0;
//     const data = <IParcel>{}; //TODO: check correct type?
//     //TODO: change it: get data from user slice
//     const requestParams: IRequestParams = {
//       location: "USA",
//       language: "EN",
//       trackingId: "",
//     };
//     items.map((item: IParcel) => {
//       counter++;
//       if (!item.status || (item.status && item.status !== "delivered")) {
//         //if (item.status !== "delivered") {
//         data.title =
//           "New update for parcel " + item.title + " " + item.trackingNumber;
//         data.status = item.status;
//         requestParams.trackingId = item.trackingNumber;
//         const promise = dispatch(getPackageInfo(requestParams));
//         promise.then((response) => {
//           console.log("createNotifications response:", response.payload);
//         });

//         //setNotification(data, 1);
//         // }
//       }
//     });
//   }
// );

export const parcelSlice = createSlice({
  name: "parcel",
  initialState,
  reducers: {
    // setStateColor: (state) => {
    //   state.items = [...state.items, randomRgb()];
    // },

    setUpdateStateFlag: (state, action: PayloadAction<boolean>) => {
      state.updateStateFlag = action.payload;
    },

    setErrorStateFlag: (state, action: PayloadAction<boolean>) => {
      state.error = action.payload;
    },

    deleteDeliveredParcels: (state) => {
      const filteredData = state.items.filter(function (item) {
        return item.status !== "delevered";
      });
      state.items = filteredData;
      state.updateStateFlag = true;
    },

    deleteParcel: (state, action: PayloadAction<number>) => {
      //console.log("delete parcel", action.payload);
      const filteredData = state.items.filter(function (item) {
        return item.id !== action.payload;
      });
      state.items = filteredData;
      state.updateStateFlag = true;
    },

    addParcel: (state, action: PayloadAction<IParcel>) => {
      console.log("addParcel reducer action:", action.payload);
      state.items = [...state.items, action.payload];
      state.updateStateFlag = true;
    },

    updateParcel: (state, action) => {
      //console.log("testing data from extra reducer function:", action.payload);
      state.error = false;
      if (action.payload.shipments[0].error) {
        //console.log("parcelslice/updateParcel action.payload:", action.payload);
        state.error = true;
        return;
      }

      //TODO: first check if parcel has updates
      let statesCounter = 0;

      //TODO: change it
      const parcel: IParcel = {
        id: null,
        title: "",
        trackingNumber: action.payload.shipments[0].trackingId,
        status: action.payload.shipments[0].status,
        states: action.payload.shipments[0].states,
        origin: action.payload.shipments[0].origin,
        destination: action.payload.shipments[0].destination,
        carriers: action.payload.shipments[0].carriers,
        lastState: action.payload.shipments[0].lastState,
      };

      if (parcel.states) {
        console.log("parcelSlice/updateParcel/states:", parcel.states);
        statesCounter = parcel.states.length ? parcel.states.length : 0;
        //console.log("parcelSlice/updateParcel/ response states.lentght:",statesCounter);
      }

      state.items.find((item) => {
        if (item.trackingNumber === parcel.trackingNumber) {
          console.log("parcelSlice/updateParcel/find item", current(item));
          let currentStatesCounter = 0;

          if (item.states) {
            currentStatesCounter = current(item.states).length;
          }

          if (item.status !== parcel?.status) {
            item.status = parcel?.status;
            state.updateStateFlag = true;
          }

          if (!item.states || currentStatesCounter !== statesCounter) {
            item.states = parcel?.states;
            item.destination = parcel?.destination;
            item.origin = parcel?.origin;
            item.carriers = parcel?.carriers;
            item.lastState = parcel?.lastState;
            //TODO: send notification here...
            //test notification
            const notificationData: Notification = {
              id: item.id,
              parcelTitle: item.title,
              trackingNumber: parcel.trackingNumber,
              title: "Your parcel has an update!",
              status:
                item.title +
                " has an update from " +
                item.carriers[item.lastState?.carrier] +
                ": " +
                item.lastState?.status,
            };
            setNotification(notificationData, 5);
            //#test notification
          }
        }
      });
    },

    editParcel: (state, action: PayloadAction<UpdateParcelParams>) => {
      console.log("editParcel action.payload:", action.payload);
      state.items.find((item) => {
        if (item.id === action.payload.id) {
          if (action.payload.action !== "UPDATE_STATUS") {
            item.trackingNumber = action.payload.trackingNumber;
            item.title = action.payload.title;
          } else {
            item.status = action.payload.status;
          }
          state.updateStateFlag = true;
        }
      });
    },
  },

  extraReducers: (builder) => {
    //getPackageInfo
    builder.addCase(getPackageInfo.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(
      getPackageInfo.fulfilled,
      (state, action: PayloadAction<IParcel[]>) => {
        if (!action.payload["uuid"]) {
          state.isLoading = false;
        }
      }
    );
    builder.addCase(getPackageInfo.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    });

    //checkTrackingStatus
    builder.addCase(checkTrackingStatus.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(checkTrackingStatus.fulfilled, (state, action) => {
      if (action.payload["done"]) {
        state.isLoading = false;
      }
    });
    builder.addCase(checkTrackingStatus.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    });
  },
});

// Action creators are generated for each case reducer function
export const {
  //setNotifications,
  setUpdateStateFlag,
  setErrorStateFlag,
  addParcel,
  deleteDeliveredParcels,
  deleteParcel,
  updateParcel,
  editParcel,
} = parcelSlice.actions;

export default parcelSlice.reducer;
