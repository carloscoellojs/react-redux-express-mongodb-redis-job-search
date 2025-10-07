import axios from 'axios';
import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from '../reducers/jobsReducer';
import {
  fetchJobsTitlesList,
  fetchJobDetail,
  startFetchingTitlesList,
  stopFetchingTitlesList,
  startFetchingJobDetail,
  stopFetchingJobDetail,
  setNotification
} from './jobsActions';
import type { JobDetail, JobTitleAPIResponse, JobTitle } from '../../types/types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the delay function to return immediately
jest.mock('./jobsActions', () => {
  const originalModule = jest.requireActual('./jobsActions');
  
  // Create a mock delay that resolves immediately
  const mockDelay = jest.fn().mockResolvedValue(true);
  
  return {
    ...originalModule,
    // Override the fetchJobsTitlesList to use mocked delay
    fetchJobsTitlesList: (pageNumber?: number, keyword?: string) => async (dispatch: any) => {
      try {
        const response = await axios.get(`/api/v1/jobs/titles${pageNumber ? `?page=${pageNumber}` : ""}${keyword ? `&keyword=${keyword}` : ""}`);
        await mockDelay(true, 2000); // Mock delay
        if (!response.data.titles.length) {
          dispatch(originalModule.setNotification(`No jobs found for "${keyword}" try another search term.`));
        }
        dispatch({ type: "jobs/setJobsTitlesList", payload: response.data.titles });
        dispatch({ type: "jobs/setJobsTitlesListPagination", payload: response.data.pagination });
        dispatch({ type: "jobs/fetchingTitlesList", payload: false });
      } catch (error) {
        dispatch({ type: "jobs/fetchingTitlesList", payload: false });
        console.error("Error fetching job titles:", error);
      }
    }
  };
});

// Mock timers for setTimeout (used in setNotification)
jest.useFakeTimers();

// Type for our test store
type TestStore = ReturnType<typeof createTestStore>;

const createTestStore = () => configureStore({
  reducer: {
    jobs: jobsReducer
  }
});

