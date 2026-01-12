import React, { useState } from 'react';
import { FlatList, TextInput } from 'react-native';
import styled from 'styled-components/native';
import Header from '@/components/ui/header';
import users from '@/data/users.json';
import { Ionicons } from '@expo/vector-icons';

export default function AddFriendScreen() {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  // Filtra utilizadores por nome ou username
  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.username.toLowerCase().includes(query.toLowerCase())
  );

  // Adiciona à lista de pesquisas recentes
  const handleSelectUser = (user: any) => {
    if (!recentSearches.find(u => u.id === user.id)) {
      setRecentSearches(prev => [user, ...prev]);
    }
    // Aqui podes adicionar lógica para adicionar amigo
  };

  return (
    <Container>
      <Header variant="default" title="Add friend" showBottomDivider={false} />

      <SearchBar>
        <SearchInput
          placeholder="Find friends"
          placeholderTextColor="#aaa"
          value={query}
          onChangeText={setQuery}
        />
        <QRButton>
          <Ionicons name="qr-code-outline" size={24} color="white" />
        </QRButton>
      </SearchBar>

      <SectionTitle>Recent searches</SectionTitle>
      <FlatList
        data={recentSearches}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <UserRow onPress={() => handleSelectUser(item)}>
            <Avatar source={{ uri: item.image }} />
            <UserInfo>
              <Name>{item.name}</Name>
              <Username>@{item.username}</Username>
            </UserInfo>
            <AddIcon>
              <Ionicons name="person-add-outline" size={22} color="white" />
            </AddIcon>
          </UserRow>
        )}
      />
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.main};
`;

const SearchBar = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 16px;
  background-color: ${({ theme }) => theme.colors.background.alt};
  border-radius: 12px;
  padding: 8px 12px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  color: white;
  font-size: 16px;
`;

const QRButton = styled.TouchableOpacity`
  padding: 4px;
`;

const SectionTitle = styled.Text`
  margin: 16px;
  font-size: 16px;
  font-weight: bold;
  color: white;
`;

const UserRow = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
`;

const Avatar = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 20px;
`;

const UserInfo = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const Name = styled.Text`
  color: white;
  font-size: 16px;
`;

const Username = styled.Text`
  color: #aaa;
  font-size: 14px;
`;

const AddIcon = styled.View`
  padding: 4px;
`;
