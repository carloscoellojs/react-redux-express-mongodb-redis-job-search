import { Pagination } from "../containers/Pagination/Pagination";
import type { MainLayoutProps } from "../types/types";

export const MainLayout = ({ Top, Left, Right, Bottom }: MainLayoutProps) => {
  return (
    <div className="main-layout h-screen flex flex-col">
      <header className="header flex-shrink-0 flex flex-col items-center justify-center text-center my-10">
        <h1>Job Search App</h1>
        {Top}
      </header>
      <main className="content flex flex-1 min-h-0 max-w-7xl mx-auto w-full my-5">
        <div className="left w-[30%] overflow-y-auto overflow-x-hidden">{Left}</div>
        <div className="right flex-1 overflow-y-auto overflow-x-hidden">{Right}</div>
      </main>
       <Pagination />
      <footer className="footer bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div className="mb-4 sm:mb-0">
            {Bottom}
          </div>
          <div className="text-sm text-blue-100">
            2025 Job Search App
          </div>
        </div>
      </footer>
    </div>
  );
}