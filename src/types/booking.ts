export interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

export interface SlotButtonProps {
  slot: TimeSlot;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export interface BookingCalendarProps {
  availableSlots?: TimeSlot[];
  onBooking?: (date: string, time: string) => void;
  className?: string;
}