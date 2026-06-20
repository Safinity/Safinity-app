import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import styled from 'styled-components/native';
import Header from '../../../components/ui/header';
import { Spacing } from '../../../constants/theme';

export default function TermsAndConditions() {
  return (
    <Container>
      <Header variant="back" title="Terms & Conditions" showBottomDivider={true} />
      
      <StyledScrollView contentContainerStyle={styles.content}>
        <DateText>Last updated: 30 May 2026</DateText>
        
        <SectionTitle>Article 1: Purpose and Definition of the Ecosystem</SectionTitle>
        <Paragraph>The Safinity ecosystem is an integrated digital solution designed to address the critical need for security, social support, and well-being at large-scale public and private events, where crowd management and timely communication are vital for the prevention of serious incidents. The system is comprehensively composed of two complementary operational strands:</Paragraph>
        <Paragraph>1. Mobile Application: Intended for event participants and the general public, allowing access to critical features such as an SOS button, location sharing among friends, and real-time assisted geolocation.</Paragraph>
        <Paragraph>2. Backoffice System: Provided specifically for organising teams, promoters, and competent authorities to monitor alerts, manage crowd flows, and coordinate operational responses.</Paragraph>

        <SectionTitle>Article 2: Access Requirements and Account Registration</SectionTitle>
        <Paragraph>Access to all services provided by the platform is conditional upon the prior validation of the user profile, ensuring traceability and the integrity of data transmitted in the event of an emergency. Accordingly, the registration process is governed by the following normative provisions:</Paragraph>
        <Paragraph>1. To use the personalised features of the ecosystem, namely sending alerts, synchronising location with your network of contacts, or viewing notification history, the creation of an individual user account may be required.</Paragraph>
        <Paragraph>2. The user undertakes to provide reliable, accurate, and up-to-date data at the time of registration. Identity fraud or the insertion of third-party data without due authorisation is strictly prohibited.</Paragraph>
        <Paragraph>3. The security and confidentiality of access credentials (username and password) are the exclusive responsibility of the user. Any actions performed under your account will be presumed to be legitimate and performed by you.</Paragraph>

        <SectionTitle>Article 3: Acceptable Use and Critical Features (SOS Button)</SectionTitle>
        <Paragraph>Given the critical nature of the Safinity platform, where access and data transmission can determine the physical integrity and safety of users in crowded contexts, the user assumes the commitment to use the services in a strictly responsible, ethical, and legal manner.</Paragraph>
        <Paragraph>The activation of the SOS button and, consequently, the sending of emergency alerts must be performed exclusively in situations of real danger, imminent threat, or an actual need for technical or medical assistance. The deliberately abusive, simulated, or negligent use of these critical security features undermines the reliability of the ecosystem and constitutes a serious breach of these Terms, with Safinity reserving the right to immediately suspend the account and cooperate with the competent police authorities.</Paragraph>
        <Paragraph>It is expressly prohibited to use the ecosystem to: introduce or disseminate malicious software (malware, viruses) that may corrupt the operation of the mobile application or the backoffice; engage in acts that disproportionately overload the network infrastructure; or intercept, collect, or process location data of other users without consent.</Paragraph>

        <SectionTitle>Article 4: Intellectual Property</SectionTitle>
        <Paragraph>All elements that make up the Safinity ecosystem — including source code, databases, features, interface design, logos, and original audiovisual assets — are the exclusive property of Safinity. The user is granted a limited, non-exclusive, and revocable licence for personal, non-commercial use.</Paragraph>

        <SectionTitle>Article 5: Data Protection and Privacy</SectionTitle>
        <Paragraph>The processing of personal data is guided by the principle of "Privacy-by-Design" and absolute transparency, in strict compliance with the GDPR and current national legislation. Details are defined in our Privacy Policy.</Paragraph>

        <SectionTitle>Article 6: Digital Accessibility and Inclusion</SectionTitle>
        <Paragraph>Safinity is committed to keeping its digital ecosystem accessible, ensuring technical compliance with WCAG 2.2 guidelines. If you detect any accessibility barriers, please provide feedback to: safinityapp@gmail.com.</Paragraph>

        <SectionTitle>Article 7: Exclusion of Liability</SectionTitle>
        <Paragraph>The platform is provided "as is." Safinity cannot guarantee uninterrupted operation or a total absence of errors resulting from mobile network failures or third-party server faults. Participants should always follow instructions from local security authorities.</Paragraph>

        <SectionTitle>Article 8: Modifications to Terms</SectionTitle>
        <Paragraph>Safinity reserves the right to update these Terms to reflect legislative changes or technical requirements. Users will be notified of substantial changes via the mobile app or institutional website.</Paragraph>

        <SectionTitle>Article 9: Dispute Resolution and Governing Law</SectionTitle>
        <Paragraph>These Terms are governed by the legislation of the Portuguese Republic. Disagreements will be resolved by the Judicial Court of the District of Aveiro. Users may also resort to official Alternative Dispute Resolution (ADR) entities.</Paragraph>
        
        <View style={{ height: 40 }} />
      </StyledScrollView>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const StyledScrollView = styled.ScrollView`
  /* Aumentei para 120 para garantir que o conteúdo começa abaixo do Header */
  padding-top: 120px; 
`;

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.margemLateral, paddingBottom: 50 },
});

const DateText = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  margin-top: 40px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-top: 20px;
  margin-bottom: 10px;
`;

const Paragraph = styled.Text`
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
  text-align: justify;
`;