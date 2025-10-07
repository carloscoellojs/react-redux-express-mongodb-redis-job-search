import type { CardJobTitleProps } from "../../types/types";

export const CardJobTitle = ({
  title,
  company,
  location,
  creationDate,
  onClick
}: CardJobTitleProps) => (
  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 mb-4 border border-gray-200 cursor-pointer hover:border-blue-300" onClick={onClick}>
    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{title}</h3>
    <div className="space-y-2">
      <p className="text-md font-medium text-blue-600">{company}</p>
      <p className="text-sm text-gray-600 flex items-center">
        <span className="inline-block w-4 h-4 mr-2">📍</span>
        {location}
      </p>
      <p className="text-xs text-gray-500 mt-3">
        Posted: {creationDate}
      </p>
    </div>
  </div>
);
