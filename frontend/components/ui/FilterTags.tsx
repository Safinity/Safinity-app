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

const TagsScrollView = styled.ScrollView.attrs({
  horizontal: true,
  overflow: 'visible',
  showsHorizontalScrollIndicator: false,
})`
  flex-grow: 0;
`;

const TagsContainer = styled.View`
  flex-direction: row;
  gap: ${Spacing.sm}px;
  padding-vertical: ${Spacing.xs}px;
  padding-right: ${Spacing.md}px;
`;

const Tag = styled.Pressable<{ 
  selected: boolean; 
  color?: string;
  selectedColor?: string;
}>`
  background-color: ${({ selected, color, selectedColor }) => 
    selected ? Colors.primary : Colors.background};
  padding: ${Spacing.sm}px ${Spacing.md}px;
  border-radius: ${BorderRadius.round}px;
  border-width: 1px;
  border-color: ${({ selected, selectedColor }) => 
    selected ? (selectedColor || Colors.primary) : 'transparent'};
  min-height: 42px;
  justify-content: center;
`;

const TagText = styled.Text<{ 
  selected: boolean;
  textColor?: string;
  selectedTextColor?: string;
}>`
  color: ${({ selected, textColor, selectedTextColor }) => 
    selected 
      ? (selectedTextColor || Colors.white) 
      : (textColor || Colors.inactive)};
  font-weight: ${({ selected }) => selected ? '400' : '400'};
  font-size: 14px;
  text-align: center;
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