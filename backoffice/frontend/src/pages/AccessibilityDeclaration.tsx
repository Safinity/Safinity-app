import styled from 'styled-components';
import { Colors, Spacing } from '../theme/theme';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${Spacing.margemLateral}px ${Spacing.md}px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  line-height: 1.8;
  color: ${Colors.palette.neutral.neutral100};
  background-color: ${Colors.background};

  h1 {
    margin-top: ${Spacing.lg}px;
    margin-bottom: ${Spacing.md}px;
    font-size: 28px;
    font-weight: 600;
    color: ${Colors.primary_50};
  }

  h2 {
    margin-top: ${Spacing.lg}px;
    margin-bottom: ${Spacing.md}px;
    font-size: 20px;
    font-weight: 600;
    color: ${Colors.primary_50};
  }

  p {
    margin-bottom: ${Spacing.md}px;
    text-align: justify;
    font-weight: 400;
  }

  ol {
    margin-left: ${Spacing.lg}px;
    margin-bottom: ${Spacing.md}px;

    li {
      margin-bottom: ${Spacing.md}px;
      padding-left: ${Spacing.md}px;

      strong {
        font-weight: 600;
        color: ${Colors.primary_50};
      }

      ul {
        margin-top: ${Spacing.sm}px;
        margin-left: ${Spacing.lg}px;
        margin-bottom: ${Spacing.sm}px;

        li {
          margin-bottom: ${Spacing.sm}px;
          list-style-type: disc;
          color: ${Colors.palette.neutral.neutral100};
        }
      }
    }
  }

  a {
    color: ${Colors.palette.secondary.icyBlue};
    text-decoration: none;
    font-weight: 500;
    border-bottom: 2px solid ${Colors.palette.secondary.icyBlue};
    transition: all 0.3s ease;

    &:hover {
      color: ${Colors.palette.secondary.turquoise};
      border-bottom-color: ${Colors.palette.secondary.turquoise};
    }

    &:focus {
      outline: 2px solid ${Colors.primary};
      outline-offset: 2px;
    }
  }
