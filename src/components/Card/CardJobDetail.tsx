import type { CardJobDetailProps } from "../../types/types";

export const CardJobDetail = ({
  jobId,
  type,
  salary,
  skills,
  description,
  benefits,
  link,
  creationDate,
  _retrievalInfo
}: CardJobDetailProps) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 max-w-2xl mx-auto border border-gray-100">
    {/* Header Section */}
    <div className="border-b border-gray-200 pb-4 mb-6">
      <div className="flex justify-between items-start">
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          ID: {jobId}
        </span>
        <div className="text-right">
          <span className="text-xs text-gray-400 block">{creationDate}</span>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full mt-1 inline-block">
            {_retrievalInfo}
          </span>
        </div>
      </div>
    </div>

    {/* Job Type & Salary Section */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Job Type</h4>
        <p className="text-blue-700 font-medium">{type}</p>
      </div>
      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-green-800 mb-2">Salary</h4>
        <p className="text-green-700 font-medium text-lg">{salary}</p>
      </div>
    </div>

    {/* Description Section */}
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
        Job Description
      </h4>
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-700 leading-relaxed">{description}</p>
      </div>
    </div>

    {/* Skills Section */}
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
        <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
        Required Skills
      </h4>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full border border-indigo-200"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>

    {/* Benefits Section */}
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
        Benefits
      </h4>
      <div className="bg-emerald-50 rounded-lg p-4">
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="text-emerald-700 flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3"></span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Apply Button Section */}
    <div className="pt-4 border-t border-gray-200">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
      >
        <span>Apply for this Position</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  </div>
);
