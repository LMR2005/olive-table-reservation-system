
export type RestaurantTable = {
  id: number;
  table_number: number;
  capacity: number;
  booking_channel: string;
  is_active: boolean;
};

export type SelectedTable = {
  id: number;
  table_number: number;
  capacity: number;
};

export type TableCombination = {
  id: number;
  table_1_id: number;
  table_2_id: number;
  is_active: boolean;
};