`;

export default function AccessibilityDeclaration() {
  return (
    <Container>
      <h1>Declaração de Acessibilidade: Safinity</h1>
      <p>
        A Safinity assume o compromisso de tornar o seu ecossistema digital, composto pelo
        <a href="https://safinity-backoffice.netlify.app/">site institucional</a> e
        <a href="https://expo.dev/accounts/beatriz-castros-organization/projects/frontend/builds/c752e86b-6fef-48db-838d-889502d13a6b">
          aplicação móvel
        </a>
        , acessível a todos os utilizadores. Este esforço de inclusão é pautado pelo cumprimento do
        Decreto-Lei n.º 83/2018, de 19 de outubro, que transpõe a Diretiva (UE) 2016/2102 do
        Parlamento Europeu e do Conselho, relativa à acessibilidade dos sítios Web e das aplicações
        móveis.
      </p>
      <h1>I. Estado de conformidade</h1>
      <p>
        O ecossistema Safinity encontra-se em processo de melhoria contínua, apresentando um estado
        de conformidade parcial com as diretrizes <strong>WCAG 2.2</strong>, nos níveis de sucesso{' '}
        <strong>A</strong> e <strong>AA</strong>. Esta conformidade é o resultado de um diagnóstico
        exaustivo que integrou avaliações automáticas, manuais, e testes com tecnologias de apoio.
      </p>
      <h1>II. Elaboração da presente declaração de acessibilidade</h1>
      <p>
        Esta declaração foi atualizada a 2026-04-19. <br />
        Em conformidade com o artigo 9º do Decreto-Lei n.º 83/2018, a monitorização do projeto
        seguiu os procedimentos técnicos estabelecidos. Foram realizadas as avaliações obrigatórias
        A) e B), tendo sido reforçadas pelas práticas recomendadas C) e D) para garantir uma análise
        mais abrangente.
      </p>
      <h2>A. Avaliações automáticas levadas a efeito:</h2>
      <ol>
        <li>
          (2026-04-01). <strong>Relatório: </strong>
          <a href="https://drive.google.com/file/d/1TFchHCRHuXNujHrJlx81uMQbWNPKqENA/view?usp=sharing">
            Monitorização WAVE
          </a>
          <ul>
            <li>
              <strong>Ferramenta utilizada:</strong> WAVE (Web Accessibility Evaluation Tool)
            </li>
            <li>
              <strong>Amostra:</strong> 2 páginas.
            </li>
            <li>
              <strong>Principais resultados (sumário):</strong> A utilização do WAVE permitiu uma
              validação imediata e sistemática da conformidade técnica. Foram detetados e corrigidos
              erros críticos de "Very Low Contrast", para garantir a legibilidade de acordo com os
              rácios das WCAG. A ferramenta expôs também a ausência de labels em campos de entrada e
              a existência de "Empty Buttons" (botões vazios), que foram solucionados com a
              implementação de aria-labels. Adicionalmente, corrigiram-se saltos na hierarquia de
              cabeçalhos (skipped headings) e definiram-se regiões estruturais (landmarks) para
              facilitar a navegação rápida por utilizadores de tecnologias de apoio.
            </li>
          </ul>
        </li>
        <li>
          (2026-04-01). <strong>Relatório: </strong>
          <a href="https://drive.google.com/file/d/1GVe8PCvBB02Iw6KkzTjqg27IpRs9FwAA/view?usp=sharing">
            Diagnóstico com Accessibility Scanner
          </a>
          <ul>
            <li>
              <strong>Ferramenta utilizada:</strong> Accessibility Scanner - App
            </li>
            <li>
              <strong>Amostra:</strong> 3 páginas.
            </li>
            <li>
              <strong>Principais resultados (sumário):</strong> A avaliação em ambiente nativo
              permitiu identificar barreiras de interação específicas do contexto móvel. Foram
              detetadas falhas críticas de ambiguidade em listas dinâmicas, onde os botões de ação
              repetidos careciam de descrições programáticas diferenciadas. O diagnóstico assinalou
              também problemas de "Touch Target Size", de forma a permitir o ajuste das áreas de
              toque para garantir a operabilidade aos utilizadores com limitações motoras.
              Adicionalmente, a ferramenta validou a necessidade de labels em componentes nativos,
              garantindo que a navegação via TalkBack fosse contextualizada e eficiente.
            </li>
          </ul>
        </li>
        <li>
          (2026-04-01). <strong>Relatório: </strong>
          <a href="https://drive.google.com/file/d/15yicXtV7oZrwzpTPLI386UODWiUcTw1I/view?usp=sharing">
            Auditoria Quantitativa com Lighthouse
          </a>
          <ul>
            <li>
              <strong>Ferramenta utilizada:</strong> Lighthouse (Chrome DevTools)
            </li>
            <li>
              <strong>Amostra:</strong> 2 páginas.
            </li>
            <li>
              <strong>Principais resultados (sumário):</strong> A auditoria permitiu aferir índices
              de maturidade entre os 86% e os 100%. Identificaram-se sucessos totais na
              implementação de listas dinâmicas acessíveis. Contudo, foram detetados problemas na
              hierarquia de conteúdos (Heading elements not in sequentially-descending order) em
              páginas de alertas e notificações, que podem desorientar a navegação assistida. A
              ferramenta reforçou também a necessidade crítica de incluir marcos principais (main
              landmarks) para otimizar a navegação rápida e a correção de rácios de contraste em
              elementos informativos, garantindo a conformidade com as "Best Practices" de
              desenvolvimento Web.
            </li>
          </ul>
        </li>
      </ol>
      <h2>B. Avaliações manuais levadas a efeito:</h2>
      <ol>
        <li>
          (2026-04-01). <strong>Relatório: </strong>
          <a href="https://drive.google.com/file/d/1Yy-meeUWS_Y6-dNOLzl6FUdTqjEgDNSC/view">
            Análise de Easy Checks
          </a>
          <ul>
            <li>
              <strong>Ferramenta utilizada:</strong> Easy Checks da WAI
            </li>
            <li>
              <strong>Amostra:</strong> 6 páginas.
            </li>
            <li>
              <strong>Principais resultados (sumário):</strong> O diagnóstico revelou barreiras
              críticas que comprometiam a autonomia do utilizador. Foram identificados erros de
              contraste em textos e ícones, bem como a ausência de labels em formulários e botões
              vazios sem alternativa textual. A análise detetou ainda a falta de uma estrutura
              hierárquica de cabeçalhos (skipped headings) e de semântica lógica, o que dificultava
              a compreensão do conteúdo por tecnologias de apoio. Estas falhas foram documentadas e
              priorizadas, serviram de base para a implementação de correções ao nível da perceção e
              operabilidade.
            </li>
          </ul>
        </li>
        <li>
          (2026-04-01). <strong>Relatório: </strong>
          <a href="https://drive.google.com/file/d/1RXKsjPdkKokf01L0KADP56i45yJRrY9h/view?usp=sharing">
            Tips for Writing, Design and Developing
          </a>
          <ul>
            <li>
              <strong>Ferramenta utilizada:</strong>W3C Tips for Getting Started
            </li>
            <li>
              <strong>Amostra:</strong> 8 páginas.
            </li>
            <li>
              <strong>Principais resultados (sumário):</strong> A aplicação destas diretrizes
              permitiu otimizar a clareza e a interação em todo o ecossistema Safinity. No eixo
              Writing, reforçou-se o fornecimento de instruções claras e textos de apoio em
              formulários. No Design, garantiu-se que a cor não é o único meio para transmitir
              informação e assegurou-se o contraste suficiente. No Developing, o foco recaiu na
              inclusão de alternativas textuais em imagens e na garantia de que todos os elementos
              interativos são acessíveis via teclado. Esta verificação garantiu a integração das
              melhores práticas de acessibilidade em todas as fases do projeto.
            </li>
          </ul>
        </li>
      </ol>

      <h2>C. Testes com tecnologias de apoio:</h2>
      <ol>
        <li>
          (2026-04-01). <strong>Relatório: </strong>
          <a href="https://drive.google.com/file/d/1DAEtMYQ5omUfvea_qRHimHm_IIBCAV5q/view">
            Tecnologias de apoio
          </a>
          <ul>
            <li>
              <strong>Ferramentas utilizadas:</strong> Ferramenta de ampliação (Android/Windows),
              Leitores de Ecra (NVDA e TalkBack) e Navegação por Teclado.
            </li>
            <li>
              <strong>Amostra:</strong> 11 páginas.
            </li>
            <li>
              <strong>Principais resultados (sumário):</strong> A avaliação revelou que o
              ecossistema apresenta uma base sólida de operabilidade, o que permite a navegação
              sequencial lógica. Foram identificadas e corrigidas barreiras críticas como a
              sobreposição de elementos em ampliações de 400% ou a ausência de indicadores de foco
              visual em componentes interativos. A implementacao de accessibilityLabel e
              accessibilityRole garantiu que elementos anteriormente silenciosos passassem a ser
              anunciados corretamente pelos leitores de ecra. Enquanto a otimizacao dos headings
              melhorou a compreensao semantica.
            </li>
          </ul>
        </li>
      </ol>

      <h2>D. Testes de usabilidade com pessoas com deficiência:</h2>
      <p>
        O sítio Web e aplicacao movel ainda nao foram alvo de testes com utilizadores com
        deficiencia.
      </p>

      <h1>III. Contacto e solicitacão de informação relativa ao sítio Web e aplicação móvel</h1>
      <p>
        A equipa Safinity valoriza a participação ativa dos seus utilizadores na construção de um
        ecossistema mais inclusivo. Caso encontre barreiras de acesso, necessite de esclarecimentos
        sobre as funcionalidades de acessibilidade ou pretenda submeter sugestoes de melhoria tanto
        no sitio Web como na aplicação móvel, poderá fazê-lo através do seguinte canal:
      </p>

      <h2>Correio eletrónico:</h2>
      <p>
        <a href="mailto:safinityapp@gmail.com">safinityapp@gmail.com</a>
      </p>

      <h1>IV. Notas Adicionais e Outras Evidências</h1>
      <p>
        Até à data de publicação desta Declaração, a equipa Safinity não submeteu o projeto a outras
        certificações ou selos de maturidade digital, focando os seus recursos na implementacao
        direta dos requisitos tecnicos de acessibilidade definidos no Decreto-Lei n.° 83/2018. O
        projeto mantem-se num ciclo de melhoria continua para elevar os seus indices de
        conformidade.
      </p>

      <h1>V. Denúncia de situações de discriminação</h1>
      <p>
        Sempre que o utilizador considere que a falha de acessibilidade do sitio Web ou aplicacao
        movel origina uma situaçao de discriminação, podera apresentar queixa ao Instituto Nacional
        para a Reabilitação (INR, I.P.), de acordo com o previsto no artigo 13.° do Decreto-Lei n.°
        83/2018.
      </p>
    </Container>
  );
}
