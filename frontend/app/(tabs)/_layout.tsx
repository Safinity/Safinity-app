import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

const NavbarContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.grayNavbar};
  border-radius: ${({ theme }) => theme.borderRadius.xlarge}px;
  height: 73px;
  margin-bottom: ${Platform.OS === 'ios' ? 20 : 16}px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
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
  padding-top: 8px;
  padding-bottom: 8px;
`;

const TabButton = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-top: 4px;
  padding-bottom: 4px;
`;

const IconBox = styled.View`
  align-items: center;
  justify-content: center;
  height: 24px;
  margin-bottom: 2px;
`;

const TabText = styled.Text<{ $active: boolean }>`
  font-size: 11px;
  font-weight: 600;
  margin-top: 2px;
  color: ${({ $active, theme }) => ($active ? theme.colors.white : theme.colors.inactive)};
`;

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <NavbarContainer>
      <TabBarContent>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabButton
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
            >
              <IconBox>
                <Ionicons
                  name={isFocused ? options.iconName : `${options.iconName}-outline`}
                  size={22}
                  color={isFocused ? '#FFFFFF' : '#A0A0A5'}
                />
              </IconBox>
              <TabText $active={isFocused}>{options.title}</TabText>
            </TabButton>
          );
        })}
      </TabBarContent>
    </NavbarContainer>
  );
}

const tabConfigs = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'map', title: 'Map', icon: 'map' },
  { name: 'calendar', title: 'Calendar', icon: 'calendar' },
  { name: 'friends', title: 'Friends', icon: 'people' },
] as const;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none',
        },
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      {tabConfigs.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            iconName: tab.icon,
          }}
        />
      ))}
    </Tabs>
  );
}
