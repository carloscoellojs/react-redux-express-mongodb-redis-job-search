import { useEffect, useState } from "react";
import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store";
import {
  fetchJobsTitlesList,
  startFetchingTitlesList
} from "../../store/actions/jobsActions";
import { Notification } from "../../components/Notification/Notification";

export const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const jobs = useSelector((state: any) => state.jobs);
  const dispatch: AppDispatch = useDispatch();

  const onChangeSearchTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const onClickSearch = () => {
    dispatch(startFetchingTitlesList());
    dispatch(fetchJobsTitlesList(1, searchTerm.trim()));
  };

  useEffect(() => {
    if (!jobs.jobsTitlesList.length) {
      dispatch(startFetchingTitlesList());
      dispatch(fetchJobsTitlesList());
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1">
          <Input
            type="text"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-700 placeholder-gray-400"
            onChange={onChangeSearchTerm}
            placeholder="Search for jobs by job title (software engineer or Accountant) or city (Austin or Dallas)"
            value={searchTerm}
          />
        </div>
        <div className="flex-shrink-0">
          <Button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClickSearch}
            disabled={jobs.fetchingTitlesList}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Search</span>
          </Button>
        </div>
      </div>
      {jobs.notification.info && (
        <Notification message={jobs.notification.info} />
      )}
    </div>
  );
};
