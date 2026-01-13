import React from 'react';
import styled from 'styled-components/native';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

export type FilterTagsVariant = 'homepage' | 'mapa';

const TAG_THEME = {
  homepage: {
    color: Colors.grayNavbar,
    selectedColor: Colors.primary,
    textColor: Colors.inactive,
    selectedTextColor: Colors.white,
    paddingLeft: 40,
    paddingRight: 40,
  },
  mapa: {
    color: Colors.background,
    selectedColor: Colors.primary,
    textColor: Colors.inactive,
    selectedTextColor: Colors.white,
    paddingLeft: 40,
    paddingRight: 40,
  },
} as const;

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
  margin-top: ${Spacing.md}px;
`;

const TagsContainer = styled.View`
  flex-direction: row;
  gap: ${Spacing.sm}px;
`;

const Tag = styled.Pressable<{ selected: boolean; color: string; selectedColor: string }>`
  background-color: ${({ selected, color, selectedColor }) => (selected ? selectedColor : color)};
  padding: ${Spacing.sm}px 18px;
  border-radius: ${BorderRadius.round}px;
  border-width: 1px;
  border-color: ${({ selected, selectedColor }) => (selected ? selectedColor : 'transparent')};
  min-height: 42px;
  justify-content: center;
  align-items: center;
`;

const TagText = styled.Text<{ selected: boolean; textColor: string; selectedTextColor: string }>`
  color: ${({ selected, textColor, selectedTextColor }) =>
    selected ? selectedTextColor : textColor};
  font-weight: 500;
  font-size: 14px;
`;

const FilterTags: React.FC<FilterTagsProps> = ({
  tags,
  selectedTags,
  onTagPress,
  variant,
  style,
  showsHorizontalScrollIndicator = false,
}) => {
  const theme = TAG_THEME[variant];

  return (
    <TagsScrollView
      style={style}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      contentContainerStyle={{
        paddingLeft: theme.paddingLeft,
        paddingRight: theme.paddingRight,
      }}
    >
      <TagsContainer>
        {tags.map(tag => {
          const isSelected = selectedTags.includes(tag);

          return (
            <Tag
              key={tag}
              selected={isSelected}
              color={theme.color}
              selectedColor={theme.selectedColor}
              onPress={() => onTagPress(tag)}
            >
              <TagText
                selected={isSelected}
                textColor={theme.textColor}
                selectedTextColor={theme.selectedTextColor}
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
