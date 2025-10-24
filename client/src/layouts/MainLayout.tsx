import Header from '../components/Header'
import Footer from '../components/Footer'
import { Outlet } from 'react-router-dom'
import { useState } from 'react';
import {useDispatch} from "react-redux";
import type {AppDispatch} from "../store/store.ts";
import {updateLanguage} from "../store/features/userSlice.ts";

const MainLayout = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [cardsPerRow, setCardsPerRow] = useState(3);

  const changeLanguage = async (lang: 'ru' | 'en') => {
    await dispatch(updateLanguage(lang));
  };
  
  return (
    <div className='flex flex-col h-screen'>
      <Header onChangeCardsPerRow={setCardsPerRow} onChangeLanguage={changeLanguage} />
      <main className='flex justify-center w-full flex-grow overflow-y-auto'>
        <Outlet context={{cardsPerRow}} />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
