import React from 'react';
import styled, { useTheme } from 'styled-components/native';

export type FilterTagsVariant = 'homepage' | 'mapa';

interface FilterTagsProps {
  tags: string[];
  selectedTags: string[];
  onTagPress: (tag: string) => void;
  variant: FilterTagsVariant;
  style?: any;
  showsHorizontalScrollIndicator?: boolean;
}

const TagsScrollView = styled.ScrollView.attrs(props => ({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: props.contentContainerStyle,
}))`
  flex-grow: 0;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const TagsContainer = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
`;

const Tag = styled.Pressable<{ selected: boolean; color: string; selectedColor: string }>`
  background-color: ${({ selected, color, selectedColor }) => (selected ? selectedColor : color)};
  padding: ${({ theme }) => theme.spacing.sm}px 22px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  min-height: 44px;
  justify-content: center;
  align-items: center;
`;

const TagText = styled.Text<{ selected: boolean; textColor: string; selectedTextColor: string }>`
  color: ${({ selected, textColor, selectedTextColor }) =>
    selected ? selectedTextColor : textColor};

  /* Token: textoFiltros */
  font-family: ${({ theme }) => theme.text.textoFiltros.fontFamily};
  font-size: ${({ theme }) => theme.text.textoFiltros.fontSize}px;
  line-height: ${({ theme }) => theme.text.textoFiltros.lineHeight}px;
`;

const FilterTags: React.FC<FilterTagsProps> = ({
  tags,
  selectedTags,
  onTagPress,
  variant,
  style,
  showsHorizontalScrollIndicator = false,
}) => {
  const themeContext = useTheme();

  // Mapeamento de cores utilizando os tokens do theme
  const TAG_THEME = {
    homepage: {
      color: themeContext.colors.grayNavbar,
      selectedColor: themeContext.colors.primary,
      textColor: themeContext.colors.inactive,
      selectedTextColor: themeContext.colors.white,
      paddingLeft: 40,
      paddingRight: 40,
    },
    mapa: {
      color: themeContext.colors.background,
      selectedColor: themeContext.colors.primary,
      textColor: themeContext.colors.inactive,
      selectedTextColor: themeContext.colors.white,
      paddingLeft: 40,
      paddingRight: 40,
    },
  } as const;

  const config = TAG_THEME[variant];

  return (
    <TagsScrollView
      style={style}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      contentContainerStyle={{
        paddingLeft: config.paddingLeft,
        paddingRight: config.paddingRight,
      }}
    >
      <TagsContainer>
        {tags.map(tag => {
          const isSelected = selectedTags.includes(tag);

          return (
            <Tag
              key={tag}
              selected={isSelected}
              color={config.color}
              selectedColor={config.selectedColor}
              onPress={() => onTagPress(tag)}
            >
              <TagText
                selected={isSelected}
                textColor={config.textColor}
                selectedTextColor={config.selectedTextColor}
              >
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
