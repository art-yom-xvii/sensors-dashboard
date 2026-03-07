export interface Sensor {
  id: string;
  name: string;
  type: string;
  metrics: Record<string, number | null>;
}

export interface SensorTableColumn {
  title: string;
  dataIndex: string | string[];
  key: string;
  sorter?: (a: Sensor, b: Sensor) => number;
  sortDirections?: ('ascend' | 'descend')[];
  resizable?: boolean;
  fixed?: 'left' | 'right';
  width?: number;
  minWidth?: number;
  defaultSortOrder?: 'ascend' | 'descend';
}

export interface DisplaySensor extends Sensor {
  isUnknownName: boolean;
}