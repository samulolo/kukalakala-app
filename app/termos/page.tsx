import type { Metadata } from "next"
import LegalPageLayout from "@/components/legal/LegalPageLayout"

export const metadata: Metadata = {
    title: "Termos de Serviço",
    description: "Regras de utilização da plataforma Kukalakala para candidatos e empresas.",
    alternates: { canonical: "/termos" }
}

const SUPPORT_EMAIL = "suporte@kukalakala.com"

export default function TermsOfServicePage() {
    return (
        <LegalPageLayout title="Termos de Serviço" lastUpdated="17 de julho de 2026">
            <section>
                <h2>1. Aceitação dos termos</h2>
                <p>
                    Ao criar uma conta ou utilizar a Kukalakala, aceitas estes Termos de Serviço e a
                    nossa <a href="/privacidade">Política de Privacidade</a>. Se não concordares com
                    algum destes termos, não deves utilizar a plataforma.
                </p>
            </section>

            <section>
                <h2>2. O que é a Kukalakala</h2>
                <p>
                    A Kukalakala é uma plataforma que liga candidatos a emprego e empresas que procuram
                    contratar. Disponibilizamos o espaço e as ferramentas para publicar vagas, candidatar-se
                    a elas e comunicar durante o processo — mas não somos parte na relação de trabalho
                    que possa resultar dessa ligação, nem garantimos que qualquer candidatura resulte em
                    contratação.
                </p>
            </section>

            <section>
                <h2>3. Contas e elegibilidade</h2>
                <ul>
                    <li>Precisas de ter pelo menos 16 anos para criar uma conta.</li>
                    <li>Candidatos entram através de login social (Google ou LinkedIn); empresas registam-se com email e password.</li>
                    <li>És responsável por manter a confidencialidade das tuas credenciais de acesso e por toda a atividade realizada através da tua conta.</li>
                    <li>As informações fornecidas no registo e no perfil devem ser verdadeiras e mantidas atualizadas.</li>
                </ul>
            </section>

            <section>
                <h2>4. Conduta na plataforma</h2>
                <p>Ao usar a Kukalakala, comprometes-te a não:</p>
                <ul>
                    <li>Publicar informação falsa, enganosa ou fazer-te passar por outra pessoa ou empresa.</li>
                    <li>Publicar vagas discriminatórias, ilegais ou que violem direitos de terceiros.</li>
                    <li>Enviar spam, mensagens abusivas ou conteúdo ofensivo através da plataforma.</li>
                    <li>Recolher dados de outros utilizadores (candidatos, empresas ou vagas) por meios automatizados (scraping) fora do uso normal da plataforma.</li>
                    <li>Tentar aceder a contas ou dados que não te pertencem, ou comprometer a segurança da plataforma.</li>
                </ul>
                <p>
                    Podemos remover conteúdo ou suspender contas que violem estas regras.
                </p>
            </section>

            <section>
                <h2>5. Conteúdo que publicas</h2>
                <p>
                    Manténs a titularidade do conteúdo que publicas (perfil, currículo, descrições de
                    vagas, mensagens). Ao publicá-lo na Kukalakala, concedes-nos uma licença não
                    exclusiva para o armazenar, apresentar e partilhar com as contrapartes relevantes
                    (por exemplo, mostrar o teu perfil e CV à empresa a que te candidataste), na medida
                    necessária para o funcionamento da plataforma.
                </p>
            </section>

            <section>
                <h2>6. Candidaturas e vagas</h2>
                <p>
                    Cada candidato pode candidatar-se uma única vez à mesma vaga. As empresas são as
                    únicas responsáveis pela veracidade, legalidade e atualidade das vagas que publicam,
                    bem como pelas decisões tomadas durante o processo de recrutamento. A Kukalakala não
                    participa nem interfere nessas decisões.
                </p>
            </section>

            <section>
                <h2>7. Propriedade intelectual</h2>
                <p>
                    A marca Kukalakala, o design e o código da plataforma são propriedade da Kukalakala
                    ou dos seus licenciadores. Não podes copiar, modificar ou distribuir estes elementos
                    sem autorização prévia.
                </p>
            </section>

            <section>
                <h2>8. Isenção de garantias</h2>
                <p>
                    A plataforma é disponibilizada &ldquo;tal como está&rdquo;, sem garantias de que
                    estará sempre disponível, livre de erros ou de que resultará numa contratação ou
                    candidatura bem-sucedida. Fazemos esforços razoáveis para manter o serviço fiável e
                    seguro, mas não podemos garantir um funcionamento ininterrupto.
                </p>
            </section>

            <section>
                <h2>9. Limitação de responsabilidade</h2>
                <p>
                    Na máxima medida permitida por lei, a Kukalakala não é responsável por decisões de
                    contratação, pela veracidade de informação publicada por outros utilizadores, nem por
                    danos indiretos resultantes do uso da plataforma.
                </p>
            </section>

            <section>
                <h2>10. Suspensão e encerramento de conta</h2>
                <p>
                    Podes encerrar a tua conta a qualquer momento. Podemos suspender ou encerrar contas
                    que violem estes termos, mediante aviso quando razoavelmente possível.
                </p>
            </section>

            <section>
                <h2>11. Alterações aos termos</h2>
                <p>
                    Podemos atualizar estes termos periodicamente. Alterações significativas serão
                    comunicadas através da plataforma ou por email, com a data de atualização revista
                    nesta página.
                </p>
            </section>

            <section>
                <h2>12. Lei aplicável</h2>
                <p>
                    Estes termos são regidos pela lei aplicável na jurisdição onde a Kukalakala está
                    estabelecida, sem prejuízo de direitos imperativos que te sejam garantidos pela
                    legislação do teu país de residência.
                </p>
            </section>

            <section>
                <h2>13. Contacto</h2>
                <p>
                    Para dúvidas sobre estes Termos de Serviço, escreve para{" "}
                    <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
                </p>
            </section>
        </LegalPageLayout>
    )
}
