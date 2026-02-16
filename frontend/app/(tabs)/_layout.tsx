import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

const NavbarContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  border-radius: ${({ theme }) => theme.borderRadius.xlarge}px;
  height: ${({ theme }) => theme.height.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.margemLateral}px;
  elevation: 8;
  position: absolute;
  bottom: 0;
  left: ${({ theme }) => theme.spacing.margemLateral}px;
  right: ${({ theme }) => theme.spacing.margemLateral}px;
`;

const TabBarContent = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;

const TabButton = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const TabIcon = styled(Ionicons).attrs(({ theme }) => ({
  size: theme.height.xs,
}))<{ $active: boolean }>`
  color: ${({ $active, theme }) => ($active ? theme.colors.white : theme.colors.inactive)};
`;

const IconBox = styled.View`
  height: ${({ theme }) => theme.height.xs}px;
  margin-bottom: ${({ theme }) => theme.spacing.xxs}px;
  align-items: center;
  justify-content: center;
`;

const TabText = styled.Text<{ $active: boolean }>`
  ${({ theme }) => theme.text.textoPequeno};
  margin-top: ${({ theme }) => theme.spacing.xxs}px;
  color: ${({ $active, theme }) => ($active ? theme.colors.white : theme.colors.inactive)};
`;

const tabConfigs = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'map', title: 'Map', icon: 'map' },
  { name: 'calendar', title: 'Calendar', icon: 'calendar' },
  { name: 'friends', title: 'Friends', icon: 'people' },
] as const;

function CustomTabBar({ state, navigation }: any) {
  return (
    <NavbarContainer>
      <TabBarContent>
        {tabConfigs.map(tab => {
          const routeIndex = state.routes.findIndex((r: any) => r.name === tab.name);
          const isFocused = state.index === routeIndex;

          if (routeIndex === -1) return null;

          const onPress = () => {
            if (!isFocused) {
              navigation.navigate(tab.name);
            }
          };

          return (
            <TabButton key={tab.name} onPress={onPress}>
              <IconBox>
                <TabIcon name={isFocused ? tab.icon : `${tab.icon}-outline`} $active={isFocused} />
              </IconBox>
              <TabText $active={isFocused}>{tab.title}</TabText>
            </TabButton>
          );
        })}
      </TabBarContent>
    </NavbarContainer>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      {tabConfigs.map(tab => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}
