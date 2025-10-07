import jobsReducer, {
  setJobsTitlesList,
  setJobsTitlesListError,
  setJobsTitlesListPagination,
  setJobDetail,
  setJobDetailError,
  fetchingTitlesList,
  fetchingJobDetail,
  setNotificationInfo
} from './jobsReducer';
import type { JobsState, JobTitle, JobDetail, Pagination } from '../../types/types';

describe('jobsReducer', () => {
  const initialState: JobsState = {
    jobsTitlesList: [],
    jobDetail: null,
    fetchingTitlesList: false,
    fetchingJobDetail: false,
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 25, keyword: "" },
    message: { error: "" },
    notification: { info: "" },
  };

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
    },
    {
      id: '3',
      title: 'Frontend Developer',
      company: 'Startup Inc',
      location: 'San Francisco, CA',
      creationDate: '2025-01-03'
    }
  ];

  const mockJobDetail: JobDetail = {
    jobId: 1,
    type: 'Full-time',
    salary: '$120,000 - $150,000',
    skills: ['React', 'TypeScript', 'Node.js'],
    description: 'We are looking for an experienced React developer.',
    benefits: ['Health Insurance', 'Remote Work', '401k'],
    link: 'https://example.com/apply/1',
    creationDate: '2025-01-01'
  };

  const mockPagination: Pagination = {
    currentPage: 2,
    totalPages: 5,
    totalItems: 125,
    itemsPerPage: 25,
    keyword: 'react developer'
  };

  describe('initial state', () => {
    it('should return the initial state when called with undefined', () => {
      const result = jobsReducer(undefined, { type: '@@INIT' });
      expect(result).toEqual(initialState);
    });

    it('should have correct initial values', () => {
      expect(initialState.jobsTitlesList).toEqual([]);
      expect(initialState.jobDetail).toBeNull();
      expect(initialState.fetchingTitlesList).toBe(false);
      expect(initialState.fetchingJobDetail).toBe(false);
      expect(initialState.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 25,
        keyword: ""
      });
      expect(initialState.message.error).toBe("");
      expect(initialState.notification.info).toBe("");
    });
  });

  describe('setJobsTitlesList', () => {
    it('should set jobs titles list with array of jobs', () => {
      const action = setJobsTitlesList(mockJobTitles);
      const result = jobsReducer(initialState, action);

      expect(result.jobsTitlesList).toEqual(mockJobTitles);
      expect(result.jobsTitlesList).toHaveLength(3);
      expect(result.jobsTitlesList[0].title).toBe('Senior React Developer');
    });

    it('should replace existing jobs titles list', () => {
      const stateWithExistingJobs = {
        ...initialState,
        jobsTitlesList: [mockJobTitles[0]]
      };

      const newJobs = [mockJobTitles[1], mockJobTitles[2]];
      const action = setJobsTitlesList(newJobs);
      const result = jobsReducer(stateWithExistingJobs, action);

      expect(result.jobsTitlesList).toEqual(newJobs);
      expect(result.jobsTitlesList).toHaveLength(2);
      expect(result.jobsTitlesList[0].title).toBe('Full Stack Engineer');
    });

    it('should handle empty array', () => {
      const stateWithJobs = {
        ...initialState,
        jobsTitlesList: mockJobTitles
      };

      const action = setJobsTitlesList([]);
      const result = jobsReducer(stateWithJobs, action);

      expect(result.jobsTitlesList).toEqual([]);
      expect(result.jobsTitlesList).toHaveLength(0);
    });

    it('should not affect other state properties', () => {
      const stateWithData = {
        ...initialState,
        jobDetail: mockJobDetail,
        fetchingTitlesList: true,
        notification: { info: 'Test notification' }
      };

      const action = setJobsTitlesList(mockJobTitles);
      const result = jobsReducer(stateWithData, action);

      expect(result.jobDetail).toEqual(mockJobDetail);
      expect(result.fetchingTitlesList).toBe(true);
      expect(result.notification.info).toBe('Test notification');
    });
  });

  describe('setJobsTitlesListError', () => {
    it('should set error message', () => {
      const errorMessage = 'Failed to fetch job titles';
      const action = setJobsTitlesListError(errorMessage);
      const result = jobsReducer(initialState, action);

      expect(result.message.error).toBe(errorMessage);
    });

    it('should replace existing error message', () => {
      const stateWithError = {
        ...initialState,
        message: { error: 'Old error' }
      };

      const newError = 'New error message';
      const action = setJobsTitlesListError(newError);
      const result = jobsReducer(stateWithError, action);

      expect(result.message.error).toBe(newError);
    });

    it('should handle empty string', () => {
      const stateWithError = {
        ...initialState,
        message: { error: 'Some error' }
      };

      const action = setJobsTitlesListError('');
      const result = jobsReducer(stateWithError, action);

      expect(result.message.error).toBe('');
    });

    it('should not affect other state properties', () => {
      const stateWithData = {
        ...initialState,
        jobsTitlesList: mockJobTitles,
        fetchingTitlesList: true
      };

      const action = setJobsTitlesListError('Error occurred');
      const result = jobsReducer(stateWithData, action);

      expect(result.jobsTitlesList).toEqual(mockJobTitles);
      expect(result.fetchingTitlesList).toBe(true);
    });
  });

  describe('setJobsTitlesListPagination', () => {
    it('should set pagination data', () => {
      const action = setJobsTitlesListPagination(mockPagination);
      const result = jobsReducer(initialState, action);

      expect(result.pagination).toEqual(mockPagination);
      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.totalPages).toBe(5);
      expect(result.pagination.keyword).toBe('react developer');
    });

    it('should replace existing pagination', () => {
      const existingPagination = {
        currentPage: 1,
        totalPages: 3,
        totalItems: 75,
        itemsPerPage: 25,
        keyword: 'javascript'
      };

      const stateWithPagination = {
        ...initialState,
        pagination: existingPagination
      };

      const action = setJobsTitlesListPagination(mockPagination);
      const result = jobsReducer(stateWithPagination, action);

      expect(result.pagination).toEqual(mockPagination);
      expect(result.pagination.keyword).toBe('react developer');
    });

    it('should handle pagination with empty keyword', () => {
      const paginationWithEmptyKeyword = {
        ...mockPagination,
        keyword: ''
      };

      const action = setJobsTitlesListPagination(paginationWithEmptyKeyword);
      const result = jobsReducer(initialState, action);

      expect(result.pagination.keyword).toBe('');
      expect(result.pagination.currentPage).toBe(2);
    });

    it('should not affect other state properties', () => {
      const stateWithData = {
        ...initialState,
        jobsTitlesList: mockJobTitles,
        jobDetail: mockJobDetail
      };

      const action = setJobsTitlesListPagination(mockPagination);
      const result = jobsReducer(stateWithData, action);

      expect(result.jobsTitlesList).toEqual(mockJobTitles);
      expect(result.jobDetail).toEqual(mockJobDetail);
    });
  });

  describe('setJobDetail', () => {
    it('should set job detail', () => {
      const action = setJobDetail(mockJobDetail);
      const result = jobsReducer(initialState, action);

      expect(result.jobDetail).toEqual(mockJobDetail);
      expect(result.jobDetail?.jobId).toBe(1);
      expect(result.jobDetail?.skills).toEqual(['React', 'TypeScript', 'Node.js']);
    });

    it('should replace existing job detail', () => {
      const existingJobDetail: JobDetail = {
        jobId: 2,
        type: 'Part-time',
        salary: '$80,000',
        skills: ['Vue', 'JavaScript'],
        description: 'Vue developer needed.',
        benefits: ['Flexible hours'],
        link: 'https://example.com/apply/2',
        creationDate: '2025-01-02'
      };

      const stateWithJobDetail = {
        ...initialState,
        jobDetail: existingJobDetail
      };

      const action = setJobDetail(mockJobDetail);
      const result = jobsReducer(stateWithJobDetail, action);

      expect(result.jobDetail).toEqual(mockJobDetail);
      expect(result.jobDetail?.jobId).toBe(1);
    });

    it('should set job detail to null', () => {
      const stateWithJobDetail = {
        ...initialState,
        jobDetail: mockJobDetail
      };

      const action = setJobDetail(null);
      const result = jobsReducer(stateWithJobDetail, action);

      expect(result.jobDetail).toBeNull();
    });

    it('should handle job detail with empty arrays', () => {
      const jobDetailWithEmptyArrays: JobDetail = {
        ...mockJobDetail,
        skills: [],
        benefits: []
      };

      const action = setJobDetail(jobDetailWithEmptyArrays);
      const result = jobsReducer(initialState, action);

      expect(result.jobDetail?.skills).toEqual([]);
      expect(result.jobDetail?.benefits).toEqual([]);
    });

    it('should not affect other state properties', () => {
      const stateWithData = {
        ...initialState,
        jobsTitlesList: mockJobTitles,
        fetchingJobDetail: true
      };

      const action = setJobDetail(mockJobDetail);
      const result = jobsReducer(stateWithData, action);

      expect(result.jobsTitlesList).toEqual(mockJobTitles);
      expect(result.fetchingJobDetail).toBe(true);
    });
  });

  describe('setJobDetailError', () => {
    it('should set job detail error message', () => {
      const errorMessage = 'Failed to fetch job details';
      const action = setJobDetailError(errorMessage);
      const result = jobsReducer(initialState, action);

      expect(result.message.error).toBe(errorMessage);
    });

    it('should replace existing error message', () => {
      const stateWithError = {
        ...initialState,
        message: { error: 'Previous error' }
      };

      const newError = 'Job detail fetch failed';
      const action = setJobDetailError(newError);
      const result = jobsReducer(stateWithError, action);

      expect(result.message.error).toBe(newError);
    });

    it('should clear error with empty string', () => {
      const stateWithError = {
        ...initialState,
        message: { error: 'Some error occurred' }
      };

      const action = setJobDetailError('');
      const result = jobsReducer(stateWithError, action);

      expect(result.message.error).toBe('');
    });
  });

  describe('fetchingTitlesList', () => {
    it('should set fetching titles list to true', () => {
      const action = fetchingTitlesList(true);
      const result = jobsReducer(initialState, action);

      expect(result.fetchingTitlesList).toBe(true);
    });

    it('should set fetching titles list to false', () => {
      const stateWithFetching = {
        ...initialState,
        fetchingTitlesList: true
      };

      const action = fetchingTitlesList(false);
      const result = jobsReducer(stateWithFetching, action);

      expect(result.fetchingTitlesList).toBe(false);
    });

    it('should toggle fetching state', () => {
      // Start with false, set to true
      const actionTrue = fetchingTitlesList(true);
      const resultTrue = jobsReducer(initialState, actionTrue);
      expect(resultTrue.fetchingTitlesList).toBe(true);

      // Then set back to false
      const actionFalse = fetchingTitlesList(false);
      const resultFalse = jobsReducer(resultTrue, actionFalse);
      expect(resultFalse.fetchingTitlesList).toBe(false);
    });

    it('should not affect other state properties', () => {
      const stateWithData = {
        ...initialState,
        jobsTitlesList: mockJobTitles,
        jobDetail: mockJobDetail
      };

      const action = fetchingTitlesList(true);
      const result = jobsReducer(stateWithData, action);

      expect(result.jobsTitlesList).toEqual(mockJobTitles);
      expect(result.jobDetail).toEqual(mockJobDetail);
      expect(result.fetchingJobDetail).toBe(false); // Should remain unchanged
    });
  });

  describe('fetchingJobDetail', () => {
    it('should set fetching job detail to true', () => {
      const action = fetchingJobDetail(true);
      const result = jobsReducer(initialState, action);

      expect(result.fetchingJobDetail).toBe(true);
    });

    it('should set fetching job detail to false', () => {
      const stateWithFetching = {
        ...initialState,
        fetchingJobDetail: true
      };

      const action = fetchingJobDetail(false);
      const result = jobsReducer(stateWithFetching, action);

      expect(result.fetchingJobDetail).toBe(false);
    });

    it('should handle independent loading states', () => {
      const stateWithTitlesFetching = {
        ...initialState,
        fetchingTitlesList: true
      };

      const action = fetchingJobDetail(true);
      const result = jobsReducer(stateWithTitlesFetching, action);

      expect(result.fetchingJobDetail).toBe(true);
      expect(result.fetchingTitlesList).toBe(true); // Should remain unchanged
    });

    it('should not affect other state properties', () => {
      const stateWithData = {
        ...initialState,
        jobDetail: mockJobDetail,
        notification: { info: 'Test notification' }
      };

      const action = fetchingJobDetail(true);
      const result = jobsReducer(stateWithData, action);

      expect(result.jobDetail).toEqual(mockJobDetail);
      expect(result.notification.info).toBe('Test notification');
    });
  });

  describe('setNotificationInfo', () => {
    it('should set notification message', () => {
      const notificationMessage = 'Job search completed successfully';
      const action = setNotificationInfo(notificationMessage);
      const result = jobsReducer(initialState, action);

      expect(result.notification.info).toBe(notificationMessage);
    });

    it('should replace existing notification', () => {
      const stateWithNotification = {
        ...initialState,
        notification: { info: 'Old notification' }
      };

      const newNotification = 'New notification message';
      const action = setNotificationInfo(newNotification);
      const result = jobsReducer(stateWithNotification, action);

      expect(result.notification.info).toBe(newNotification);
    });

    it('should clear notification with empty string', () => {
      const stateWithNotification = {
        ...initialState,
        notification: { info: 'Some notification' }
      };

      const action = setNotificationInfo('');
      const result = jobsReducer(stateWithNotification, action);

      expect(result.notification.info).toBe('');
    });

    it('should handle special characters in notification', () => {
      const specialMessage = 'No jobs found for "React & Node.js" - try different keywords!';
      const action = setNotificationInfo(specialMessage);
      const result = jobsReducer(initialState, action);

      expect(result.notification.info).toBe(specialMessage);
    });

    it('should not affect other state properties', () => {
      const stateWithData = {
        ...initialState,
        jobsTitlesList: mockJobTitles,
        fetchingTitlesList: true,
        message: { error: 'Some error' }
      };

      const action = setNotificationInfo('Success message');
      const result = jobsReducer(stateWithData, action);

      expect(result.jobsTitlesList).toEqual(mockJobTitles);
      expect(result.fetchingTitlesList).toBe(true);
      expect(result.message.error).toBe('Some error');
    });
  });

  describe('State Immutability', () => {
    it('should not mutate the original state', () => {
      const originalState = { ...initialState };
      const action = setJobsTitlesList(mockJobTitles);
      
      jobsReducer(initialState, action);
      
      expect(initialState).toEqual(originalState);
    });

    it('should create new state object for each action', () => {
      const action1 = setJobsTitlesList(mockJobTitles);
      const state1 = jobsReducer(initialState, action1);

      const action2 = fetchingTitlesList(true);
      const state2 = jobsReducer(state1, action2);

      expect(state1).not.toBe(state2);
      expect(state1.fetchingTitlesList).toBe(false);
      expect(state2.fetchingTitlesList).toBe(true);
    });

    it('should handle nested object updates immutably', () => {
      const originalState = {
        ...initialState,
        pagination: { ...initialState.pagination }
      };

      const action = setJobsTitlesListPagination(mockPagination);
      const newState = jobsReducer(originalState, action);

      expect(newState.pagination).not.toBe(originalState.pagination);
      expect(originalState.pagination.currentPage).toBe(1);
      expect(newState.pagination.currentPage).toBe(2);
    });
  });

  describe('Complex State Scenarios', () => {
    it('should handle multiple actions in sequence', () => {
      let state = initialState;

      // Start fetching
      state = jobsReducer(state, fetchingTitlesList(true));
      expect(state.fetchingTitlesList).toBe(true);

      // Set jobs
      state = jobsReducer(state, setJobsTitlesList(mockJobTitles));
      expect(state.jobsTitlesList).toEqual(mockJobTitles);

      // Set pagination
      state = jobsReducer(state, setJobsTitlesListPagination(mockPagination));
      expect(state.pagination).toEqual(mockPagination);

      // Stop fetching
      state = jobsReducer(state, fetchingTitlesList(false));
      expect(state.fetchingTitlesList).toBe(false);

      // Final state should have all updates
      expect(state.jobsTitlesList).toEqual(mockJobTitles);
      expect(state.pagination).toEqual(mockPagination);
      expect(state.fetchingTitlesList).toBe(false);
    });

    it('should handle error and success states simultaneously', () => {
      let state = initialState;

      // Set error message
      state = jobsReducer(state, setJobsTitlesListError('Network error'));
      expect(state.message.error).toBe('Network error');

      // Set notification (different from error)
      state = jobsReducer(state, setNotificationInfo('Search completed'));
      expect(state.notification.info).toBe('Search completed');
      expect(state.message.error).toBe('Network error'); // Should persist

      // Clear error but keep notification
      state = jobsReducer(state, setJobDetailError(''));
      expect(state.message.error).toBe('');
      expect(state.notification.info).toBe('Search completed');
    });

    it('should handle concurrent loading states', () => {
      let state = initialState;

      // Start both loading states
      state = jobsReducer(state, fetchingTitlesList(true));
      state = jobsReducer(state, fetchingJobDetail(true));

      expect(state.fetchingTitlesList).toBe(true);
      expect(state.fetchingJobDetail).toBe(true);

      // Stop one, keep the other
      state = jobsReducer(state, fetchingTitlesList(false));

      expect(state.fetchingTitlesList).toBe(false);
      expect(state.fetchingJobDetail).toBe(true); // Should remain true
    });
  });

  describe('Edge Cases', () => {
    it('should handle unknown action types gracefully', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION', payload: 'test' };
      const result = jobsReducer(initialState, unknownAction as any);

      expect(result).toEqual(initialState);
    });

    it('should handle large datasets', () => {
      const largeJobsList = Array.from({ length: 1000 }, (_, index) => ({
        id: index.toString(),
        title: `Job Title ${index}`,
        company: `Company ${index}`,
        location: `Location ${index}`,
        creationDate: '2025-01-01'
      }));

      const action = setJobsTitlesList(largeJobsList);
      const result = jobsReducer(initialState, action);

      expect(result.jobsTitlesList).toHaveLength(1000);
      expect(result.jobsTitlesList[999].title).toBe('Job Title 999');
    });

    it('should handle very long strings', () => {
      const longString = 'A'.repeat(10000);
      
      const errorAction = setJobsTitlesListError(longString);
      const errorResult = jobsReducer(initialState, errorAction);
      expect(errorResult.message.error).toBe(longString);

      const notificationAction = setNotificationInfo(longString);
      const notificationResult = jobsReducer(initialState, notificationAction);
      expect(notificationResult.notification.info).toBe(longString);
    });
  });
});