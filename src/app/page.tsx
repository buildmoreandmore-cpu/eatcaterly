import Header from '../components/landing/Header'
import Hero from '../components/landing/Hero'
import TrustedBy from '../components/landing/TrustedBy'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import Testimonials from '../components/landing/Testimonials'
import Pricing from '../components/landing/Pricing'
import FAQ from '../components/landing/FAQ'
import Footer from '../components/landing/Footer'

export const metadata = {
  title: 'EatCaterly - Catering. Made simple.',
  description: 'The platform that lets chefs, caterers, and food businesses share daily menus, send them by text, and accept payments. Transform how you connect with customers.'
}

export default function Home() {
  return (
    <div data-testid="home-page">
      <Header />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  )
}