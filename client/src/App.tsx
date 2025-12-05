import { useEffect, useState } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Home from "./pages/Home"
import Offer from "./pages/Offers"
import SecondaryLayout from "./layouts/SecondaryLayout"
import Order from "./pages/Order"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "./store/store"
import { createUser, fetchUser } from "./store/features/userSlice"
import Orders from "./pages/Orders"
import Profile from "./pages/Profile"
import ReferralInfo from "./pages/ReferralInfo"
import Statistics from "./pages/Statistics"
import Withdrawals from "./pages/Withdrawals"
import { Reviews } from "./pages/Reviews"
import Chat from "./pages/Chat"
import PurchaseForm from "./pages/PurchaseForm"
import { About } from "./pages/About"
import { useTranslation } from "react-i18next"
import OrientationWarning from "./components/OrientationWarning"
import ReviewForm from "./pages/ReviewForm"

const App = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { i18n } = useTranslation()

  const isAuth = useSelector((state: RootState) => state.user.isAuth)
  const user = useSelector((state: RootState) => state.user.user)
  const loading = useSelector((state: RootState) => state.user.loading)

  const [isTelegram, setIsTelegram] = useState(false)
  const [userCreated, setUserCreated] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp
      if (tg) {
        tg.ready?.()
        tg.expand?.()
        setIsTelegram(true)
        dispatch(fetchUser())
      }
    }
  }, [dispatch])

  useEffect(() => {
    if (isTelegram) {
      if (user) {
        i18n.changeLanguage(user.language)
      } else if (!userCreated) {
        dispatch(createUser())
        setUserCreated(true)
      }
    }
  }, [user, isTelegram, userCreated, dispatch, i18n])

  if (!window.Telegram?.WebApp?.initData && import.meta.env.VITE_NODE_ENV === 'production') {
    return <div className="text-white">Please open this app via Telegram</div>
  }

  if (loading && import.meta.env.VITE_NODE_ENV === 'production') {
    return <div className="text-white">Загрузка...</div>
  }

  if (!isAuth && import.meta.env.VITE_NODE_ENV === 'production') {
    return <div className="text-white">Unauthorized</div>
  }

  if (user?.isBanned && import.meta.env.VITE_NODE_ENV === 'production') {
    return <div className="text-white">❌ Доступ к магазину запрещён.</div>
  }

  return (
    <>
      {import.meta.env.VITE_NODE_ENV !== 'production' && <OrientationWarning />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/games" element={<Home />} />
          </Route>
          <Route path="/games/:gameId/offers/:offerId/order" element={<SecondaryLayout />}>
            <Route index element={<Order />} />
          </Route>
          <Route path="/chat" element={<SecondaryLayout />}>
            <Route index element={<Chat />} />
          </Route>
          <Route path="/offers" element={<SecondaryLayout />}>
            <Route path=":gameId" element={<Offer />} />
          </Route>
          <Route path="/orders" element={<SecondaryLayout />}>
            <Route index element={<Orders />} />
          </Route>
          <Route path="/profile" element={<SecondaryLayout />}>
            <Route index element={<Profile />} />
          </Route>
          <Route path="/referral-info" element={<SecondaryLayout />}>
            <Route index element={<ReferralInfo />} />
          </Route>
          <Route path="/statistics" element={<SecondaryLayout />}>
            <Route index element={<Statistics />} />
          </Route>
          <Route path="/withdrawals" element={<SecondaryLayout />}>
            <Route index element={<Withdrawals />} />
          </Route>
          <Route path="/reviews" element={<SecondaryLayout />}>
            <Route index element={<Reviews />} />
          </Route>
          <Route path="/purchase-form/:orderId" element={<SecondaryLayout />}>
            <Route index element={<PurchaseForm />} />
          </Route>
          <Route path="/review/:orderId" element={<SecondaryLayout />}>
            <Route index element={<ReviewForm />} />
          </Route>
          <Route path="/about" element={<SecondaryLayout />}>
            <Route index element={<About />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
