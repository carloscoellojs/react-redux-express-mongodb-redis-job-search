import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { JobTitle, JobsState, Pagination, JobDetailOrNull } from "../../types/types";

const initialState: JobsState = {
  jobsTitlesList: [],
  jobDetail: null,
  fetchingTitlesList: false,
  fetchingJobDetail: false,
  pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 25, keyword: "" },
  message: { error: "" },
  notification: { info: "" },
};

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setJobsTitlesList: (state, action: PayloadAction<JobTitle[]>) => {
      state.jobsTitlesList = action.payload;
    },
    setJobsTitlesListError: (state, action: PayloadAction<string>) => {
      state.message.error = action.payload;
    },
    setJobsTitlesListPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
    },
    setJobDetail: (state, action: PayloadAction<JobDetailOrNull>) => {
      state.jobDetail = action.payload;
    },
     setJobDetailError: (state, action: PayloadAction<string>) => {
      state.message.error = action.payload;
    },
    fetchingTitlesList: (state, action: PayloadAction<boolean>) => {
      state.fetchingTitlesList = action.payload;
    },
    fetchingJobDetail: (state, action: PayloadAction<boolean>) => {
      state.fetchingJobDetail = action.payload;
    },
    setNotificationInfo: (state, action: PayloadAction<string>) => {
      state.notification.info = action.payload;
    }
  },
});

export const { setJobsTitlesList, setJobsTitlesListError, setJobsTitlesListPagination, setJobDetail, setJobDetailError, fetchingTitlesList, fetchingJobDetail, setNotificationInfo } = jobsSlice.actions;
export default jobsSlice.reducer;
