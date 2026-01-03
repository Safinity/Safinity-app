import React from 'react';
import styled from 'styled-components/native';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

interface FilterTagsProps {
  tags: string[];
  selectedTags: string[];
  onTagPress: (tag: string) => void;
  color?: string;
  selectedColor?: string;
  textColor?: string;
  selectedTextColor?: string;
  style?: any;
  showsHorizontalScrollIndicator?: boolean;
  contentContainerStyle?: any;
}

const TagsScrollView = styled.ScrollView.attrs((props) => ({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  // Mantemos a esquerda a 0 para não duplicar margem
  // Adicionamos 40px à direita para o fim do scroll
  contentContainerStyle: {
    paddingRight: 40,
    ...props.contentContainerStyle,
  },
}))`
  flex-grow: 0;
  margin-top: ${Spacing.md}px;
`;

const TagsContainer = styled.View`
  flex-direction: row;
  gap: ${Spacing.sm}px;
  padding-vertical: ${Spacing.xs}px;
`;

const Tag = styled.Pressable<{
  selected: boolean;
  color?: string;
  selectedColor?: string;
}>`
  background-color: ${({ selected }) =>
    selected ? Colors.primary : Colors.grayNavbar};
  padding: ${Spacing.sm}px 18px;
  border-radius: ${BorderRadius.round}px;
  border-width: 1px;
  border-color: ${({ selected, selectedColor }) =>
    selected ? selectedColor || Colors.primary : 'transparent'};
  min-height: 42px;
  justify-content: center;
  align-items: center;
`;

const TagText = styled.Text<{
  selected: boolean;
  textColor?: string;
  selectedTextColor?: string;
}>`
  color: ${({ selected, textColor, selectedTextColor }) =>
    selected ? selectedTextColor || Colors.white : textColor || Colors.inactive};
  font-weight: 500;
  font-size: 14px;
`;

const FilterTags: React.FC<FilterTagsProps> = ({
  tags,
  selectedTags,
  onTagPress,
  color,
  selectedColor,
  textColor,
  selectedTextColor,
  style,
  showsHorizontalScrollIndicator = false,
  contentContainerStyle,
}) => {
  return (
    <TagsScrollView
      style={style}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      contentContainerStyle={contentContainerStyle}
    >
      <TagsContainer>
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag);

          return (
            <Tag
              key={tag}
              selected={isSelected}
              color={color}
              selectedColor={selectedColor}
              onPress={() => onTagPress(tag)}
            >
              <TagText
                selected={isSelected}
                textColor={textColor}
                selectedTextColor={selectedTextColor}
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