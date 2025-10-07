import { MainLayout } from './layout/MainLayout'
import { Search } from './containers/Search/Search'
import { JobsTitles } from './containers/JobsTitles/JobsTitles'
import { JobDetail } from './containers/JobDetail/JobDetail'
import './App.css'

function App() {

  return (
    <>
      <MainLayout
        Top={<Search />}
        Left={<JobsTitles />}
        Right={<JobDetail />}
        Bottom={<div>Footer content</div>}
      />
    </>
  )
}

export default App
