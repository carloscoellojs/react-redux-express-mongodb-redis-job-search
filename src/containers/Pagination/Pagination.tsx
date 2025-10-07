import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store";
import { fetchJobsTitlesList, startFetchingTitlesList } from "../../store/actions/jobsActions";

export const Pagination = () => {
    const pagination = useSelector((state: any) => state.jobs.pagination);
    const dispatch: AppDispatch = useDispatch();

    if(pagination.totalPages <= 1) return null;

    const { currentPage, totalPages } = pagination;

    // Handle page navigation
    const handlePageChange = (pageNumber: number) => {
        console.log('Navigating to page:', pageNumber);
        // TODO: Dispatch action to change page
        dispatch(startFetchingTitlesList());
        dispatch(fetchJobsTitlesList(pageNumber, pagination.keyword));
    };

    // Generate array of page numbers to display
    const getPageNumbers = () => {
        const delta = 2; // Number of pages to show around current page
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const pageNumbers = totalPages > 1 ? getPageNumbers() : [];
    
  return (
    <div className="pagination-container flex items-center justify-center mt-8 mb-4">
        <nav className="flex items-center space-x-1">
            {/* Previous Button */}
            <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300'
                }`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
                {pageNumbers.map((pageNum, index) => (
                    <span key={index}>
                        {pageNum === '...' ? (
                            <span className="px-3 py-2 text-gray-500">...</span>
                        ) : (
                            <button
                                onClick={() => handlePageChange(pageNum as number)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    pageNum === currentPage
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                                }`}
                            >
                                {pageNum}
                            </button>
                        )}
                    </span>
                ))}
            </div>

            {/* Next Button */}
            <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300'
                }`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </nav>
    </div>
  );
}