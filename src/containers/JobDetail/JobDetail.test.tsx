import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { JobDetail } from './JobDetail';
import jobsReducer from '../../store/reducers/jobsReducer';
import * as jobsActions from '../../store/actions/jobsActions';
import type { JobDetail as JobDetailType, JobTitle } from '../../types/types';

// Mock the job actions
jest.mock('../../store/actions/jobsActions', () => ({
  fetchJobDetail: jest.fn(),
  startFetchingJobDetail: jest.fn(),
}));

const mockedJobsActions = jobsActions as jest.Mocked<typeof jobsActions>;

describe('JobDetail Component', () => {
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
    }
  ];

  const mockJobDetail: JobDetailType = {
    jobId: 1,
    type: 'Full-time',
    salary: '$120,000 - $150,000',
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
    description: 'We are looking for an experienced React developer to join our team and help build amazing user experiences.',
    benefits: ['Health Insurance', 'Dental Coverage', '401k Match', 'Remote Work', 'Flexible Hours'],
    link: 'https://example.com/apply/1',
    creationDate: '2025-01-01',
  };

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
    
    // Mock the action creators to return mock actions
    mockedJobsActions.fetchJobDetail.mockReturnValue({ type: 'MOCK_FETCH_JOB_DETAIL', payload: {} } as any);
    mockedJobsActions.startFetchingJobDetail.mockReturnValue({ type: 'MOCK_START_FETCHING_DETAIL', payload: {} } as any);
  });

  describe('Loading State', () => {
    it('displays spinner when fetching job detail', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: true,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(screen.getByText('Loading job details...')).toBeInTheDocument();
      expect(screen.queryByText('Job Type')).not.toBeInTheDocument();
    });

    it('does not display spinner when not fetching', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: mockJobDetail,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(screen.queryByText('Loading job details...')).not.toBeInTheDocument();
    });

    it('has correct spinner message', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: true,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      const spinner = screen.getByText('Loading job details...');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Job Detail Rendering', () => {
    it('renders job detail when available', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: mockJobDetail,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(screen.getByText('Job Type')).toBeInTheDocument();
      expect(screen.getByText('Full-time')).toBeInTheDocument();
      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByText('$120,000 - $150,000')).toBeInTheDocument();
    });

    it('renders job description correctly', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: mockJobDetail,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(screen.getByText('Job Description')).toBeInTheDocument();
      expect(screen.getByText('We are looking for an experienced React developer to join our team and help build amazing user experiences.')).toBeInTheDocument();
    });

    it('renders skills correctly', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: mockJobDetail,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(screen.getByText('Required Skills')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('MongoDB')).toBeInTheDocument();
    });

    it('renders benefits correctly', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: mockJobDetail,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(screen.getByText('Benefits')).toBeInTheDocument();
      expect(screen.getByText('Health Insurance')).toBeInTheDocument();
      expect(screen.getByText('Dental Coverage')).toBeInTheDocument();
      expect(screen.getByText('401k Match')).toBeInTheDocument();
      expect(screen.getByText('Remote Work')).toBeInTheDocument();
      expect(screen.getByText('Flexible Hours')).toBeInTheDocument();
    });

    it('renders job ID and creation date', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: mockJobDetail,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(screen.getByText('ID: 1')).toBeInTheDocument();
      expect(screen.getByText('2025-01-01')).toBeInTheDocument();
    });

    it('renders apply button with correct link', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: mockJobDetail,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      const applyButton = screen.getByRole('link', { name: /apply for this position/i });
      expect(applyButton).toBeInTheDocument();
      expect(applyButton).toHaveAttribute('href', 'https://example.com/apply/1');
      expect(applyButton).toHaveAttribute('target', '_blank');
      expect(applyButton).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders nothing when job detail is null', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: null,
        jobsTitlesList: mockJobTitles
      });
      
      const { container } = renderWithProvider(<JobDetail />, mockStore);
      
      const jobDetailContainer = container.querySelector('.job-detail-container');
      expect(jobDetailContainer).toBeInTheDocument();
      expect(jobDetailContainer?.children).toHaveLength(0);
    });

    it('renders nothing when job detail is undefined', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: undefined,
        jobsTitlesList: mockJobTitles
      });
      
      const { container } = renderWithProvider(<JobDetail />, mockStore);
      
      const jobDetailContainer = container.querySelector('.job-detail-container');
      expect(jobDetailContainer).toBeInTheDocument();
      expect(jobDetailContainer?.children).toHaveLength(0);
    });
  });

  describe('useEffect Behavior', () => {
    it('does not fetch job detail when jobsTitlesList is empty', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: null,
        jobsTitlesList: []
      });
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(mockedJobsActions.startFetchingJobDetail).not.toHaveBeenCalled();
      expect(mockedJobsActions.fetchJobDetail).not.toHaveBeenCalled();
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('fetches job detail when jobsTitlesList has items', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: null,
        jobsTitlesList: mockJobTitles
      });
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(mockedJobsActions.startFetchingJobDetail).toHaveBeenCalled();
      expect(mockedJobsActions.fetchJobDetail).toHaveBeenCalledWith('1'); // First job ID
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });

    it('uses first job ID from jobsTitlesList', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: null,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(mockedJobsActions.fetchJobDetail).toHaveBeenCalledWith('1');
    });

    it('dispatches actions in correct order', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: null,
        jobsTitlesList: mockJobTitles
      });
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(mockedJobsActions.startFetchingJobDetail).toHaveBeenCalled();
      expect(mockedJobsActions.fetchJobDetail).toHaveBeenCalledWith('1');
      expect(dispatchSpy).toHaveBeenNthCalledWith(1, { type: 'MOCK_START_FETCHING_DETAIL', payload: {} });
      expect(dispatchSpy).toHaveBeenNthCalledWith(2, { type: 'MOCK_FETCH_JOB_DETAIL', payload: {} });
    });
  });

  describe('Component Structure', () => {
    it('has correct container class', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: mockJobDetail,
        jobsTitlesList: mockJobTitles
      });
      
      const { container } = renderWithProvider(<JobDetail />, mockStore);
      
      expect(container.querySelector('.job-detail-container')).toBeInTheDocument();
    });

    it('passes all props correctly to CardJobDetail', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: mockJobDetail,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      // Check that all job detail properties are rendered
      expect(screen.getByText('ID: 1')).toBeInTheDocument();
      expect(screen.getByText('Full-time')).toBeInTheDocument();
      expect(screen.getByText('$120,000 - $150,000')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Health Insurance')).toBeInTheDocument();
    });
  });

  describe('State Management Integration', () => {
    it('correctly reads from Redux store', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: mockJobDetail,
        jobsTitlesList: mockJobTitles,
        pagination: { currentPage: 2, totalPages: 5, totalItems: 100, itemsPerPage: 25, keyword: "developer" }
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      // Component should render based on store state
      expect(screen.getByText('Job Type')).toBeInTheDocument();
      expect(screen.queryByText('Loading job details...')).not.toBeInTheDocument();
    });

    it('dispatches actions through Redux store', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: null,
        jobsTitlesList: mockJobTitles
      });
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles job detail with empty skills array', () => {
      const jobDetailWithEmptySkills = {
        ...mockJobDetail,
        skills: []
      };
      
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: jobDetailWithEmptySkills,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(screen.getByText('Required Skills')).toBeInTheDocument();
      // Should not render any skill badges
      expect(screen.queryByText('React')).not.toBeInTheDocument();
    });

    it('handles job detail with empty benefits array', () => {
      const jobDetailWithEmptyBenefits = {
        ...mockJobDetail,
        benefits: []
      };
      
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: jobDetailWithEmptyBenefits,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(screen.getByText('Benefits')).toBeInTheDocument();
      // Should not render any benefit items
      expect(screen.queryByText('Health Insurance')).not.toBeInTheDocument();
    });

    it('handles job detail with very long description', () => {
      const longDescription = 'A'.repeat(1000);
      const jobDetailWithLongDescription = {
        ...mockJobDetail,
        description: longDescription
      };
      
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: jobDetailWithLongDescription,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('handles job detail with special characters in fields', () => {
      const specialCharJobDetail = {
        ...mockJobDetail,
        type: 'Full-time & Contract',
        salary: '$120,000 - $150,000 (USD)',
        skills: ['React.js', 'Node.js', 'C++', 'C#'],
        description: 'We are looking for a developer who can work with React & Node.js @ our company!'
      };
      
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: specialCharJobDetail,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(screen.getByText('Full-time & Contract')).toBeInTheDocument();
      expect(screen.getByText('$120,000 - $150,000 (USD)')).toBeInTheDocument();
      expect(screen.getByText('React.js')).toBeInTheDocument();
      expect(screen.getByText('C++')).toBeInTheDocument();
    });

    it('handles single job title in list', () => {
      const singleJobTitle = [mockJobTitles[0]];
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: null,
        jobsTitlesList: singleJobTitle
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      expect(mockedJobsActions.fetchJobDetail).toHaveBeenCalledWith('1');
    });
  });

  describe('Performance and Optimization', () => {
    it('does not re-fetch when component re-renders with same jobsTitlesList', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: null,
        jobsTitlesList: mockJobTitles
      });
      
      const { rerender } = renderWithProvider(<JobDetail />, mockStore);
      
      // Clear the mocks after initial render
      jest.clearAllMocks();
      
      // Re-render with same props
      rerender(
        <Provider store={mockStore}>
          <JobDetail />
        </Provider>
      );
      
      // Should not call fetch actions again
      expect(mockedJobsActions.startFetchingJobDetail).not.toHaveBeenCalled();
      expect(mockedJobsActions.fetchJobDetail).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible apply button', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: mockJobDetail,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      const applyButton = screen.getByRole('link', { name: /apply for this position/i });
      expect(applyButton).toBeInTheDocument();
      expect(applyButton).toHaveAttribute('href');
    });

    it('has proper heading structure', () => {
      const mockStore = createMockStore({ 
        fetchingJobDetail: false,
        jobDetail: mockJobDetail,
        jobsTitlesList: mockJobTitles
      });
      
      renderWithProvider(<JobDetail />, mockStore);
      
      // Check that section headings are present
      expect(screen.getByText('Job Type')).toBeInTheDocument();
      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByText('Job Description')).toBeInTheDocument();
      expect(screen.getByText('Required Skills')).toBeInTheDocument();
      expect(screen.getByText('Benefits')).toBeInTheDocument();
    });
  });
});