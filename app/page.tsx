import Navigation from "@/components/landing/Navigation"
import HeroSection from "@/components/landing/HeroSection"
import FeaturesSection from "@/components/landing/FeaturesSection"
import VagasSection from "@/components/landing/VagasSection"
import UserTypeSection from "@/components/landing/UserTypeSection"
import CandidateIllustration from "@/components/landing/CandidateIllustration"
import CompanyIllustration from "@/components/landing/CompanyIllustration"
import HowItWorksSection from "@/components/landing/HowItWorksSection"
import StatsSection from "@/components/landing/StatsSection"
import CTASection from "@/components/landing/CTASection"
import Footer from "@/components/landing/Footer"

export default function Home() {
    const candidateBenefits = [
        {
            title: "Vagas Verificadas",
            description: "Todas as empresas são verificadas e confiáveis"
        },
        {
            title: "Perfil Profissional",
            description: "Crie um perfil impressionante e seja descoberto"
        },
        {
            title: "Notificações Personalizadas",
            description: "Receba alertas sobre vagas que combinam com você"
        }
    ]

    const companyBenefits = [
        {
            title: "Publicar Vagas",
            description: "Crie e publique vagas em minutos"
        },
        {
            title: "Dashboard Intuitivo",
            description: "Gerencie candidatos num único lugar"
        },
        {
            title: "Recrutamento Eficiente",
            description: "Encontre candidatos qualificados rapidamente"
        }
    ]

    return (
        <div className="bg-white">
            <Navigation />
            <HeroSection />
            <FeaturesSection />
            <VagasSection />
            <UserTypeSection
                type="candidate"
                title="Encontre seu próximo desafio"
                description="Explore milhares de oportunidades de carreira com empresas líderes. Construa sua carreira com a Kukalakala."
                benefits={candidateBenefits}
                ctaText="Começar como Candidato"
                ctaLink="/auth/login?type=candidate"
                illustration={<CandidateIllustration />}
                caption="Seu Próximo Desafio"
            />
            <UserTypeSection
                type="company"
                title="Recrute os melhores talentos"
                description="Acesse um pool de candidatos qualificados e encontre o ajuste perfeito para sua equipe. Crescer é mais fácil com Kukalakala."
                benefits={companyBenefits}
                ctaText="Começar como Empresa"
                ctaLink="/auth/register?type=company"
                illustration={<CompanyIllustration />}
                caption="Seus Próximos Talentos"
            />
            <HowItWorksSection />
            <StatsSection />
            <CTASection />
            <Footer />
        </div>
    )
}
