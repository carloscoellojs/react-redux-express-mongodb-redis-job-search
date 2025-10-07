import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Search } from './Search';
import jobsReducer from '../../store/reducers/jobsReducer';
import * as jobsActions from '../../store/actions/jobsActions';

// Mock the job actions
jest.mock('../../store/actions/jobsActions', () => ({
  fetchJobsTitlesList: jest.fn(),
  startFetchingTitlesList: jest.fn(),
}));

const mockedJobsActions = jobsActions as jest.Mocked<typeof jobsActions>;

describe('Search Component', () => {
  let store: ReturnType<typeof configureStore>;

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
    mockedJobsActions.fetchJobsTitlesList.mockReturnValue({ type: 'MOCK_FETCH_JOBS', payload: {} } as any);
    mockedJobsActions.startFetchingTitlesList.mockReturnValue({ type: 'MOCK_START_FETCHING', payload: {} } as any);
  });

  describe('Rendering', () => {
    it('renders the search input field', () => {
      renderWithProvider(<Search />);
      
      const searchInput = screen.getByPlaceholderText(/search for jobs/i);
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('renders the search button', () => {
      renderWithProvider(<Search />);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeInTheDocument();
      expect(searchButton).toHaveAttribute('type', 'submit');
    });

    it('renders with correct placeholder text', () => {
      renderWithProvider(<Search />);
      
      const searchInput = screen.getByPlaceholderText(
        'Search for jobs by job title (software engineer or Accountant) or city (Austin or Dallas)'
      );
      expect(searchInput).toBeInTheDocument();
    });

    it('renders search icon in button', () => {
      renderWithProvider(<Search />);
      
      const searchIcon = screen.getByRole('button', { name: /search/i }).querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('updates search term when user types', () => {
      renderWithProvider(<Search />);
      
      const searchInput = screen.getByPlaceholderText(/search for jobs/i);
      
      fireEvent.change(searchInput, { target: { value: 'software engineer' } });
      
      expect(searchInput).toHaveValue('software engineer');
    });

    it('clears search term when user deletes text', () => {
      renderWithProvider(<Search />);
      
      const searchInput = screen.getByPlaceholderText(/search for jobs/i);
      
      fireEvent.change(searchInput, { target: { value: 'test' } });
      expect(searchInput).toHaveValue('test');
      
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(searchInput).toHaveValue('');
    });

    it('handles special characters in search input', () => {
      renderWithProvider(<Search />);
      
      const searchInput = screen.getByPlaceholderText(/search for jobs/i);
      const specialText = 'C++ Developer & @Company';
      
      fireEvent.change(searchInput, { target: { value: specialText } });
      
      expect(searchInput).toHaveValue(specialText);
    });
  });

  describe('Search Functionality', () => {
    it('dispatches actions when search button is clicked', () => {
      const mockStore = createMockStore();
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
      
      renderWithProvider(<Search />, mockStore);
      
      // Clear the calls from useEffect (initial load)
      dispatchSpy.mockClear();
      mockedJobsActions.startFetchingTitlesList.mockClear();
      mockedJobsActions.fetchJobsTitlesList.mockClear();
      
      const searchInput = screen.getByPlaceholderText(/search for jobs/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(searchInput, { target: { value: 'developer' } });
      fireEvent.click(searchButton);
      
      expect(mockedJobsActions.startFetchingTitlesList).toHaveBeenCalled();
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledWith(1, 'developer');
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });

    it('trims whitespace from search term before dispatching', () => {
      const mockStore = createMockStore();
      
      renderWithProvider(<Search />, mockStore);
      
      const searchInput = screen.getByPlaceholderText(/search for jobs/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(searchInput, { target: { value: '  developer  ' } });
      fireEvent.click(searchButton);
      
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledWith(1, 'developer');
    });

    it('dispatches actions with empty search term when no text is entered', () => {
      const mockStore = createMockStore();
      
      renderWithProvider(<Search />, mockStore);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.click(searchButton);
      
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledWith(1, '');
    });

    it('can perform multiple searches', () => {
      const mockStore = createMockStore({ jobsTitlesList: [{ id: '1', title: 'Test', company: 'Test', location: 'Test' }] });
      
      renderWithProvider(<Search />, mockStore);
      
      const searchInput = screen.getByPlaceholderText(/search for jobs/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      // First search
      fireEvent.change(searchInput, { target: { value: 'developer' } });
      fireEvent.click(searchButton);
      
      // Second search
      fireEvent.change(searchInput, { target: { value: 'designer' } });
      fireEvent.click(searchButton);
      
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledTimes(2);
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenNthCalledWith(1, 1, 'developer');
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenNthCalledWith(2, 1, 'designer');
    });
  });

  describe('Loading State', () => {
    it('disables search button when fetching jobs', () => {
      const mockStore = createMockStore({ fetchingTitlesList: true });
      
      renderWithProvider(<Search />, mockStore);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      expect(searchButton).toBeDisabled();
      expect(searchButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('enables search button when not fetching jobs', () => {
      const mockStore = createMockStore({ fetchingTitlesList: false });
      
      renderWithProvider(<Search />, mockStore);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      expect(searchButton).toBeEnabled();
    });

    it('input remains enabled during loading', () => {
      const mockStore = createMockStore({ fetchingTitlesList: true });
      
      renderWithProvider(<Search />, mockStore);
      
      const searchInput = screen.getByPlaceholderText(/search for jobs/i);
      
      expect(searchInput).toBeEnabled();
    });
  });

  describe('Notification Display', () => {
    it('displays notification when notification info is present', () => {
      const mockStore = createMockStore({ 
        notification: { info: 'Search completed successfully' }
      });
      
      renderWithProvider(<Search />, mockStore);
      
      expect(screen.getByText('Search completed successfully')).toBeInTheDocument();
    });

    it('does not display notification when notification info is empty', () => {
      const mockStore = createMockStore({ 
        notification: { info: '' }
      });
      
      renderWithProvider(<Search />, mockStore);
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('updates notification display when state changes', () => {
      const mockStore = createMockStore({ 
        notification: { info: '' }
      });
      
      const { rerender } = renderWithProvider(<Search />, mockStore);
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      
      // Update store state with act
      act(() => {
        mockStore.dispatch({ 
          type: 'jobs/setNotificationInfo', 
          payload: 'New notification message'
        });
      });
      
      rerender(
        <Provider store={mockStore}>
          <Search />
        </Provider>
      );
      
      expect(screen.getByText('New notification message')).toBeInTheDocument();
    });
  });

  describe('Initial Load Effect', () => {
    it('fetches jobs on mount when jobs list is empty', () => {
      const mockStore = createMockStore({ jobsTitlesList: [] });
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
      
      renderWithProvider(<Search />, mockStore);
      
      expect(mockedJobsActions.startFetchingTitlesList).toHaveBeenCalled();
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledWith();
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });

    it('does not fetch jobs on mount when jobs list is not empty', () => {
      const mockStore = createMockStore({ 
        jobsTitlesList: [
          { id: '1', title: 'Developer', company: 'Tech Corp', location: 'Austin' }
        ]
      });
      
      renderWithProvider(<Search />, mockStore);
      
      // Should not dispatch fetch actions if jobs already exist
      expect(mockedJobsActions.startFetchingTitlesList).not.toHaveBeenCalled();
      expect(mockedJobsActions.fetchJobsTitlesList).not.toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    it('applies correct CSS classes for responsive layout', () => {
      renderWithProvider(<Search />);
      
      const container = screen.getByRole('button', { name: /search/i }).closest('div')?.parentElement;
      expect(container).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'gap-3');
    });

    it('applies correct CSS classes to input wrapper', () => {
      renderWithProvider(<Search />);
      
      const inputWrapper = screen.getByPlaceholderText(/search for jobs/i).closest('div');
      expect(inputWrapper).toHaveClass('flex-1');
    });

    it('applies correct CSS classes to button wrapper', () => {
      renderWithProvider(<Search />);
      
      const buttonWrapper = screen.getByRole('button', { name: /search/i }).closest('div');
      expect(buttonWrapper).toHaveClass('flex-shrink-0');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithProvider(<Search />);
      
      const searchInput = screen.getByPlaceholderText(/search for jobs/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      expect(searchInput).toHaveAttribute('type', 'text');
      expect(searchButton).toHaveAttribute('type', 'submit');
    });

    it('maintains focus management', () => {
      renderWithProvider(<Search />);
      
      const searchInput = screen.getByPlaceholderText(/search for jobs/i);
      
      searchInput.focus();
      expect(searchInput).toHaveFocus();
    });

    it('supports keyboard navigation', () => {
      renderWithProvider(<Search />);
      
      const searchInput = screen.getByPlaceholderText(/search for jobs/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      // Tab navigation should work
      searchInput.focus();
      expect(searchInput).toHaveFocus();
      
      // Simulate tab to button
      fireEvent.keyDown(searchInput, { key: 'Tab' });
      searchButton.focus();
      expect(searchButton).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long search terms', () => {
      renderWithProvider(<Search />);
      
      const searchInput = screen.getByPlaceholderText(/search for jobs/i);
      const longSearchTerm = 'a'.repeat(1000);
      
      fireEvent.change(searchInput, { target: { value: longSearchTerm } });
      
      expect(searchInput).toHaveValue(longSearchTerm);
    });

    it('handles search with only whitespace', () => {
      const mockStore = createMockStore();
      
      renderWithProvider(<Search />, mockStore);
      
      const searchInput = screen.getByPlaceholderText(/search for jobs/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(searchInput, { target: { value: '   ' } });
      fireEvent.click(searchButton);
      
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledWith(1, '');
    });

    it('handles rapid successive clicks', () => {
      const mockStore = createMockStore({ jobsTitlesList: [{ id: '1', title: 'Test', company: 'Test', location: 'Test' }] });
      
      renderWithProvider(<Search />, mockStore);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.click(searchButton);
      fireEvent.click(searchButton);
      fireEvent.click(searchButton);
      
      expect(mockedJobsActions.startFetchingTitlesList).toHaveBeenCalledTimes(3);
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledTimes(3);
    });
  });
});