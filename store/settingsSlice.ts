import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  darkmode: false,
  colors: {
    header: "#ebfbff",
    body: "#fff",
    footer: "#003333",
  },
  showDelivered: false,
  orderBy: "asc",
  theme: "light", //'light' or 'dark'
  location: "israel",
  language: "en",
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    //setListOrder: (state, action) => {
    //state.orderBy = [...state.orderBy, action.payload];
    //},
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setDarkTheme(state) {
      state.colors.header = "#324B50";
      state.colors.body = "#445155";
      state.darkmode = true;
      state.theme = "dark";
    },
    setDefaultTheme(state) {
      state.colors.header = "#ebfbff";
      state.colors.body = "#fff";
      state.darkmode = false;
      state.theme = "light";
    },
  },
});

export const { setLanguage, setLocation, setTheme, setDarkTheme, setDefaultTheme } =
  settingsSlice.actions;

export default settingsSlice.reducer;
