import axios from "axios";
import type { AppDispatch } from "../../store";
import { setJobsTitlesList, setJobDetail, setJobsTitlesListPagination, setNotificationInfo } from "../reducers/jobsReducer";
import type { JobDetail, JobTitleAPIResponse } from "../../types/types";

const delay = <T,>(result: T, ms = 2000): Promise<T> => {
    return new Promise((resolve) => setTimeout(() => resolve(result), ms));
  };

export const fetchJobsTitlesList = (pageNumber?: number, keyword?: string) => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.get<JobTitleAPIResponse>(`/api/v1/jobs/titles${pageNumber ? `?page=${pageNumber}` : ""}${keyword ? `&keyword=${keyword}` : ""}`);
    await delay(true, 2000); // Simulate network delay
    if (!response.data.titles.length) {
      dispatch(setNotification(`No jobs found for "${keyword}" try another search term.`));
    }
    dispatch(setJobsTitlesList(response.data.titles));
    dispatch(setJobsTitlesListPagination(response.data.pagination));
    dispatch({ type: "jobs/fetchingTitlesList", payload: false });
  } catch (error) {
    dispatch({ type: "jobs/fetchingTitlesList", payload: false });
    console.error("Error fetching job titles:", error);
  }
};

export const fetchJobDetail = (jobId: number) => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.get<JobDetail>(`/api/v1/jobs/details/${jobId}`);
    //  await delay(true, 2000); // Simulate network delay
    dispatch(setJobDetail(response.data));
    dispatch({ type: "jobs/fetchingJobDetail", payload: false });
  } catch (error) {
    dispatch({ type: "jobs/fetchingJobDetail", payload: false });
    console.error("Error fetching job detail:", error);
  }
};

export const startFetchingTitlesList = () => (dispatch: AppDispatch) => {
  dispatch({ type: "jobs/fetchingTitlesList", payload: true });
  dispatch(setJobDetail(null)); // Clear job detail when fetching new titles list
};

export const stopFetchingTitlesList = () => (dispatch: AppDispatch) => {
  dispatch({ type: "jobs/fetchingTitlesList", payload: false });
};

export const startFetchingJobDetail = () => (dispatch: AppDispatch) => {
  dispatch({ type: "jobs/fetchingJobDetail", payload: true });
};

export const stopFetchingJobDetail = () => (dispatch: AppDispatch) => {
  dispatch({ type: "jobs/fetchingJobDetail", payload: false });
};

export const setNotification = (message: string) => (dispatch: AppDispatch) => {
  dispatch(setNotificationInfo(message));
  setTimeout(() => {
    dispatch(setNotificationInfo(""));
  }, 5000);
}
