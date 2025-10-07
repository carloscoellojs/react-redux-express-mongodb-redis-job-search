import { useDispatch, useSelector } from "react-redux"
import { CardJobTitle } from "../../components/Card";
import { Spinner } from "../../components/Spinner/Spinner";
import type { AppDispatch } from "../../store";
import { fetchJobDetail, startFetchingJobDetail } from "../../store/actions/jobsActions";

export const JobsTitles = () => {
  const jobs = useSelector((state: any) => state.jobs);
  const dispatch: AppDispatch = useDispatch();

  const onClickCard = (id: string) => {
    console.log("Card clicked with id:", id);
    dispatch(startFetchingJobDetail());
    dispatch(fetchJobDetail(Number(id)));
  }

  if(jobs.fetchingTitlesList) {
    return <Spinner message="Loading job titles..." />
  }
  
  return (
    <div className="jobs-titles-container">
      {jobs.jobsTitlesList?.length ? jobs.jobsTitlesList.map(
        (job: { id: string; title: string; company: string; location: string; creationDate: string; }) => (
          <CardJobTitle 
            key={job.id}
            title={job.title}
            company={job.company}
            location={job.location}
            creationDate={job.creationDate}
            onClick={() => onClickCard(job.id)}
          />
        )
      ) : null}
    </div>
  )
}  