import { createSlice } from "@reduxjs/toolkit";
import { IUserState } from "../interfaces/state";

const initialState: IUserState = {
  location: "ISRAEL",
  language: "EN",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLocation: (state, action) => {
      //state.location = [...state.location, action.payload];
      state.location = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const { setLocation, setLanguage } = userSlice.actions;

export default userSlice.reducer;
