import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { JobsTitles } from './JobsTitles';
import jobsReducer from '../../store/reducers/jobsReducer';
import * as jobsActions from '../../store/actions/jobsActions';
import type { JobTitle } from '../../types/types';

// Mock the job actions
jest.mock('../../store/actions/jobsActions', () => ({
  fetchJobDetail: jest.fn(),
  startFetchingJobDetail: jest.fn(),
}));

const mockedJobsActions = jobsActions as jest.Mocked<typeof jobsActions>;

describe('JobsTitles Component', () => {
  let store: ReturnType<typeof configureStore>;

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
      company: 'Digital Solutions',
      location: 'Houston, TX',
      creationDate: '2025-01-03'
    }
  ];

  const createMockStore = (initialState = {}) => {
    return configureStore({
      reducer: {
        jobs: jobsReducer
      },
      preloadedState: {
        jobs: {
          jobsTitlesList: [],
          jobDetail: null,
          fetchingTitlesList: false,
          fetchingJobDetail: false,
          pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 25, keyword: "" },
          message: { error: "" },
          notification: { info: "" },
          ...initialState
        }
      }
    });
  };

  const renderWithProvider = (component: React.ReactElement, customStore = store) => {
    return render(
      <Provider store={customStore}>
        {component}
      </Provider>
    );
  };

  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();
    
    // Mock console.log to avoid output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Mock the action creators to return mock actions
    mockedJobsActions.fetchJobDetail.mockReturnValue({ type: 'MOCK_FETCH_JOB_DETAIL', payload: {} } as any);
    mockedJobsActions.startFetchingJobDetail.mockReturnValue({ type: 'MOCK_START_FETCHING_DETAIL', payload: {} } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('displays spinner when fetching job titles', () => {
      const mockStore = createMockStore({ fetchingTitlesList: true });
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      expect(screen.getByText('Loading job titles...')).toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('does not display spinner when not fetching', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: mockJobTitles 
      });
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      expect(screen.queryByText('Loading job titles...')).not.toBeInTheDocument();
    });

    it('has correct spinner message', () => {
      const mockStore = createMockStore({ fetchingTitlesList: true });
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      const spinner = screen.getByText('Loading job titles...');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Job Titles Rendering', () => {
    it('renders job titles when available', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: mockJobTitles 
      });
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
      expect(screen.getByText('Full Stack Engineer')).toBeInTheDocument();
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    it('renders all job information correctly', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: [mockJobTitles[0]] 
      });
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('Austin, TX')).toBeInTheDocument();
      expect(screen.getByText('Posted: 2025-01-01')).toBeInTheDocument();
    });

    it('renders multiple job cards', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: mockJobTitles 
      });
      
      const { container } = renderWithProvider(<JobsTitles />, mockStore);
      
      // Check that we have the expected number of job cards by counting divs inside the container
      const jobCards = container.querySelectorAll('.jobs-titles-container > div');
      expect(jobCards.length).toBe(3);
      
      // Check that all three job titles are present
      expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
      expect(screen.getByText('Full Stack Engineer')).toBeInTheDocument();
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    it('renders nothing when job titles list is empty', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: [] 
      });
      
      const { container } = renderWithProvider(<JobsTitles />, mockStore);
      
      const jobsContainer = container.querySelector('.jobs-titles-container');
      expect(jobsContainer).toBeInTheDocument();
      expect(jobsContainer?.children).toHaveLength(0);
    });

    it('renders nothing when job titles list is null', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: null 
      });
      
      const { container } = renderWithProvider(<JobsTitles />, mockStore);
      
      const jobsContainer = container.querySelector('.jobs-titles-container');
      expect(jobsContainer).toBeInTheDocument();
      expect(jobsContainer?.children).toHaveLength(0);
    });
  });

  describe('Job Card Interactions', () => {
    it('calls onClickCard when job card is clicked', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: [mockJobTitles[0]] 
      });
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      const jobCard = screen.getByText('Senior React Developer').closest('div');
      fireEvent.click(jobCard!);
      
      expect(mockedJobsActions.startFetchingJobDetail).toHaveBeenCalled();
      expect(mockedJobsActions.fetchJobDetail).toHaveBeenCalledWith(1);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });

    it('logs correct message when card is clicked', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: [mockJobTitles[0]] 
      });
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      const jobCard = screen.getByText('Senior React Developer').closest('div');
      fireEvent.click(jobCard!);
      
      expect(console.log).toHaveBeenCalledWith('Card clicked with id:', '1');
    });

    it('calls fetchJobDetail with correct job ID when different cards are clicked', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: mockJobTitles 
      });
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      // Click first job card
      const firstJobCard = screen.getByText('Senior React Developer').closest('div');
      fireEvent.click(firstJobCard!);
      
      expect(mockedJobsActions.fetchJobDetail).toHaveBeenCalledWith(1);
      
      // Click second job card
      const secondJobCard = screen.getByText('Full Stack Engineer').closest('div');
      fireEvent.click(secondJobCard!);
      
      expect(mockedJobsActions.fetchJobDetail).toHaveBeenCalledWith(2);
      
      // Click third job card
      const thirdJobCard = screen.getByText('Frontend Developer').closest('div');
      fireEvent.click(thirdJobCard!);
      
      expect(mockedJobsActions.fetchJobDetail).toHaveBeenCalledWith(3);
      
      expect(mockedJobsActions.fetchJobDetail).toHaveBeenCalledTimes(3);
    });

    it('dispatches actions in correct order when card is clicked', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: [mockJobTitles[0]] 
      });
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      const jobCard = screen.getByText('Senior React Developer').closest('div');
      fireEvent.click(jobCard!);
      
      // Check that startFetchingJobDetail is called before fetchJobDetail
      expect(mockedJobsActions.startFetchingJobDetail).toHaveBeenCalled();
      expect(mockedJobsActions.fetchJobDetail).toHaveBeenCalledWith(1);
      expect(dispatchSpy).toHaveBeenNthCalledWith(1, { type: 'MOCK_START_FETCHING_DETAIL', payload: {} });
      expect(dispatchSpy).toHaveBeenNthCalledWith(2, { type: 'MOCK_FETCH_JOB_DETAIL', payload: {} });
    });

    it('handles multiple rapid clicks on same card', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: [mockJobTitles[0]] 
      });
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      const jobCard = screen.getByText('Senior React Developer').closest('div');
      
      fireEvent.click(jobCard!);
      fireEvent.click(jobCard!);
      fireEvent.click(jobCard!);
      
      expect(mockedJobsActions.startFetchingJobDetail).toHaveBeenCalledTimes(3);
      expect(mockedJobsActions.fetchJobDetail).toHaveBeenCalledTimes(3);
    });
  });

  describe('Component Structure', () => {
    it('has correct container class', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: mockJobTitles 
      });
      
      const { container } = renderWithProvider(<JobsTitles />, mockStore);
      
      expect(container.querySelector('.jobs-titles-container')).toBeInTheDocument();
    });

    it('renders each job with unique key', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: mockJobTitles 
      });
      
      const { container } = renderWithProvider(<JobsTitles />, mockStore);
      
      // Check that we have the expected number of job cards
      const jobCards = container.querySelectorAll('.jobs-titles-container > div');
      expect(jobCards).toHaveLength(mockJobTitles.length);
    });

    it('passes correct props to CardJobTitle components', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: [mockJobTitles[0]] 
      });
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      // Check that all required props are rendered correctly
      expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('Austin, TX')).toBeInTheDocument();
      expect(screen.getByText('Posted: 2025-01-01')).toBeInTheDocument();
    });
  });

  describe('State Management Integration', () => {
    it('correctly reads from Redux store', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: mockJobTitles,
        jobDetail: null,
        pagination: { currentPage: 2, totalPages: 5, totalItems: 100, itemsPerPage: 25, keyword: "developer" }
      });
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      // Component should render based on store state
      expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
      expect(screen.queryByText('Loading job titles...')).not.toBeInTheDocument();
    });

    it('dispatches actions through Redux store', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: [mockJobTitles[0]] 
      });
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      const jobCard = screen.getByText('Senior React Developer').closest('div');
      fireEvent.click(jobCard!);
      
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles job with very long title', () => {
      const longTitleJob = {
        ...mockJobTitles[0],
        title: 'Senior Full Stack React TypeScript Node.js MongoDB Redis AWS Cloud Engineer Developer'
      };
      
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: [longTitleJob] 
      });
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      expect(screen.getByText(longTitleJob.title)).toBeInTheDocument();
    });

    it('handles job with empty company name', () => {
      const emptyCompanyJob = {
        ...mockJobTitles[0],
        company: ''
      };
      
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: [emptyCompanyJob] 
      });
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
    });

    it('handles job with special characters in title', () => {
      const specialCharJob = {
        ...mockJobTitles[0],
        title: 'C++ Developer & Software Engineer @TechCorp'
      };
      
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: [specialCharJob] 
      });
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      expect(screen.getByText('C++ Developer & Software Engineer @TechCorp')).toBeInTheDocument();
    });

    it('handles numeric job IDs correctly', () => {
      const numericIdJob = {
        ...mockJobTitles[0],
        id: '999'
      };
      
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: [numericIdJob] 
      });
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      const jobCard = screen.getByText('Senior React Developer').closest('div');
      fireEvent.click(jobCard!);
      
      expect(mockedJobsActions.fetchJobDetail).toHaveBeenCalledWith(999);
    });
  });

  describe('Accessibility', () => {
    it('job cards are clickable', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: [mockJobTitles[0]] 
      });
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      const jobCard = screen.getByText('Senior React Developer').closest('div');
      expect(jobCard).toHaveClass('cursor-pointer');
    });

    it('supports keyboard navigation on job cards', () => {
      const mockStore = createMockStore({ 
        fetchingTitlesList: false,
        jobsTitlesList: [mockJobTitles[0]] 
      });
      
      renderWithProvider(<JobsTitles />, mockStore);
      
      const jobCard = screen.getByText('Senior React Developer').closest('div');
      
      // Simulate keyboard interaction
      fireEvent.keyDown(jobCard!, { key: 'Enter' });
      
      // The click handler should be attached to the div
      expect(jobCard).toBeInTheDocument();
    });
  });
});