import Footer from '../components/Footer'
import { Outlet } from 'react-router-dom'
import SwitchGamesPanel from '../components/SwitchGamesPanel'

const SecondaryLayout = () => {
  return (
    <div className='flex flex-col h-screen'>
      <SwitchGamesPanel />
      <main className='flex justify-center w-full h-screen flex-grow overflow-y-hidden'>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default SecondaryLayout
