export default function AccessibilityDeclaration() {
  return (
    <div>
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
      <ol>
        <li>
          <ul>
            <li>
              <strong></strong>
            </li>
            <li>
              <strong></strong>
            </li>
            <li>
              <strong></strong>
            </li>
          </ul>
        </li>
      </ol>
    </div>
  );
}
