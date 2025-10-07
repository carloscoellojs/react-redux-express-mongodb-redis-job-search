export type JobTitle = {
  id: string;
  title: string;
  company: string;
  location: string;
  creationDate: string;
};

export type JobTitleAPIResponse = {
  titles: JobTitle[];
  pagination: Pagination
};

export type JobDetail = {
  jobId: number;
  type: string;
  salary: string;
  skills: string[];
  description: string;
  benefits: string[];
  link: string;
  creationDate: string;
};

export type JobDetailOrNull = JobDetail | null;

export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  keyword: string;
};

export type JobsState = {
  jobsTitlesList: JobTitle[];
  jobDetail: JobDetail | null;
  fetchingTitlesList: boolean;
  fetchingJobDetail: boolean;
  pagination: Pagination;
  message: { error: string; };
  notification: { info: string; };
};

export type InputProps = {
  id?: string;
  type: string;
  name?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  value: string;
};

export type ButtonProps = {
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void;
  hidden?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
};

export type CardJobTitleProps = {
  title: string;
  company: string;
  location: string;
  creationDate: string;
  onClick?: () => void;
};

export type CardJobDetailProps = {
  jobId: number;
  type: string;
  salary: string;
  skills: string[];
  description: string;
  benefits: string[];
  link: string;
  creationDate: string;
  _retrievalInfo?: string;
};

export type MainLayoutProps = {
  Top: React.ReactNode;
  Left: React.ReactNode;
  Right: React.ReactNode;
  Bottom: React.ReactNode;
};

export type SpinnerProps = {
  message?: string;
}