import React from 'react';
import styled from 'styled-components';
import { eventImages } from '../assets/images/Events';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  name: string;
  category: string;
  time_left?: string;
  start_date?: string;
  end_date?: string;
  status: 'live' | 'upcoming' | 'finished' | string;
  image: string;
  start_time: string;
  end_time: string;
  duration: string;
  location: string;
  description: string;
}

interface EventCardProps {
  event: Event;
  variant?: 'compact' | 'default';
}

export const EventCard: React.FC<EventCardProps> = ({ event, variant }) => {
  const navigate = useNavigate();
  const $isCompact = variant === 'compact';
  const isLive = event.status === 'live';

  const imageSource = eventImages[event.id] || '/placeholder.png';

  const formatEventDate = (start?: string, end?: string) => {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const month = startDate.toLocaleString('en-GB', { month: 'long' });
    const year = startDate.getFullYear();

    return startDate.getMonth() === endDate.getMonth()
      ? `${startDay}-${endDay} ${month} ${year}`
      : `${startDay} ${startDate.toLocaleString('en-GB', { month: 'short' })} - ${endDay} ${endDate.toLocaleString('en-GB', { month: 'short' })} ${year}`;
  };

  const handleClick = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <CardContainer $isCompact={$isCompact} onClick={handleClick}>
      <BackgroundImage src={imageSource} alt={event.name} />
      <GradientLayer $isCompact={$isCompact}>
        {isLive && <LiveBadge>Live Now</LiveBadge>}
        {event.time_left && <TimeBadge $isCompact={$isCompact}>{event.time_left}</TimeBadge>}

        <CardFooter>
          <DateText>{formatEventDate(event.start_date, event.end_date)}</DateText>
          <TitleText>{event.name}</TitleText>
        </CardFooter>
      </GradientLayer>
    </CardContainer>
  );
};

/* --- Styled Components --- */

const CardContainer = styled.div<{ $isCompact?: boolean }>`
  position: relative;
  width: 280px;
  height: ${({ $isCompact }) => ($isCompact ? '240px' : '380px')};
  margin-right: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.large}px;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
  }
`;

const BackgroundImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const GradientLayer = styled.div<{ $isCompact?: boolean }>`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${({ $isCompact }) => ($isCompact ? '12px' : '20px')};
  background: linear-gradient(
    to top,
    ${({ theme }) => theme.colors.palette.neutral.neutral0}cc,
    transparent 60%
  );
`;

const LiveBadge = styled.div`
  align-self: flex-start;
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  color: ${({ theme }) => theme.colors.white};
  font-weight: ${({ theme }) => theme.fonts.weights.semibold};
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const TimeBadge = styled.div<{ $isCompact?: boolean }>`
  align-self: flex-end;
  background-color: rgba(123, 73, 242, 0.5);
  padding: ${({ $isCompact }) => ($isCompact ? '4px 10px' : '8px 14px')};
  border-radius: ${({ theme }) => theme.borderRadius.round}px;
  color: ${({ theme }) => theme.colors.white};
  font-weight: 500;
  font-size: ${({ $isCompact }) => ($isCompact ? '12px' : '14px')};
`;

const CardFooter = styled.div`
  margin-top: auto;
`;

const DateText = styled.div`
  color: ${({ theme }) => theme.colors.white};
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 4px;
`;

const TitleText = styled.div`
  color: ${({ theme }) => theme.colors.white};
  font-size: 20px;
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
`;
