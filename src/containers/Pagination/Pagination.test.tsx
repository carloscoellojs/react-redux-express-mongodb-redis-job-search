import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Pagination } from './Pagination';
import jobsReducer from '../../store/reducers/jobsReducer';
import * as jobsActions from '../../store/actions/jobsActions';
import type { Pagination as PaginationType } from '../../types/types';

// Mock the job actions
jest.mock('../../store/actions/jobsActions', () => ({
  fetchJobsTitlesList: jest.fn(),
  startFetchingTitlesList: jest.fn(),
}));

const mockedJobsActions = jobsActions as jest.Mocked<typeof jobsActions>;

describe('Pagination Component', () => {
  let store: ReturnType<typeof configureStore>;

  const basePagination: PaginationType = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 25,
    keyword: ""
  };

  const createMockStore = (paginationOverrides = {}) => {
    const pagination = { ...basePagination, ...paginationOverrides };
    
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
          pagination,
          message: { error: "" },
          notification: { info: "" },
        }
      }
    });
  };

  const renderWithProvider = (customStore = store) => {
    return render(
      <Provider store={customStore}>
        <Pagination />
      </Provider>
    );
  };

  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();
    
    // Mock console.log to avoid output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Mock the action creators to return mock actions
    mockedJobsActions.fetchJobsTitlesList.mockReturnValue({ type: 'MOCK_FETCH_JOBS', payload: {} } as any);
    mockedJobsActions.startFetchingTitlesList.mockReturnValue({ type: 'MOCK_START_FETCHING', payload: {} } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Visibility Conditions', () => {
    it('renders nothing when totalPages is 1', () => {
      const mockStore = createMockStore({ totalPages: 1, currentPage: 1 });
      const { container } = renderWithProvider(mockStore);
      
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when totalPages is 0', () => {
      const mockStore = createMockStore({ totalPages: 0, currentPage: 1 });
      const { container } = renderWithProvider(mockStore);
      
      expect(container.firstChild).toBeNull();
    });

    it('renders pagination when totalPages is greater than 1', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 1 });
      renderWithProvider(mockStore);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Basic Rendering', () => {
    it('renders previous and next buttons', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 3 });
      renderWithProvider(mockStore);
      
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons[0];
      const nextButton = buttons[buttons.length - 1];
      
      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
      
      // Check for SVG icons
      expect(prevButton.querySelector('svg')).toBeInTheDocument();
      expect(nextButton.querySelector('svg')).toBeInTheDocument();
    });

    it('renders page number buttons', () => {
      const mockStore = createMockStore({ totalPages: 3, currentPage: 2 });
      renderWithProvider(mockStore);
      
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    });

    it('highlights current page', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 3 });
      renderWithProvider(mockStore);
      
      const currentPageButton = screen.getByRole('button', { name: '3' });
      expect(currentPageButton).toHaveClass('from-blue-600', 'to-purple-600');
    });

    it('has correct container class', () => {
      const mockStore = createMockStore({ totalPages: 3, currentPage: 1 });
      const { container } = renderWithProvider(mockStore);
      
      expect(container.querySelector('.pagination-container')).toBeInTheDocument();
    });
  });

  describe('Previous Button Behavior', () => {
    it('disables previous button on first page', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 1 });
      renderWithProvider(mockStore);
      
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons[0];
      
      expect(prevButton).toBeDisabled();
      expect(prevButton).toHaveClass('cursor-not-allowed');
    });

    it('enables previous button when not on first page', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 3 });
      renderWithProvider(mockStore);
      
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons[0];
      
      expect(prevButton).toBeEnabled();
      expect(prevButton).not.toHaveClass('cursor-not-allowed');
    });

    it('calls handlePageChange with current page - 1 when previous is clicked', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 3, keyword: 'developer' });
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
      
      renderWithProvider(mockStore);
      
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons[0];
      
      fireEvent.click(prevButton);
      
      expect(mockedJobsActions.startFetchingTitlesList).toHaveBeenCalled();
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledWith(2, 'developer');
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });

    it('logs correct message when previous button is clicked', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 3 });
      renderWithProvider(mockStore);
      
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons[0];
      
      fireEvent.click(prevButton);
      
      expect(console.log).toHaveBeenCalledWith('Navigating to page:', 2);
    });
  });

  describe('Next Button Behavior', () => {
    it('disables next button on last page', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 5 });
      renderWithProvider(mockStore);
      
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      
      expect(nextButton).toBeDisabled();
      expect(nextButton).toHaveClass('cursor-not-allowed');
    });

    it('enables next button when not on last page', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 3 });
      renderWithProvider(mockStore);
      
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      
      expect(nextButton).toBeEnabled();
      expect(nextButton).not.toHaveClass('cursor-not-allowed');
    });

    it('calls handlePageChange with current page + 1 when next is clicked', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 3, keyword: 'engineer' });
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
      
      renderWithProvider(mockStore);
      
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      
      fireEvent.click(nextButton);
      
      expect(mockedJobsActions.startFetchingTitlesList).toHaveBeenCalled();
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledWith(4, 'engineer');
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });

    it('logs correct message when next button is clicked', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 3 });
      renderWithProvider(mockStore);
      
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      
      fireEvent.click(nextButton);
      
      expect(console.log).toHaveBeenCalledWith('Navigating to page:', 4);
    });
  });

  describe('Page Number Button Behavior', () => {
    it('calls handlePageChange with correct page number when page button is clicked', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 1, keyword: 'test' });
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
      
      renderWithProvider(mockStore);
      
      const pageButton = screen.getByRole('button', { name: '3' });
      fireEvent.click(pageButton);
      
      expect(mockedJobsActions.startFetchingTitlesList).toHaveBeenCalled();
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledWith(3, 'test');
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });

    it('can click on first page button', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 3 });
      renderWithProvider(mockStore);
      
      const firstPageButton = screen.getByRole('button', { name: '1' });
      fireEvent.click(firstPageButton);
      
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledWith(1, '');
    });

    it('can click on last page button', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 1 });
      renderWithProvider(mockStore);
      
      const lastPageButton = screen.getByRole('button', { name: '5' });
      fireEvent.click(lastPageButton);
      
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledWith(5, '');
    });

    it('dispatches actions in correct order when page is clicked', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 1 });
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
      
      renderWithProvider(mockStore);
      
      const pageButton = screen.getByRole('button', { name: '3' });
      fireEvent.click(pageButton);
      
      expect(dispatchSpy).toHaveBeenNthCalledWith(1, { type: 'MOCK_START_FETCHING', payload: {} });
      expect(dispatchSpy).toHaveBeenNthCalledWith(2, { type: 'MOCK_FETCH_JOBS', payload: {} });
    });
  });

  describe('Page Number Generation', () => {
    it('shows all pages when total pages is small', () => {
      const mockStore = createMockStore({ totalPages: 3, currentPage: 2 });
      renderWithProvider(mockStore);
      
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    });

    it('shows ellipsis when there are many pages', () => {
      const mockStore = createMockStore({ totalPages: 10, currentPage: 5 });
      renderWithProvider(mockStore);
      
      const ellipsisElements = screen.getAllByText('...');
      expect(ellipsisElements.length).toBeGreaterThan(0);
    });

    it('shows correct pages around current page', () => {
      const mockStore = createMockStore({ totalPages: 10, currentPage: 5 });
      renderWithProvider(mockStore);
      
      // Should show pages around current page (3, 4, 5, 6, 7)
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument();
    });

    it('always shows first and last page', () => {
      const mockStore = createMockStore({ totalPages: 10, currentPage: 5 });
      renderWithProvider(mockStore);
      
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    });

    it('handles edge case when current page is near beginning', () => {
      const mockStore = createMockStore({ totalPages: 10, currentPage: 2 });
      renderWithProvider(mockStore);
      
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
    });

    it('handles edge case when current page is near end', () => {
      const mockStore = createMockStore({ totalPages: 10, currentPage: 9 });
      renderWithProvider(mockStore);
      
      expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '8' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '9' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    });
  });

  describe('Keyword Handling', () => {
    it('passes empty keyword when no search term', () => {
      const mockStore = createMockStore({ totalPages: 3, currentPage: 1, keyword: '' });
      renderWithProvider(mockStore);
      
      const pageButton = screen.getByRole('button', { name: '2' });
      fireEvent.click(pageButton);
      
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledWith(2, '');
    });

    it('passes keyword from pagination state', () => {
      const mockStore = createMockStore({ totalPages: 3, currentPage: 1, keyword: 'react developer' });
      renderWithProvider(mockStore);
      
      const pageButton = screen.getByRole('button', { name: '2' });
      fireEvent.click(pageButton);
      
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledWith(2, 'react developer');
    });

    it('handles special characters in keyword', () => {
      const mockStore = createMockStore({ totalPages: 3, currentPage: 1, keyword: 'C++ & Node.js' });
      renderWithProvider(mockStore);
      
      const pageButton = screen.getByRole('button', { name: '2' });
      fireEvent.click(pageButton);
      
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledWith(2, 'C++ & Node.js');
    });
  });

  describe('State Management Integration', () => {
    it('correctly reads pagination from Redux store', () => {
      const mockStore = createMockStore({ 
        totalPages: 5, 
        currentPage: 3,
        totalItems: 100,
        itemsPerPage: 25,
        keyword: 'developer'
      });
      
      renderWithProvider(mockStore);
      
      // Should render based on store state
      expect(screen.getByRole('button', { name: '3' })).toHaveClass('from-blue-600');
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('dispatches actions through Redux store', () => {
      const mockStore = createMockStore({ totalPages: 3, currentPage: 1 });
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
      
      renderWithProvider(mockStore);
      
      const pageButton = screen.getByRole('button', { name: '2' });
      fireEvent.click(pageButton);
      
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles totalPages = 2', () => {
      const mockStore = createMockStore({ totalPages: 2, currentPage: 1 });
      renderWithProvider(mockStore);
      
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    it('handles large number of pages', () => {
      const mockStore = createMockStore({ totalPages: 100, currentPage: 50 });
      renderWithProvider(mockStore);
      
      // Should still render without crashing
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '50' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '100' })).toBeInTheDocument();
    });

    it('handles clicking same page multiple times', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 3 });
      renderWithProvider(mockStore);
      
      const currentPageButton = screen.getByRole('button', { name: '3' });
      
      fireEvent.click(currentPageButton);
      fireEvent.click(currentPageButton);
      fireEvent.click(currentPageButton);
      
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledTimes(3);
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledWith(3, '');
    });

    it('handles rapid navigation clicks', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 3 });
      renderWithProvider(mockStore);
      
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons[0];
      const nextButton = buttons[buttons.length - 1];
      
      fireEvent.click(prevButton);
      fireEvent.click(nextButton);
      fireEvent.click(prevButton);
      
      expect(mockedJobsActions.fetchJobsTitlesList).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('uses navigation landmark', () => {
      const mockStore = createMockStore({ totalPages: 3, currentPage: 1 });
      renderWithProvider(mockStore);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('buttons are keyboard accessible', () => {
      const mockStore = createMockStore({ totalPages: 3, currentPage: 1 });
      renderWithProvider(mockStore);
      
      const pageButton = screen.getByRole('button', { name: '2' });
      pageButton.focus();
      expect(pageButton).toHaveFocus();
    });

    it('disabled buttons cannot be focused normally', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 1 });
      renderWithProvider(mockStore);
      
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons[0];
      
      expect(prevButton).toBeDisabled();
    });

    it('has proper button text content', () => {
      const mockStore = createMockStore({ totalPages: 3, currentPage: 1 });
      renderWithProvider(mockStore);
      
      expect(screen.getByRole('button', { name: '1' })).toHaveTextContent('1');
      expect(screen.getByRole('button', { name: '2' })).toHaveTextContent('2');
      expect(screen.getByRole('button', { name: '3' })).toHaveTextContent('3');
    });
  });

  describe('Visual States', () => {
    it('applies correct styles to current page', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 3 });
      renderWithProvider(mockStore);
      
      const currentPageButton = screen.getByRole('button', { name: '3' });
      expect(currentPageButton).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-purple-600');
    });

    it('applies correct styles to non-current pages', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 3 });
      renderWithProvider(mockStore);
      
      const otherPageButton = screen.getByRole('button', { name: '2' });
      expect(otherPageButton).toHaveClass('bg-white', 'text-gray-700');
    });

    it('applies correct styles to disabled previous button', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 1 });
      renderWithProvider(mockStore);
      
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons[0];
      
      expect(prevButton).toHaveClass('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
    });

    it('applies correct styles to disabled next button', () => {
      const mockStore = createMockStore({ totalPages: 5, currentPage: 5 });
      renderWithProvider(mockStore);
      
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons[buttons.length - 1];
      
      expect(nextButton).toHaveClass('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
    });
  });
});