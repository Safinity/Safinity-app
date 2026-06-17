import styled from 'styled-components';
import { Colors, Spacing } from '../theme/theme';

const Container = styled.div`
  max-width: 1500px;
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
      <h1>Accessibility Declaration: Safinity</h1>
      <p>
        Safinity is committed to making its digital ecosystem, composed of the
        <a href="https://safinity-backoffice.netlify.app/">institutional website</a> and
        <a href="https://expo.dev/accounts/beatriz-castros-organization/projects/frontend/builds/c752e86b-6fef-48db-838d-889502d13a6b">
          mobile application
        </a>
        , accessible to all users. This inclusion effort is guided by compliance with Decree-Law No.
        83/2018, of October 19, which transposes Directive (EU) 2016/2102 of the European Parliament
        and of the Council, on the accessibility of websites and mobile applications.
      </p>
      <h1>I. Compliance Status</h1>
      <p>
        The Safinity ecosystem is in continuous improvement process, presenting a state of partial
        compliance with the <strong>WCAG 2.2</strong> guidelines, at success levels{' '}
        <strong>A</strong> and <strong>AA</strong>. This compliance is the result of an exhaustive
        diagnosis that integrated automated, manual, and assistive technology testing assessments.
      </p>
      <h1>II. Preparation of this Accessibility Declaration</h1>
      <p>
        This declaration was updated on 2026-04-19. <br />
        In accordance with Article 9 of Decree-Law No. 83/2018, project monitoring followed the
        established technical procedures. Mandatory assessments A) and B) were conducted, reinforced
        by recommended practices C) and D) to ensure a more comprehensive analysis.
      </p>
      <h2>A. Automatic Evaluations Performed:</h2>
      <ol>
        <li>
          (2026-04-01). <strong>Report: </strong>
          <a href="https://drive.google.com/file/d/1TFchHCRHuXNujHrJlx81uMQbWNPKqENA/view?usp=sharing">
            WAVE Monitoring
          </a>
          <ul>
            <li>
              <strong>Tool used:</strong> WAVE (Web Accessibility Evaluation Tool)
            </li>
            <li>
              <strong>Sample:</strong> 2 pages.
            </li>
            <li>
              <strong>Main Results (summary):</strong> The use of WAVE enabled immediate and
              systematic validation of technical compliance. Critical "Very Low Contrast" errors
              were detected and corrected to ensure readability according to WCAG ratios. The tool
              also exposed the absence of labels in input fields and the existence of "Empty
              Buttons", which were resolved by implementing aria-labels. Additionally, skipped
              headings were corrected and structural regions (landmarks) were defined to facilitate
              quick navigation for users of assistive technologies.
            </li>
          </ul>
        </li>
        <li>
          (2026-04-01). <strong>Report: </strong>
          <a href="https://drive.google.com/file/d/1GVe8PCvBB02Iw6KkzTjqg27IpRs9FwAA/view?usp=sharing">
            Diagnosis with Accessibility Scanner
          </a>
          <ul>
            <li>
              <strong>Tool used:</strong> Accessibility Scanner - App
            </li>
            <li>
              <strong>Sample:</strong> 3 pages.
            </li>
            <li>
              <strong>Main Results (summary):</strong> Evaluation in native environment enabled the
              identification of interaction barriers specific to the mobile context. Critical
              failures of ambiguity in dynamic lists were detected, where repeated action buttons
              lacked differentiated programmatic descriptions. The diagnosis also noted "Touch
              Target Size" problems, to allow adjustment of touch areas to ensure operability for
              users with motor limitations. Additionally, the tool validated the need for labels in
              native components, ensuring that TalkBack navigation was contextualized and efficient.
            </li>
          </ul>
        </li>
        <li>
          (2026-04-01). <strong>Report: </strong>
          <a href="https://drive.google.com/file/d/15yicXtV7oZrwzpTPLI386UODWiUcTw1I/view?usp=sharing">
            Quantitative Audit with Lighthouse
          </a>
          <ul>
            <li>
              <strong>Tool used:</strong> Lighthouse (Chrome DevTools)
            </li>
            <li>
              <strong>Sample:</strong> 2 pages.
            </li>
            <li>
              <strong>Main Results (summary):</strong> The audit allowed for measuring maturity
              indices between 86% and 100%. Complete successes were identified in the implementation
              of accessible dynamic lists. However, problems were detected in content hierarchy
              (Heading elements not in sequentially-descending order) on alert and notification
              pages, which may disorient assisted navigation. The tool also reinforced the critical
              need to include main landmarks to optimize quick navigation and correction of contrast
              ratios in informational elements, ensuring compliance with Web development "Best
              Practices".
            </li>
          </ul>
        </li>
      </ol>
      <h2>B. Manual Evaluations Performed:</h2>
      <ol>
        <li>
          (2026-04-01). <strong>Report: </strong>
          <a href="https://drive.google.com/file/d/1Yy-meeUWS_Y6-dNOLzl6FUdTqjEgDNSC/view">
            Easy Checks Analysis
          </a>
          <ul>
            <li>
              <strong>Tool used:</strong> Easy Checks from WAI
            </li>
            <li>
              <strong>Sample:</strong> 6 pages.
            </li>
            <li>
              <strong>Main Results (summary):</strong> The diagnosis revealed critical barriers that
              compromised user autonomy. Contrast errors were identified in texts and icons, as well
              as the absence of labels in forms and empty buttons without text alternative. The
              analysis also detected the lack of a hierarchical structure of headings (skipped
              headings) and logical semantics, which made comprehension of content by assistive
              technologies difficult. These failures were documented and prioritized, serving as the
              basis for implementing corrections at the level of perception and operability.
            </li>
          </ul>
        </li>
        <li>
          (2026-04-01). <strong>Report: </strong>
          <a href="https://drive.google.com/file/d/1RXKsjPdkKokf01L0KADP56i45yJRrY9h/view?usp=sharing">
            Tips for Writing, Design and Developing
          </a>
          <ul>
            <li>
              <strong>Tool used:</strong> W3C Tips for Getting Started
            </li>
            <li>
              <strong>Sample:</strong> 8 pages.
            </li>
            <li>
              <strong>Main Results (summary):</strong> The application of these guidelines enabled
              optimization of clarity and interaction across the entire Safinity ecosystem. In the
              Writing axis, provision of clear instructions and support texts in forms was
              reinforced. In Design, it was ensured that color is not the only means of conveying
              information and sufficient contrast was assured. In Developing, the focus was on
              including text alternatives for images and ensuring that all interactive elements are
              accessible via keyboard. This verification ensured the integration of accessibility
              best practices in all phases of the project.
            </li>
          </ul>
        </li>
      </ol>

      <h2>C. Testing with Assistive Technologies:</h2>
      <ol>
        <li>
          (2026-04-01). <strong>Report: </strong>
          <a href="https://drive.google.com/file/d/1DAEtMYQ5omUfvea_qRHimHm_IIBCAV5q/view">
            Assistive Technologies
          </a>
          <ul>
            <li>
              <strong>Tools used:</strong> Magnification Tool (Android/Windows), Screen Readers
              (NVDA and TalkBack) and Keyboard Navigation.
            </li>
            <li>
              <strong>Sample:</strong> 11 pages.
            </li>
            <li>
              <strong>Main Results (summary):</strong> The evaluation revealed that the ecosystem
              presents a solid foundation of operability, which enables logical sequential
              navigation. Critical barriers were identified and corrected, such as element overlap
              in 400% magnifications or the absence of visual focus indicators in interactive
              components. The implementation of accessibilityLabel and accessibilityRole ensured
              that previously silent elements were now announced correctly by screen readers. While
              the optimization of headings improved semantic understanding.
            </li>
          </ul>
        </li>
      </ol>

      <h2>D. Usability Testing with People with Disabilities:</h2>
      <p>
        The website and mobile application have not yet been subject to testing with users with
        disabilities.
      </p>

      <h1>III. Contact and Request for Information Regarding the Website and Mobile Application</h1>
      <p>
        The Safinity team values active participation of its users in building a more inclusive
        ecosystem. If you encounter access barriers, need clarifications about accessibility
        features or wish to submit improvement suggestions for both the website and mobile
        application, you can do so through the following channel:
      </p>

      <h2>Email:</h2>
      <p>
        <a href="mailto:safinityapp@gmail.com">safinityapp@gmail.com</a>
      </p>

      <h1>IV. Additional Notes and Other Evidence</h1>
      <p>
        As of the date of publication of this Declaration, the Safinity team has not submitted the
        project to other certifications or digital maturity seals, focusing its resources on direct
        implementation of technical accessibility requirements defined in Decree-Law No. 83/2018.
        The project remains in a continuous improvement cycle to raise its compliance indices.
      </p>

      <h1>V. Report of Discrimination Situations</h1>
      <p>
        Whenever the user considers that the failure of accessibility of the website or mobile
        application originates a situation of discrimination, they may submit a complaint to the
        National Rehabilitation Institute (INR, I.P.), in accordance with the provisions of Article
        13 of Decree-Law No. 83/2018.
      </p>
    </Container>
  );
}
