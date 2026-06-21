import React from 'react';
import styled from 'styled-components/native';
import { useTheme } from 'styled-components/native';
import { Spacing, Height, BorderRadius, TextStyles } from '../../constants/theme';

export type FilterTagsVariant = 'homepage' | 'mapa';

/**
 * Dynamic theme properties mapping matching your styling images
 */
const getTagTheme = (theme: any) => ({
  homepage: {
    color:
      theme.colors.mode === 'dark' ? theme.colors.surface : theme.colors.palette.primary.light80,
    selectedColor: theme.colors.primary, // selected background
    textColor: theme.colors.text, // unselected text
    selectedTextColor: '#FFFFFF', // selected text color
    borderColor: 'transparent',
    paddingLeft: Spacing.margemLateral,
    paddingRight: Spacing.lg,
  },
  mapa: {
    color: theme.colors.mode === 'dark' ? theme.colors.surface : 'white',
    selectedColor: theme.colors.primary,
    textColor: theme.colors.text,
    selectedTextColor: '#FFFFFF',
    borderColor: theme.colors.mode === 'dark' ? '#4A5568' : '#E2E8F0', // Uses subtle clean borders observed in image 2
    paddingLeft: Spacing.margemLateral,
    paddingRight: Spacing.lg,
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

/**
 * Scroll container
 */
const TagsScrollView = styled.ScrollView.attrs<{ variant: FilterTagsVariant; theme: any }>(
  ({ variant, theme }) => {
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
  margin-top: ${Spacing.md}px;
`;

/**
 * Container dos tags
 */
const TagsContainer = styled.View`
  flex-direction: row;
  gap: ${Spacing.sm}px; /* Perfectly scales according to your device functions */
`;

/**
 * Tag button
 */
const Tag = styled.Pressable<{
  selected: boolean;
  variant: FilterTagsVariant;
  theme: any;
}>`
  padding: 0px ${Spacing.md}px;
  border-radius: ${BorderRadius.round}px;
  border-width: 1px;
  height: ${Height.tam_42}px; /* Uses your predefined scale size (42) */
  justify-content: center;
  align-items: center;

  ${({ selected, variant, theme }) => {
    const tagTheme = getTagTheme(theme)[variant];

    return `
      background-color: ${selected ? tagTheme.selectedColor : tagTheme.color};
      border-color: ${selected ? tagTheme.selectedColor : tagTheme.borderColor};
    `;
  }}
`;

/**
 * Texto do tag
 */
const TagText = styled.Text<{
  selected: boolean;
  variant: FilterTagsVariant;
  theme: any;
}>`
  /* Pulls your default font configurations */
  font-family: ${TextStyles.textoFiltros.fontFamily};
  font-size: ${TextStyles.textoFiltros.fontSize}px;
  line-height: ${TextStyles.textoFiltros.lineHeight}px;

  ${({ selected, variant, theme }) => {
    const tagTheme = getTagTheme(theme)[variant];

    return `
      color: ${selected ? tagTheme.selectedTextColor : tagTheme.textColor};
    `;
  }}
`;

/**
 * Component principal
 */
const FilterTags: React.FC<FilterTagsProps> = ({
  tags,
  selectedTags,
  onTagPress,
  variant,
  style,
  showsHorizontalScrollIndicator = false,
}) => {
  const theme = useTheme();

  return (
    <TagsScrollView
      variant={variant}
      theme={theme}
      style={style}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
    >
      <TagsContainer>
        {tags.map(tag => {
          const isSelected = selectedTags.includes(tag);

          return (
            <Tag
              key={tag}
              selected={isSelected}
              variant={variant}
              theme={theme}
              onPress={() => onTagPress(tag)}
              role="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filtrar por ${tag}`}
              accessibilityHint="Aplica este filtro de atividades"
              focusable
            >
              <TagText selected={isSelected} variant={variant} theme={theme}>
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
