import type { Metadata } from "next"
import LegalPageLayout from "@/components/legal/LegalPageLayout"

export const metadata: Metadata = {
    title: "Política de Privacidade",
    description: "Como a Kukalakala recolhe, usa e protege os teus dados pessoais.",
    alternates: { canonical: "/privacidade" }
}

const SUPPORT_EMAIL = "contato@kukalakala.com"

export default function PrivacyPolicyPage() {
    return (
        <LegalPageLayout title="Política de Privacidade" lastUpdated="17 de julho de 2026">
            <section>
                <h2>1. Quem somos</h2>
                <p>
                    A Kukalakala é uma plataforma online que liga candidatos a emprego e empresas que
                    procuram contratar. Esta política explica que dados pessoais recolhemos, para que
                    servem, com quem os partilhamos e que direitos tens sobre eles.
                </p>
            </section>

            <section>
                <h2>2. Dados que recolhemos</h2>
                <p>Consoante o tipo de conta, podemos recolher:</p>
                <ul>
                    <li><strong>Dados de conta</strong>: email e nome, obtidos diretamente ou através do fornecedor de login social (Google ou LinkedIn) quando escolhes entrar dessa forma.</li>
                    <li><strong>Perfil de candidato</strong>: nome completo, título profissional, localização, telefone, biografia, nível de experiência, competências e o teu currículo (ficheiro CV).</li>
                    <li><strong>Perfil de empresa</strong>: nome da empresa, website, setor de atividade, descrição, localização e código postal.</li>
                    <li><strong>Candidaturas e favoritos</strong>: vagas a que te candidataste, estado de cada candidatura e vagas que guardaste.</li>
                    <li><strong>Mensagens</strong>: conteúdo das mensagens trocadas entre candidato e empresa no âmbito de uma candidatura.</li>
                    <li><strong>Notificações</strong>: registo das notificações enviadas dentro da plataforma e por email.</li>
                    <li><strong>Dados técnicos</strong>: cookies de sessão e autenticação, endereço IP e tipo de navegador, usados para manter a sessão iniciada e proteger a plataforma.</li>
                </ul>
            </section>

            <section>
                <h2>3. Como recolhemos os dados</h2>
                <p>
                    A maioria dos dados é inserida diretamente por ti nos formulários da plataforma. Se
                    optares por iniciar sessão com Google ou LinkedIn, recebemos do respetivo fornecedor
                    o nome, email e, quando disponível, a fotografia de perfil associados à tua conta
                    nesses serviços.
                </p>
            </section>

            <section>
                <h2>4. Para que usamos os teus dados</h2>
                <ul>
                    <li>Criar, autenticar e gerir a tua conta.</li>
                    <li>Ligar candidatos a vagas relevantes e empresas a candidatos qualificados.</li>
                    <li>Processar candidaturas e permitir a comunicação entre candidato e empresa.</li>
                    <li>Enviar notificações relevantes, dentro da app e por email, sobre candidaturas, alterações de estado e novas mensagens.</li>
                    <li>Manter, proteger e melhorar o funcionamento da plataforma.</li>
                </ul>
            </section>

            <section>
                <h2>5. Com quem partilhamos os teus dados</h2>
                <p>
                    <strong>Entre candidato e empresa:</strong> quando te candidatas a uma vaga, a empresa
                    responsável por essa vaga passa a ter acesso ao teu perfil e currículo, apenas no
                    âmbito dessa candidatura. O candidato vê os dados públicos da empresa que publicou a
                    vaga.
                </p>
                <p>
                    <strong>Prestadores de serviços:</strong> usamos fornecedores que processam dados em
                    nosso nome, sujeitos a obrigações de confidencialidade e segurança:
                </p>
                <ul>
                    <li>Supabase — base de dados, autenticação e armazenamento de ficheiros (incluindo CVs).</li>
                    <li>Resend — envio de emails transacionais (confirmações, notificações de candidatura e mensagens).</li>
                    <li>Google e LinkedIn — autenticação, apenas se escolheres iniciar sessão através destes serviços.</li>
                </ul>
                <p>Não vendemos os teus dados pessoais a terceiros nem os usamos para publicidade.</p>
            </section>

            <section>
                <h2>6. Armazenamento e segurança</h2>
                <p>
                    Os currículos são guardados num espaço de armazenamento privado, com acesso restrito
                    apenas a ti e às empresas às quais te candidataste. As ligações à plataforma são
                    feitas por HTTPS e as passwords das contas de empresa são geridas pelo nosso
                    fornecedor de autenticação, nunca guardadas em texto simples pela Kukalakala.
                </p>
            </section>

            <section>
                <h2>7. Retenção de dados</h2>
                <p>
                    Mantemos os teus dados enquanto a tua conta estiver ativa. Podes pedir a eliminação
                    da tua conta e dos dados associados a qualquer momento, exceto quando formos
                    obrigados a reter alguma informação por motivos legais.
                </p>
            </section>

            <section>
                <h2>8. Os teus direitos</h2>
                <p>
                    Podes, a qualquer momento, pedir acesso, retificação, apagamento ou portabilidade dos
                    teus dados, bem como opor-te ou pedir a limitação do respetivo tratamento. Para
                    exercer qualquer um destes direitos, contacta-nos através de{" "}
                    <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Tens também o direito de
                    apresentar reclamação junto da autoridade de proteção de dados competente.
                </p>
            </section>

            <section id="cookies">
                <h2>9. Cookies</h2>
                <p>
                    Usamos apenas cookies estritamente necessários para manter a tua sessão autenticada,
                    geridos pelo nosso fornecedor de autenticação. Atualmente não usamos cookies de
                    publicidade nem de rastreio de terceiros.
                </p>
            </section>

            <section>
                <h2>10. Transferências internacionais</h2>
                <p>
                    Alguns dos nossos fornecedores podem processar dados em servidores localizados fora
                    do teu país de residência. Nestes casos, procuramos assegurar que aplicam medidas de
                    segurança e confidencialidade adequadas à proteção dos teus dados.
                </p>
            </section>

            <section>
                <h2>11. Menores</h2>
                <p>
                    A Kukalakala destina-se a maiores de 16 anos. Não recolhemos intencionalmente dados
                    pessoais de menores desta idade.
                </p>
            </section>

            <section>
                <h2>12. Alterações a esta política</h2>
                <p>
                    Podemos atualizar esta política periodicamente. Sempre que isso acontecer,
                    publicaremos a versão revista nesta página com uma nova data de atualização.
                </p>
            </section>

            <section>
                <h2>13. Contacto</h2>
                <p>
                    Para questões sobre esta política ou sobre os teus dados pessoais, escreve para{" "}
                    <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
                </p>
            </section>
        </LegalPageLayout>
    )
}
