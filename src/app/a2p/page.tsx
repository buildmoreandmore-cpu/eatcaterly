import Header from '../../components/landing/Header'
import A2PHero from '../../components/a2p/A2PHero'
import ComplianceRequirements from '../../components/a2p/ComplianceRequirements'
import RegistrationProcess from '../../components/a2p/RegistrationProcess'
import ComplianceBenefits from '../../components/a2p/ComplianceBenefits'
import A2PFAQ from '../../components/a2p/A2PFAQ'
import Footer from '../../components/landing/Footer'

export const metadata = {
  title: 'A2P Compliance - EatCaterly | Compliant SMS Service for Food Businesses',
  description: 'EatCaterly provides A2P-compliant phone numbers and handles all SMS compliance requirements. Professional messaging service without the hassle.'
}

export default function A2PPage() {
  return (
    <div>
      <Header />
      <A2PHero />
      <ComplianceRequirements />
      <RegistrationProcess />
      <ComplianceBenefits />
      <A2PFAQ />
      <Footer />
    </div>
  )
}