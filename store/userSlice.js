import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  location: "ISRAEL",
  language: "EN",
};

const setData = () => {};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLocation: (state, action) => {
      state.location = [...state.location, action.payload];
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const { setLocation, setLanguage } = userSlice.actions;

export default userSlice.reducer;
