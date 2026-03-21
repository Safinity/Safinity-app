import React from 'react';
import styled from 'styled-components/native';
import { Height, BorderRadius, TextStyles } from '../../constants/theme';

export type FilterTagsVariant = 'homepage' | 'mapa';

const getTagTheme = (theme: any) => ({
  homepage: {
    color: theme.colors.grayNavbar,
    selectedColor: theme.colors.primary,
    textColor: theme.colors.white,
    selectedTextColor: theme.colors.white,
    paddingLeft: theme.spacing.margemLateral,
    paddingRight: theme.spacing.lg,
  },
  mapa: {
    color: theme.colors.background,
    selectedColor: theme.colors.primary,
    textColor: theme.colors.white,
    selectedTextColor: theme.colors.white,
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.lg,
  },
});

interface FilterTagsProps {
  tags: string[];
  selectedTags: string[];
  onTagPress: (tag: string) => void;
  variant: FilterTagsVariant;
  style?: any;
  showsHorizontalScrollIndicator?: boolean;
}

const TagsScrollView = styled.ScrollView.attrs<{ variant: FilterTagsVariant }>(
  ({ theme, variant }) => {
    const tagTheme = getTagTheme(theme)[variant];
    return {
      horizontal: true,
      showsHorizontalScrollIndicator: false,
      contentContainerStyle: {
        paddingLeft: tagTheme.paddingLeft,
        paddingRight: tagTheme.paddingRight,
      },
    };
  },
)`
  flex-grow: 0;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const TagsContainer = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const Tag = styled.Pressable<{ selected: boolean; variant: FilterTagsVariant }>`
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  border-width: 1px;
  min-height: ${({ theme }) => theme.height.tam_42}px;
  justify-content: center;
  align-items: center;

  ${({ theme, selected, variant }) => {
    const tagTheme = getTagTheme(theme)[variant];
    return `
      background-color: ${selected ? tagTheme.selectedColor : tagTheme.color};
      border-color: ${selected ? tagTheme.selectedColor : 'transparent'};
    `;
  }}
`;

const TagText = styled.Text<{ selected: boolean; variant: FilterTagsVariant }>`
  ${({ theme }) => TextStyles.textoFiltros};
  ${({ theme, selected, variant }) => {
    const tagTheme = getTagTheme(theme)[variant];
    return `
      color: ${selected ? tagTheme.selectedTextColor : tagTheme.textColor};
    `;
  }}
`;

const FilterTags: React.FC<FilterTagsProps> = ({
  tags,
  selectedTags,
  onTagPress,
  variant,
  style,
  showsHorizontalScrollIndicator = false,
}) => {
  return (
    <TagsScrollView
      variant={variant}
      style={style}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
    >
      <TagsContainer>
        {tags.map(tag => {
          const isSelected = selectedTags.includes(tag);

          return (
            <Tag key={tag} selected={isSelected} variant={variant} onPress={() => onTagPress(tag)}>
              <TagText selected={isSelected} variant={variant}>
                {tag}
              </TagText>
            </Tag>
          );
        })}
      </TagsContainer>
    </TagsScrollView>
  );
};

export default FilterTags;
