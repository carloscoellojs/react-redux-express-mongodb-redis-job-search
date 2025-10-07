import { useDispatch, useSelector } from "react-redux"
import { Spinner } from "../../components/Spinner/Spinner";
import { CardJobDetail } from "../../components/Card";
import { useEffect } from "react";
import type { AppDispatch } from "../../store";
import { fetchJobDetail, startFetchingJobDetail } from "../../store/actions/jobsActions";

export const JobDetail = () => {
  const jobs = useSelector((state: any) => state.jobs);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
      if(!jobs.jobsTitlesList.length) return;
      dispatch(startFetchingJobDetail());
      dispatch(fetchJobDetail(jobs.jobsTitlesList[0].id));
    }, [jobs.jobsTitlesList]);

  if(jobs.fetchingJobDetail) {
    return <Spinner message="Loading job details..." />
  }

  return (
    <div className="job-detail-container">
      {jobs.jobDetail ? <CardJobDetail {...jobs.jobDetail} /> : null}
    </div>
  )
}