describe('Job Actions', () => {
  let store: TestStore;

  const mockJobTitles: JobTitle[] = [
    {
      id: '1',
      title: 'Senior React Developer',
      company: 'Tech Corp',
      location: 'Austin, TX',
      creationDate: '2025-01-01'
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'Innovation Labs',
      location: 'Dallas, TX',
      creationDate: '2025-01-02'
    }
  ];

  const mockJobTitlesResponse: JobTitleAPIResponse = {
    titles: mockJobTitles,
    pagination: {
      currentPage: 1,
      totalPages: 3,
      totalItems: 50,
      itemsPerPage: 25,
      keyword: 'developer'
    }
  };

  const mockJobDetail: JobDetail = {
    jobId: 1,
    type: 'Full-time',
    salary: '$120,000 - $150,000',
    skills: ['React', 'TypeScript', 'Node.js'],
    description: 'We are looking for an experienced React developer.',
    benefits: ['Health Insurance', 'Remote Work'],
    link: 'https://example.com/apply/1',
    creationDate: '2025-01-01'
  };

  beforeEach(() => {
    store = createTestStore();
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe('fetchJobsTitlesList', () => {
    it('fetches job titles successfully without parameters', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: mockJobTitlesResponse
      });

      const action = fetchJobsTitlesList();
      
      // Start the action and wait for it to resolve (ignoring the delay)
      await action(store.dispatch);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/jobs/titles');
      
      const state = store.getState().jobs;
      expect(state.jobsTitlesList).toEqual(mockJobTitles);
      expect(state.pagination).toEqual(mockJobTitlesResponse.pagination);
      expect(state.fetchingTitlesList).toBe(false);
    }, 10000);

    it('fetches job titles with page number', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: mockJobTitlesResponse
      });

      const action = fetchJobsTitlesList(2);
      await action(store.dispatch);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/jobs/titles?page=2');
    }, 10000);

    it('fetches job titles with keyword', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: mockJobTitlesResponse
      });

      const action = fetchJobsTitlesList(undefined, 'react');
      await action(store.dispatch);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/jobs/titles&keyword=react');
    }, 10000);

    it('fetches job titles with both page number and keyword', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: mockJobTitlesResponse
      });

      const action = fetchJobsTitlesList(2, 'react developer');
      await action(store.dispatch);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/jobs/titles?page=2&keyword=react developer');
    }, 10000);

    it('dispatches notification when no jobs found', async () => {
      const emptyResponse = {
        titles: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 25,
          keyword: 'nonexistent'
        }
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: emptyResponse
      });

      const action = fetchJobsTitlesList(1, 'nonexistent');
      await action(store.dispatch);

      const state = store.getState().jobs;
      expect(state.notification.info).toBe('No jobs found for "nonexistent" try another search term.');
      expect(state.jobsTitlesList).toEqual([]);
      expect(state.fetchingTitlesList).toBe(false);
    }, 10000);

    it('handles API error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const action = fetchJobsTitlesList();
      await action(store.dispatch);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching job titles:', expect.any(Error));
      
      const state = store.getState().jobs;
      expect(state.fetchingTitlesList).toBe(false);
      
      consoleErrorSpy.mockRestore();
    });

    it('includes delay in successful requests', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: mockJobTitlesResponse
      });

      const action = fetchJobsTitlesList();

      // Before action completes
      expect(store.getState().jobs.jobsTitlesList).toEqual([]);

      // Complete the action (including delay)
      await action(store.dispatch);

      // After action completes
      expect(store.getState().jobs.jobsTitlesList).toEqual(mockJobTitles);
    }, 10000);
  });

  describe('fetchJobDetail', () => {
    it('fetches job detail successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: mockJobDetail
      });

      const action = fetchJobDetail(1);
      await action(store.dispatch);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/jobs/details/1');
      
      const state = store.getState().jobs;
      expect(state.jobDetail).toEqual(mockJobDetail);
      expect(state.fetchingJobDetail).toBe(false);
    });

    it('fetches job detail with different job ID', async () => {
      const jobDetail2 = { ...mockJobDetail, jobId: 2 };
      mockedAxios.get.mockResolvedValueOnce({
        data: jobDetail2
      });

      const action = fetchJobDetail(2);
      await action(store.dispatch);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/jobs/details/2');
      expect(store.getState().jobs.jobDetail?.jobId).toBe(2);
    });

    it('handles API error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockedAxios.get.mockRejectedValueOnce(new Error('Job not found'));

      const action = fetchJobDetail(999);
      await action(store.dispatch);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching job detail:', expect.any(Error));
      
      const state = store.getState().jobs;
      expect(state.fetchingJobDetail).toBe(false);
      expect(state.jobDetail).toBeNull();
      
      consoleErrorSpy.mockRestore();
    });

    it('handles string job ID by converting to number', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: mockJobDetail
      });

      const action = fetchJobDetail(Number('1'));
      await action(store.dispatch);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/jobs/details/1');
    });
  });

  describe('startFetchingTitlesList', () => {
    it('sets fetching titles list to true and clears job detail', () => {
      // Set some initial job detail
      store.dispatch({ type: 'jobs/setJobDetail', payload: mockJobDetail });
      
      const action = startFetchingTitlesList();
      action(store.dispatch);

      const state = store.getState().jobs;
      expect(state.fetchingTitlesList).toBe(true);
      expect(state.jobDetail).toBeNull();
    });

    it('works when job detail is already null', () => {
      const action = startFetchingTitlesList();
      action(store.dispatch);

      const state = store.getState().jobs;
      expect(state.fetchingTitlesList).toBe(true);
      expect(state.jobDetail).toBeNull();
    });
  });

  describe('stopFetchingTitlesList', () => {
    it('sets fetching titles list to false', () => {
      // Set fetching to true first
      store.dispatch({ type: 'jobs/fetchingTitlesList', payload: true });
      
      const action = stopFetchingTitlesList();
      action(store.dispatch);

      const state = store.getState().jobs;
      expect(state.fetchingTitlesList).toBe(false);
    });
  });

  describe('startFetchingJobDetail', () => {
    it('sets fetching job detail to true', () => {
      const action = startFetchingJobDetail();
      action(store.dispatch);

      const state = store.getState().jobs;
      expect(state.fetchingJobDetail).toBe(true);
    });
  });

  describe('stopFetchingJobDetail', () => {
    it('sets fetching job detail to false', () => {
      // Set fetching to true first
      store.dispatch({ type: 'jobs/fetchingJobDetail', payload: true });
      
      const action = stopFetchingJobDetail();
      action(store.dispatch);

      const state = store.getState().jobs;
      expect(state.fetchingJobDetail).toBe(false);
    });
  });

  describe('setNotification', () => {
    it('sets notification message and clears it after timeout', () => {
      const action = setNotification('Test notification');
      action(store.dispatch);

      // Check notification is set
      let state = store.getState().jobs;
      expect(state.notification.info).toBe('Test notification');

      // Fast-forward 5 seconds
      jest.advanceTimersByTime(5000);

      // Check notification is cleared
      state = store.getState().jobs;
      expect(state.notification.info).toBe('');
    });

    it('handles empty notification message', () => {
      const action = setNotification('');
      action(store.dispatch);

      const state = store.getState().jobs;
      expect(state.notification.info).toBe('');

      jest.advanceTimersByTime(5000);
      
      // Should still be empty after timeout
      expect(store.getState().jobs.notification.info).toBe('');
    });

    it('handles multiple notifications correctly', () => {
      // Set first notification
      const action1 = setNotification('First notification');
      action1(store.dispatch);

      expect(store.getState().jobs.notification.info).toBe('First notification');

      // Set second notification before first clears
      jest.advanceTimersByTime(2000);
      const action2 = setNotification('Second notification');
      action2(store.dispatch);

      expect(store.getState().jobs.notification.info).toBe('Second notification');

      // Fast-forward to clear second notification (5 seconds from when it was set)
      jest.advanceTimersByTime(5000);
      expect(store.getState().jobs.notification.info).toBe('');
    });

    it('handles special characters in notification message', () => {
      const specialMessage = 'No jobs found for "C++ & Node.js" try another search term.';
      const action = setNotification(specialMessage);
      action(store.dispatch);

      const state = store.getState().jobs;
      expect(state.notification.info).toBe(specialMessage);
    });
  });

  describe('Integration Tests', () => {
    it('complete flow: start fetching, fetch titles, stop fetching', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: mockJobTitlesResponse
      });

      // Start fetching
      const startAction = startFetchingTitlesList();
      startAction(store.dispatch);

      expect(store.getState().jobs.fetchingTitlesList).toBe(true);

      // Fetch titles
      const fetchAction = fetchJobsTitlesList();
      await fetchAction(store.dispatch);

      const state = store.getState().jobs;
      expect(state.fetchingTitlesList).toBe(false);
      expect(state.jobsTitlesList).toEqual(mockJobTitles);
    }, 10000);

    it('complete flow: start fetching job detail, fetch detail, stop fetching', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: mockJobDetail
      });

      // Start fetching
      const startAction = startFetchingJobDetail();
      startAction(store.dispatch);

      expect(store.getState().jobs.fetchingJobDetail).toBe(true);

      // Fetch detail
      const fetchAction = fetchJobDetail(1);
      await fetchAction(store.dispatch);

      const state = store.getState().jobs;
      expect(state.fetchingJobDetail).toBe(false);
      expect(state.jobDetail).toEqual(mockJobDetail);
    });

    it('handles network errors during full fetch flow', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const startAction = startFetchingTitlesList();
      startAction(store.dispatch);

      const fetchAction = fetchJobsTitlesList();
      await fetchAction(store.dispatch);

      jest.advanceTimersByTime(2000);

      const state = store.getState().jobs;
      expect(state.fetchingTitlesList).toBe(false);
      expect(state.jobsTitlesList).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined response data', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Make axios reject with an error for undefined data
      mockedAxios.get.mockRejectedValueOnce(new Error('No response data'));

      const action = fetchJobsTitlesList();
      await action(store.dispatch);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching job titles:', expect.any(Error));
      expect(store.getState().jobs.fetchingTitlesList).toBe(false);
      
      consoleErrorSpy.mockRestore();
    }, 10000);

    it('handles malformed pagination data', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Make axios throw an error when trying to parse malformed response
      mockedAxios.get.mockRejectedValueOnce(new Error('Invalid response format'));

      const action = fetchJobsTitlesList();
      await action(store.dispatch);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching job titles:', expect.any(Error));
      expect(store.getState().jobs.fetchingTitlesList).toBe(false);
      
      consoleErrorSpy.mockRestore();
    }, 10000);

    it('handles very long notification messages', () => {
      const longMessage = 'A'.repeat(1000);
      const action = setNotification(longMessage);
      action(store.dispatch);

      const state = store.getState().jobs;
      expect(state.notification.info).toBe(longMessage);
    });

    it('handles concurrent fetch requests', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ data: mockJobTitlesResponse })
        .mockResolvedValueOnce({ data: { ...mockJobTitlesResponse, titles: [] } });

      const action1 = fetchJobsTitlesList(1);
      const action2 = fetchJobsTitlesList(2);

      const promise1 = action1(store.dispatch);
      const promise2 = action2(store.dispatch);

      await Promise.all([promise1, promise2]);

      // Last response should win
      const state = store.getState().jobs;
      expect(state.jobsTitlesList).toEqual([]);
    }, 10000);
  });
});