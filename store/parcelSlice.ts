import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import axios from "axios";
//notification
import { setNotification } from "../components/NotificationsComponent";
//interfaces
import { IParcel, IRequestParams } from "../interfaces/parcel";
import { IParcelState } from "../interfaces/state";

const initialState = {
  items: <IParcel[]>[],
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

const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIzMjUwMDk3MC1mZDNhLTExZWQtYjViZC03MTg2YTk3NzRiOTEiLCJzdWJJZCI6IjY0NzMxZjBmNzNkMGJiNTE5NzllNmJmYiIsImlhdCI6MTY4NTI2NjE5MX0.w4gvxSgOOWM1gsUoKcqR-pTJAWPqjSFPmv7TV_-urCs";
//let timeOutId: number | null = null;
let timeOutId: ReturnType<typeof setTimeout>;

export const checkTrackingStatus = createAsyncThunk<IParcel[], string>(
  "parcel/checkTrackingStatus",
  async (uuid, { dispatch, getState }) => {
    const res = await axios.get(
      "https://parcelsapp.com/api/v3/shipments/tracking?uuid=" +
        uuid +
        "&apiKey=" +
        API_KEY
    );
    const data = await res.data;
    console.log("checkTrackingStatus response:", data);
    //
    if (data.done) {
      if (data.shipments[0].error) {
        console.error("checkTrackingStatus error:", data.shipments[0].error);
        if (timeOutId) clearTimeout(timeOutId);
        //TODO: show error message to the user
        //state.error = true;
        return data;
      } else {
        dispatch(updateParcel(data));
        console.log("Tracking complete");
        if (timeOutId) clearTimeout(timeOutId);
        return data;
      }
    } else {
      console.log("Tracking in progress...");
      timeOutId = setTimeout(() => {
        dispatch(checkTrackingStatus(uuid));
        // polling in 1 sec cycles
      }, 1000);
      console.log("setTimeout timeOutId:", timeOutId);
      return data;
    }
  }
);

export const getPackageInfo = createAsyncThunk<IParcel[], IRequestParams>(
  "parcel/getPackageInfo",
  async (requestParams, { dispatch }) => {
    const res = await axios.post(
      "https://parcelsapp.com/api/v3/shipments/tracking",
      {
        shipments: [
          {
            trackingId: requestParams.trackingId,
            destinationCountry: requestParams.location,
          },
        ],
        language: requestParams.language,
        apiKey: API_KEY,
      }
    );
    const data = await res.data;
    console.log("parcelslice/getPackageInfo response data:", data);

    if (!data.error) {
      if (data.done) {
        dispatch(updateParcel(data));
        return data;
      } else {
        if (data.uuid) {
          console.log("calling checkTrackingStatus function...");
          dispatch(checkTrackingStatus(data.uuid));
          return data;
        }
      }
    } else {
      console.error(data.error);
    }
  }
);

export const createNotifications = createAsyncThunk(
  "parcel/createNotifications",
  async (time, { dispatch, getState }) => {
    const items: IParcel[] = getState().parcel.items;
    let counter = 0;
    const data = <IParcel>{}; //TODO: check correct type?
    //TODO: change it: get data from user slice
    const requestParams: IRequestParams = {
      location: "USA",
      language: "EN",
      trackingId: ''
    };
    items.map((item: IParcel) => {
      counter++;
      if (!item.status || (item.status && item.status !== "delivered")) {
        //if (item.status !== "delivered") {
        data.title =
          "New update for parcel " + item.title + " " + item.trackingNumber;
        data.status = item.status;
        requestParams.trackingId = item.trackingNumber;
        const response = dispatch(getPackageInfo(requestParams));
        response.then(() => {
          console.log("createNotifications response:", response);
        })
        
        //setNotification(data, 1);
        // }
      }
    });
  }
);

export const parcelSlice = createSlice({
  name: "parcel",
  initialState,
  reducers: {
    setStateColor: (state) => {
      state.items = [...state.items, randomRgb()];
    },

    setUpdateStateFlag: (state, action) => {
      state.updateStateFlag = action.payload;
    },

    setErrorStateFlag: (state, action) => {
      state.error = action.payload;
    },

    deleteParcel: (state, action) => {
      //console.log("delete parcel", action.payload);
      const filteredData = state.items.filter(function (item) {
        return item.id !== action.payload;
      });
      state.items = filteredData;
      state.updateStateFlag = true;
    },

    addParcel: (state, action) => {
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

      //TODO: change it
      const parcel: IParcel = {
        id: null,
        title: '',
        trackingNumber: action.payload.shipments[0].trackingId,
        status: action.payload.shipments[0].status,
        states: action.payload.shipments[0].states,
        origin: action.payload.shipments[0].origin,
        destination: action.payload.shipments[0].destination,
        carriers: action.payload.shipments[0].carriers,
        lastState: action.payload.shipments[0].lastState,
      };

      let statesCounter = 0;

      if (parcel.states) {
        console.log("parcelSlice/updateParcel/states:", parcel.states);
        statesCounter = parcel.states.length ? parcel.states.length : 0;
        //console.log("parcelSlice/updateParcel/ response states.lentght:",statesCounter);
      }

      state.items.find((item) => {
        if (item.trackingNumber === parcel.trackingNumber) {
          console.log("LOOP item", current(item));
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
            const data = {
              title: 'Your parcel has an update!',
              status: item.title + ' has an update from ' + item.carriers[item.lastState?.carrier] + ': new status is ' + item.status,
            };
            setNotification(data, 5);
            //#test notification
          }
        }
      });
    },

    editParcel: (state, action) => {
      console.log("editParcel action.payload:", action.payload);
      state.items.find((item) => {
        if (item.id === action.payload.id) {
          if(action.payload.action !== "UPDATE_STATUS") {
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
    builder.addCase(getPackageInfo.fulfilled, (state, action) => {
      if (!action.payload?.uuid) {
        state.isLoading = false;
      }
    });
    builder.addCase(getPackageInfo.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message; 
    });

    //checkTrackingStatus
    builder.addCase(checkTrackingStatus.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(checkTrackingStatus.fulfilled, (state, action) => {
      if (action.payload.done) {
        state.isLoading = false;
        //TODO: remove the code below, slice made for state changes only, do not call dispatch!!!
        //parcelSlice.caseReducers.updateParcel(state, action);
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
  deleteParcel,
  updateParcel,
  editParcel,
} = parcelSlice.actions;

export default parcelSlice.reducer;
