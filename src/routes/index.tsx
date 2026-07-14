import { Routes, Route } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AdminLayout from '../layouts/AdminLayout'
import ClientLayout from '../layouts/ClientLayout'
import AuthGuard from '../guards/AuthGuard'
import Landing from '../pages/public/Landing'
import Services from '../pages/public/Services'
import Portfolio from '../pages/public/Portfolio'
import About from '../pages/public/About'
import Contact from '../pages/public/Contact'
import QuoteRequest from '../pages/public/QuoteRequest'
import Login from '../pages/Login'
import Activation from '../pages/Activation'
import AdminDashboard from '../pages/admin/Dashboard'
import Contacts from '../pages/admin/Contacts'
import GalleryList from '../pages/admin/galleries/List'
import GalleryForm from '../pages/admin/galleries/Form'
import GalleryDetail from '../pages/admin/galleries/Detail'
import GalleryUpload from '../pages/admin/galleries/Upload'
import ClientList from '../pages/admin/clients/List'
import ClientDetail from '../pages/admin/clients/Detail'
import ClientForm from '../pages/admin/clients/Form'
import ClientDashboard from '../pages/client/Dashboard'
import ClientGalleryView from '../pages/client/GalleryView'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/services" element={<Services />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/quote-request" element={<QuoteRequest />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/activate" element={<Activation />} />

      {/* Admin routes — photographer only */}
      <Route element={<AuthGuard expectedRole="photographer" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/contacts" element={<Contacts />} />
          <Route path="/admin/galleries" element={<GalleryList />} />
          <Route path="/admin/galleries/new" element={<GalleryForm />} />
          <Route path="/admin/galleries/:id/edit" element={<GalleryForm />} />
          <Route path="/admin/galleries/:id" element={<GalleryDetail />} />
          <Route path="/admin/galleries/:id/upload" element={<GalleryUpload />} />
          <Route path="/admin/clients" element={<ClientList />} />
          <Route path="/admin/clients/new" element={<ClientForm />} />
          <Route path="/admin/clients/:id" element={<ClientDetail />} />
          <Route path="/admin/clients/:id/edit" element={<ClientForm />} />
        </Route>
      </Route>

      {/* Client routes */}
      <Route element={<AuthGuard expectedRole="client" />}>
        <Route element={<ClientLayout />}>
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/client/galleries/:id" element={<ClientGalleryView />} />
        </Route>
      </Route>
    </Routes>
  )
}
