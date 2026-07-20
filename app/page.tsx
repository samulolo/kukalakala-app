import Navigation from "@/components/landing/Navigation"
import HeroSection from "@/components/landing/HeroSection"
import FeaturesSection from "@/components/landing/FeaturesSection"
import VagasSection from "@/components/landing/VagasSection"
import UserTypeSection from "@/components/landing/UserTypeSection"
import CandidateIllustration from "@/components/landing/CandidateIllustration"
import CompanyIllustration from "@/components/landing/CompanyIllustration"
import HowItWorksSection from "@/components/landing/HowItWorksSection"
import CTASection from "@/components/landing/CTASection"
import Footer from "@/components/landing/Footer"

export default function Home() {
    const candidateBenefits = [
        {
            title: "Feedback de IA em cada candidatura",
            description: "Vê o teu score de compatibilidade, pontos fortes e fracos, e o que podes melhorar no teu perfil"
        },
        {
            title: "Perfil Profissional",
            description: "Crie um perfil completo, com CV, e seja descoberto pelas empresas"
        },
        {
            title: "Alertas de Vagas por Email",
            description: "Cria um alerta com os teus critérios e recebe um email assim que surgir uma vaga nova que combine contigo"
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
            title: "Análise de IA por Candidatura",
            description: "Cada candidatura vem com um score de compatibilidade gerado por IA, com base no perfil e CV do candidato"
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
                description="Explore oportunidades de carreira e recebe feedback de IA em cada candidatura. Construa a sua carreira com a Kukalakala."
                benefits={candidateBenefits}
                ctaText="Começar como Candidato"
                ctaLink="/auth/login?type=candidate"
                illustration={<CandidateIllustration />}
                caption="Seu Próximo Desafio"
            />
            <UserTypeSection
                type="company"
                title="Recrute os melhores talentos"
                description="Receba um score de compatibilidade gerado por IA em cada candidatura e encontre o ajuste perfeito para a sua equipa, mais rápido."
                benefits={companyBenefits}
                ctaText="Começar como Empresa"
                ctaLink="/auth/register?type=company"
                illustration={<CompanyIllustration />}
                caption="Seus Próximos Talentos"
            />
            <HowItWorksSection />
            <CTASection />
            <Footer />
        </div>
    )
}
