'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

export type BayStatus = 'available' | 'occupied' | 'reserved' | 'selected';
export type ZoneType = 'front' | 'rear' | 'all';

export interface ParkingBayData {
  id: string;
  bayNumber: string;
  type: 'visitor' | 'resident';
  status: BayStatus;
  zone: 'front' | 'rear';
  pathD: string;
  cx: number;
  cy: number;
  width_m?: number;
  depth_m?: number;
  layout?: string;
  sessionPlate?: string;
  sessionVisitor?: string;
}

interface SpatialFloorplanProps {
  bays: ParkingBayData[];
  selectedBayId: string | null;
  onSelectBay: (bay: ParkingBayData) => void;
}

export const CANONICAL_VECTOR_BAYS: ParkingBayData[] = [
  {
    "id": "feat_1786662239741_0",
    "bayNumber": "V-23",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 930.7 124.3 L 922.2 123.9 L 923.1 105.3 L 931.6 105.7 L 930.7 124.3 Z",
    "cx": 927.7,
    "cy": 116.7
  },
  {
    "id": "feat_1786662239741_1",
    "bayNumber": "V-22",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 922.2 123.9 L 913.7 123.5 L 914.6 104.9 L 923.1 105.3 L 922.2 123.9 Z",
    "cx": 919.2,
    "cy": 116.3
  },
  {
    "id": "feat_1786662239741_2",
    "bayNumber": "V-21",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 913.7 123.5 L 905.2 123 L 906.1 104.4 L 914.6 104.9 L 913.7 123.5 Z",
    "cx": 910.7,
    "cy": 115.9
  },
  {
    "id": "feat_1786662277405_0",
    "bayNumber": "R-11",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 660.4 243.7 L 660.6 252.2 L 642.1 252.7 L 641.9 244.1 L 660.4 243.7 Z",
    "cx": 653.1,
    "cy": 247.3
  },
  {
    "id": "feat_1786662277405_1",
    "bayNumber": "V-06",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 660.6 252.2 L 660.9 260.8 L 642.4 261.3 L 642.1 252.7 L 660.6 252.2 Z",
    "cx": 653.3,
    "cy": 255.8
  },
  {
    "id": "feat_1786662277405_2",
    "bayNumber": "V-07",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 660.9 260.8 L 661.1 269.4 L 642.6 269.8 L 642.4 261.3 L 660.9 260.8 Z",
    "cx": 653.6,
    "cy": 264.4
  },
  {
    "id": "feat_1786662277405_3",
    "bayNumber": "V-08",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 661.1 269.4 L 661.3 277.9 L 642.8 278.4 L 642.6 269.8 L 661.1 269.4 Z",
    "cx": 653.8,
    "cy": 273
  },
  {
    "id": "feat_1786662427549_0",
    "bayNumber": "R-10",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 706 262.8 L 706.1 271.4 L 687.6 271.7 L 687.5 263.1 L 706 262.8 Z",
    "cx": 698.6,
    "cy": 266.4
  },
  {
    "id": "feat_1786662427549_1",
    "bayNumber": "V-10",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 706.1 271.4 L 706.3 279.9 L 687.8 280.2 L 687.6 271.7 L 706.1 271.4 Z",
    "cx": 698.8,
    "cy": 274.9
  },
  {
    "id": "feat_1786662427549_2",
    "bayNumber": "V-09",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 706.3 279.9 L 706.4 288.5 L 687.9 288.8 L 687.8 280.2 L 706.3 279.9 Z",
    "cx": 698.9,
    "cy": 283.5
  },
  {
    "id": "feat_1786663218783_clone_1",
    "bayNumber": "R-09",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 702.4 204 L 702.7 212.6 L 684.2 213.1 L 683.9 204.5 L 702.4 204 Z",
    "cx": 695.1,
    "cy": 207.6
  },
  {
    "id": "feat_1786663218783_clone_2",
    "bayNumber": "R-08",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 702.7 212.6 L 702.9 221.2 L 684.4 221.6 L 684.2 213.1 L 702.7 212.6 Z",
    "cx": 695.4,
    "cy": 216.2
  },
  {
    "id": "feat_1786663271678_0",
    "bayNumber": "R-03",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 799.3 208 L 790.8 207.5 L 792 188.9 L 800.5 189.4 L 799.3 208 Z",
    "cx": 796.4,
    "cy": 200.4
  },
  {
    "id": "feat_1786663271678_1",
    "bayNumber": "R-05",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 790.8 207.5 L 782.3 206.9 L 783.5 188.3 L 792 188.9 L 790.8 207.5 Z",
    "cx": 787.9,
    "cy": 199.8
  },
  {
    "id": "feat_1786663271678_2",
    "bayNumber": "V-20",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 782.3 206.9 L 773.8 206.3 L 775 187.8 L 783.5 188.3 L 782.3 206.9 Z",
    "cx": 779.4,
    "cy": 199.2
  },
  {
    "id": "feat_1786663271678_3",
    "bayNumber": "V-19",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 773.8 206.3 L 765.3 205.8 L 766.6 187.2 L 775 187.8 L 773.8 206.3 Z",
    "cx": 770.9,
    "cy": 198.7
  },
  {
    "id": "feat_1786663271678_4",
    "bayNumber": "V-18",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 765.3 205.8 L 756.8 205.2 L 758.1 186.6 L 766.6 187.2 L 765.3 205.8 Z",
    "cx": 762.4,
    "cy": 198.1
  },
  {
    "id": "feat_1786663271678_5",
    "bayNumber": "V-17",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 756.8 205.2 L 748.3 204.7 L 749.6 186.1 L 758.1 186.6 L 756.8 205.2 Z",
    "cx": 753.9,
    "cy": 197.6
  },
  {
    "id": "feat_1786663271678_6",
    "bayNumber": "V-16",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 748.3 204.7 L 739.9 204.1 L 741.1 185.5 L 749.6 186.1 L 748.3 204.7 Z",
    "cx": 745.4,
    "cy": 197
  },
  {
    "id": "feat_1786663271678_7",
    "bayNumber": "V-15",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 739.9 204.1 L 731.4 203.5 L 732.6 184.9 L 741.1 185.5 L 739.9 204.1 Z",
    "cx": 737,
    "cy": 196.4
  },
  {
    "id": "feat_1786663271678_8",
    "bayNumber": "V-14",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 731.4 203.5 L 722.9 203 L 724.1 184.4 L 732.6 184.9 L 731.4 203.5 Z",
    "cx": 728.5,
    "cy": 195.9
  },
  {
    "id": "feat_1786663271678_9",
    "bayNumber": "V-13",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 722.9 203 L 714.4 202.4 L 715.6 183.8 L 724.1 184.4 L 722.9 203 Z",
    "cx": 720,
    "cy": 195.3
  },
  {
    "id": "feat_1786663271678_10",
    "bayNumber": "V-12",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 714.4 202.4 L 705.9 201.8 L 707.1 183.3 L 715.6 183.8 L 714.4 202.4 Z",
    "cx": 711.5,
    "cy": 194.7
  },
  {
    "id": "feat_1786663271678_11",
    "bayNumber": "V-11",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 705.9 201.8 L 697.4 201.3 L 698.6 182.7 L 707.1 183.3 L 705.9 201.8 Z",
    "cx": 703,
    "cy": 194.2
  },
  {
    "id": "feat_1786663271678_12",
    "bayNumber": "R-09",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 697.4 201.3 L 688.9 200.7 L 690.1 182.1 L 698.6 182.7 L 697.4 201.3 Z",
    "cx": 694.5,
    "cy": 193.6
  },
  {
    "id": "feat_1786663805447_clone_1",
    "bayNumber": "R-16",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 612.2 176.9 L 612.4 185.4 L 593.9 185.9 L 593.7 177.3 L 612.2 176.9 Z",
    "cx": 604.9,
    "cy": 180.5
  },
  {
    "id": "feat_1786663863759_clone_1",
    "bayNumber": "R-13",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 656.9 183.5 L 657.1 192.1 L 638.6 192.6 L 638.4 184 L 656.9 183.5 Z",
    "cx": 649.6,
    "cy": 187.1
  },
  {
    "id": "feat_1786663908191_clone_1",
    "bayNumber": "V-06",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 660.6 252.2 L 660.9 260.8 L 642.4 261.3 L 642.1 252.7 L 660.6 252.2 Z",
    "cx": 653.3,
    "cy": 255.8
  },
  {
    "id": "feat_1786663908191_clone_2",
    "bayNumber": "V-07",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 660.9 260.8 L 661.1 269.4 L 642.6 269.8 L 642.4 261.3 L 660.9 260.8 Z",
    "cx": 653.6,
    "cy": 264.4
  },
  {
    "id": "feat_1786663926718_0",
    "bayNumber": "R-18",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 593.2 197.8 L 584.7 198.2 L 583.8 179.6 L 592.3 179.2 L 593.2 197.8 Z",
    "cx": 589.4,
    "cy": 190.5
  },
  {
    "id": "feat_1786663926718_1",
    "bayNumber": "V-04",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 584.7 198.2 L 576.2 198.6 L 575.3 180 L 583.8 179.6 L 584.7 198.2 Z",
    "cx": 580.9,
    "cy": 190.9
  },
  {
    "id": "feat_1786664054167_clone_1",
    "bayNumber": "R-12",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 659.5 222.3 L 659.8 230.8 L 641.3 231.3 L 641 222.8 L 659.5 222.3 Z",
    "cx": 652.2,
    "cy": 225.9
  },
  {
    "id": "feat_1786664130007_clone_1",
    "bayNumber": "R-10",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 719.7 140.3 L 711.2 139.8 L 712.4 121.2 L 720.9 121.8 L 719.7 140.3 Z",
    "cx": 716.8,
    "cy": 132.7
  },
  {
    "id": "feat_1786664130007_clone_2",
    "bayNumber": "R-11",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 711.2 139.8 L 702.7 139.2 L 703.9 120.6 L 712.4 121.2 L 711.2 139.8 Z",
    "cx": 708.3,
    "cy": 132.1
  },
  {
    "id": "feat_1786664792136_clone_1",
    "bayNumber": "V-05",
    "type": "visitor",
    "status": "available",
    "zone": "front",
    "pathD": "M 641.4 158.6 L 632.9 158 L 634.1 139.4 L 642.6 140 L 641.4 158.6 Z",
    "cx": 638.5,
    "cy": 150.9
  },
  {
    "id": "feat_1786664842631_0",
    "bayNumber": "R-29",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 557.8 128.8 L 566.2 127.6 L 568.7 146.1 L 560.3 147.2 L 557.8 128.8 Z",
    "cx": 562.2,
    "cy": 135.7
  },
  {
    "id": "feat_1786664869984_clone_1",
    "bayNumber": "R-28",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 560.9 147.5 L 569.3 146.3 L 571.8 164.8 L 563.4 165.9 L 560.9 147.5 Z",
    "cx": 565.3,
    "cy": 154.4
  },
  {
    "id": "feat_1786665148143_0",
    "bayNumber": "R-32",
    "type": "resident",
    "status": "available",
    "zone": "rear",
    "pathD": "M 422 87.8 L 440.2 84.4 L 441.7 92.9 L 423.5 96.2 L 422 87.8 Z",
    "cx": 429.9,
    "cy": 89.8
  },
  {
    "id": "feat_1786665148143_1",
    "bayNumber": "R-24",
    "type": "resident",
    "status": "available",
    "zone": "rear",
    "pathD": "M 440.2 84.4 L 458.4 81.1 L 459.9 89.5 L 441.7 92.9 L 440.2 84.4 Z",
    "cx": 448.1,
    "cy": 86.5
  },
  {
    "id": "feat_1786665148143_2",
    "bayNumber": "R-25",
    "type": "resident",
    "status": "available",
    "zone": "rear",
    "pathD": "M 458.4 81.1 L 476.6 77.7 L 478.1 86.1 L 459.9 89.5 L 458.4 81.1 Z",
    "cx": 466.3,
    "cy": 83.1
  },
  {
    "id": "feat_1786665148143_3",
    "bayNumber": "V-03",
    "type": "visitor",
    "status": "available",
    "zone": "rear",
    "pathD": "M 476.6 77.7 L 494.8 74.3 L 496.3 82.7 L 478.1 86.1 L 476.6 77.7 Z",
    "cx": 484.5,
    "cy": 79.7
  },
  {
    "id": "feat_1786665311943_0",
    "bayNumber": "R-32",
    "type": "resident",
    "status": "available",
    "zone": "rear",
    "pathD": "M 420.2 90.9 L 411.7 91.3 L 410.8 72.7 L 419.3 72.3 L 420.2 90.9 Z",
    "cx": 416.4,
    "cy": 83.6
  },
  {
    "id": "feat_1786665311943_1",
    "bayNumber": "R-31",
    "type": "resident",
    "status": "available",
    "zone": "rear",
    "pathD": "M 411.7 91.3 L 403.2 91.8 L 402.3 73.2 L 410.8 72.7 L 411.7 91.3 Z",
    "cx": 407.9,
    "cy": 84.1
  },
  {
    "id": "feat_1786665311943_2",
    "bayNumber": "R-31",
    "type": "resident",
    "status": "available",
    "zone": "rear",
    "pathD": "M 403.2 91.8 L 394.7 92.2 L 393.8 73.6 L 402.3 73.2 L 403.2 91.8 Z",
    "cx": 399.4,
    "cy": 84.5
  },
  {
    "id": "feat_1786665311943_3",
    "bayNumber": "R-19",
    "type": "resident",
    "status": "available",
    "zone": "rear",
    "pathD": "M 394.7 92.2 L 386.2 92.6 L 385.3 74 L 393.8 73.6 L 394.7 92.2 Z",
    "cx": 390.9,
    "cy": 84.9
  },
  {
    "id": "feat_1786665311943_4",
    "bayNumber": "R-33",
    "type": "resident",
    "status": "available",
    "zone": "rear",
    "pathD": "M 386.2 92.6 L 377.7 93.1 L 376.8 74.4 L 385.3 74 L 386.2 92.6 Z",
    "cx": 382.4,
    "cy": 85.3
  },
  {
    "id": "feat_1786665452567_0",
    "bayNumber": "R-20",
    "type": "resident",
    "status": "available",
    "zone": "rear",
    "pathD": "M 368.5 113.2 L 350 112.1 L 350.5 103.6 L 369 104.6 L 368.5 113.2 Z",
    "cx": 361.3,
    "cy": 109.3
  },
  {
    "id": "feat_1786665452568_1",
    "bayNumber": "R-21",
    "type": "resident",
    "status": "available",
    "zone": "rear",
    "pathD": "M 350 112.1 L 331.5 111 L 332 102.5 L 350.5 103.6 L 350 112.1 Z",
    "cx": 342.8,
    "cy": 108.3
  },
  {
    "id": "feat_1786665452568_2",
    "bayNumber": "R-22",
    "type": "resident",
    "status": "available",
    "zone": "rear",
    "pathD": "M 331.5 111 L 313.1 110 L 313.6 101.4 L 332 102.5 L 331.5 111 Z",
    "cx": 324.3,
    "cy": 107.2
  },
  {
    "id": "feat_1786665452568_3",
    "bayNumber": "R-23",
    "type": "resident",
    "status": "available",
    "zone": "rear",
    "pathD": "M 313.1 110 L 294.6 108.9 L 295.1 100.3 L 313.6 101.4 L 313.1 110 Z",
    "cx": 305.9,
    "cy": 106.1
  },
  {
    "id": "feat_1786666167743_0",
    "bayNumber": "V-01",
    "type": "visitor",
    "status": "available",
    "zone": "rear",
    "pathD": "M 146 149.7 L 164.3 147.1 L 165.5 155.5 L 147.2 158.2 L 146 149.7 Z",
    "cx": 153.8,
    "cy": 152
  },
  {
    "id": "feat_1786666167743_1",
    "bayNumber": "V-02",
    "type": "visitor",
    "status": "available",
    "zone": "rear",
    "pathD": "M 164.3 147.1 L 182.6 144.4 L 183.8 152.9 L 165.5 155.5 L 164.3 147.1 Z",
    "cx": 172.1,
    "cy": 149.4
  },
  {
    "id": "feat_1786666245519_0",
    "bayNumber": "R-27",
    "type": "resident",
    "status": "available",
    "zone": "rear",
    "pathD": "M 82.7 154.1 L 82.4 162.7 L 63.9 162 L 64.2 153.5 L 82.7 154.1 Z",
    "cx": 75.2,
    "cy": 157.3
  },
  {
    "id": "feat_1786666346183_0",
    "bayNumber": "R-30",
    "type": "resident",
    "status": "available",
    "zone": "rear",
    "pathD": "M 90.3 58.4 L 98.8 58.4 L 98.8 77 L 90.3 77 L 90.3 58.4 Z",
    "cx": 93.7,
    "cy": 65.8
  },
  {
    "id": "feat_1786666346184_1",
    "bayNumber": "R-26",
    "type": "resident",
    "status": "available",
    "zone": "rear",
    "pathD": "M 98.8 58.4 L 107.3 58.4 L 107.3 77 L 98.8 77 L 98.8 58.4 Z",
    "cx": 102.2,
    "cy": 65.8
  },
  {
    "id": "feat_1786666439905_clone_1",
    "bayNumber": "R-01",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 879.8 169.3 L 871.3 168.7 L 872.5 150.1 L 914 150.7 L 879.8 169.3 Z",
    "cx": 883.5,
    "cy": 161.6
  },
  {
    "id": "feat_1786666466016_clone_1",
    "bayNumber": "R-04",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 799.8 165.7 L 791.3 165.2 L 792.5 146.6 L 801 147.1 L 799.8 165.7 Z",
    "cx": 796.9,
    "cy": 158.1
  },
  {
    "id": "feat_1786666521856_clone_1",
    "bayNumber": "R-07",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 737.4 163.1 L 728.9 162.5 L 730.1 143.9 L 738.6 144.5 L 737.4 163.1 Z",
    "cx": 734.5,
    "cy": 155.4
  },
  {
    "id": "feat_1786666521856_clone_2",
    "bayNumber": "R-07",
    "type": "resident",
    "status": "available",
    "zone": "front",
    "pathD": "M 728.9 162.5 L 720.4 161.9 L 721.6 143.3 L 730.1 143.9 L 728.9 162.5 Z",
    "cx": 726,
    "cy": 154.8
  }
];

const ZONE_VIEWBOXES: Record<ZoneType, string> = {
  front: '540 10 450 335',
  rear: '20 15 540 240',
  all: '0 0 1000 350',
};

const STATUS_CONFIGS = {
  available: {
    fill: '#22c55e',
    fillOpacity: 0.35,
    stroke: '#22c55e',
    strokeWidth: 1.8,
    label: 'Available',
  },
  occupied: {
    fill: '#64748b',
    fillOpacity: 0.20,
    stroke: '#475569',
    strokeWidth: 1.5,
    label: 'Occupied',
  },
  reserved: {
    fill: '#f59e0b',
    fillOpacity: 0.35,
    stroke: '#f59e0b',
    strokeWidth: 1.8,
    label: 'Reserved',
  },
  selected: {
    fill: '#0066ff',
    fillOpacity: 0.65,
    stroke: '#38bdf8',
    strokeWidth: 2.8,
    label: 'Selected',
  },
};

export const SpatialFloorplan: React.FC<SpatialFloorplanProps> = ({
  bays,
  selectedBayId,
  onSelectBay,
}) => {
  const [activeZone, setActiveZone] = useState<ZoneType>('front');

  const activeViewBox = ZONE_VIEWBOXES[activeZone];

  const frontCount = useMemo(() => bays.filter((b) => b.zone === 'front').length, [bays]);
  const rearCount = useMemo(() => bays.filter((b) => b.zone === 'rear').length, [bays]);

  return (
    <div className="relative w-full max-w-lg mx-auto bg-slate-950 rounded-3xl border border-slate-800/90 overflow-hidden shadow-2xl select-none flex flex-col">
      {/* Zone Switcher Header */}
      <div className="p-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10 relative">
        <div>
          <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
            Millennium Village Map
          </h2>
          <p className="text-xs font-bold text-slate-200">548 Albany Highway</p>
        </div>

        {/* Segmented Pill Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveZone('front')}
            className={`relative px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeZone === 'front' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-pressed={activeZone === 'front'}
          >
            {activeZone === 'front' && (
              <motion.div
                layoutId="activeZonePill"
                className="absolute inset-0 bg-blue-600 rounded-xl shadow-md"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10">Front (${frontCount})</span>
          </button>

          <button
            onClick={() => setActiveZone('rear')}
            className={`relative px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeZone === 'rear' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-pressed={activeZone === 'rear'}
          >
            {activeZone === 'rear' && (
              <motion.div
                layoutId="activeZonePill"
                className="absolute inset-0 bg-blue-600 rounded-xl shadow-md"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10">Rear (${rearCount})</span>
          </button>

          <button
            onClick={() => setActiveZone('all')}
            className={`relative px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeZone === 'all' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-pressed={activeZone === 'all'}
          >
            {activeZone === 'all' && (
              <motion.div
                layoutId="activeZonePill"
                className="absolute inset-0 bg-blue-600 rounded-xl shadow-md"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative z-10">Full</span>
          </button>
        </div>
      </div>

      {/* Main Real-World Architectural Vector Viewport */}
      <div className="relative w-full aspect-[16/11] bg-slate-950 touch-pan-y overflow-hidden">
        <motion.svg
          className="w-full h-full"
          animate={{ viewBox: activeViewBox }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grassPattern" width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="12" height="12" fill="#14331e" />
              <path d="M 0 6 L 6 0 L 12 6 L 6 12 Z" fill="#173c24" opacity="0.4" />
            </pattern>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grounds */}
          <rect width="100%" height="100%" fill="#090d16" />

          {/* Albany Highway on Far Right */}
          <g id="albany-highway">
            <rect x="975" y="0" width="25" height="350" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <rect x="968" y="0" width="7" height="350" fill="#047857" opacity="0.6" />
            <line x1="988" y1="0" x2="988" y2="350" stroke="#f8fafc" strokeWidth="1" strokeDasharray="6,6" opacity="0.4" />
            <text x="984" y="180" fill="#94a3b8" fontSize="7" fontWeight="800" fontFamily="sans-serif" transform="rotate(90, 984, 180)" textAnchor="middle" letterSpacing="1.5">
              ALBANY HIGHWAY
            </text>
          </g>

          {/* Sports Field on South */}
          <g id="sports-field">
            <rect x="110" y="145" width="465" height="195" rx="8" fill="url(#grassPattern)" stroke="#1e3a2b" strokeWidth="2" />
            <rect x="120" y="155" width="445" height="175" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.35" rx="4" />
            <line x1="342" y1="155" x2="342" y2="330" stroke="#ffffff" strokeWidth="0.8" opacity="0.35" />
            <circle cx="342" cy="242" r="25" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.35" />
            <text x="342" y="245" fill="#ffffff" fontSize="8" fontWeight="700" opacity="0.4" textAnchor="middle" fontFamily="sans-serif">
              SPORTS FIELD
            </text>
          </g>

          {/* Driveway Asphalt Network */}
          <g id="driveway-asphalt">
            <path
              d="M 968,95 L 900,95 L 900,50 L 610,50 L 610,130 L 690,130 L 690,240 L 730,240 L 730,130 L 830,130 L 830,260 L 910,260 L 910,170 L 968,170 Z"
              fill="#0f172a"
              stroke="#1e293b"
              strokeWidth="1"
            />
            <path
              d="M 610,65 L 300,65 L 300,95 L 120,95 L 120,135 L 30,135 L 30,50 L 300,50 L 610,50 Z"
              fill="#0f172a"
              stroke="#1e293b"
              strokeWidth="1"
            />
            <path
              d="M 130,95 L 300,95 L 300,140 L 130,140 Z"
              fill="#0f172a"
              stroke="#1e293b"
              strokeWidth="1"
            />
          </g>

          {/* Realistic Townhouse Buildings */}
          <g id="building-blocks">
            {/* Top Front Townhouse Block */}
            <rect x="610" y="52" width="315" height="55" rx="4" fill="#2d241e" stroke="#4a3c31" strokeWidth="1.5" />
            <line x1="610" y1="79" x2="925" y2="79" stroke="#1c1713" strokeWidth="1" opacity="0.7" />
            <text x="767" y="82" fill="#d7c4b7" fontSize="7.5" fontWeight="800" opacity="0.6" textAnchor="middle" fontFamily="sans-serif">
              TOWNHOUSES (FRONT WING)
            </text>

            {/* Front Middle Townhouse Block 1 */}
            <rect x="625" y="135" width="68" height="75" rx="4" fill="#2d241e" stroke="#4a3c31" strokeWidth="1.5" />
            <line x1="659" y1="135" x2="659" y2="210" stroke="#1c1713" strokeWidth="1" opacity="0.7" />

            {/* Front Middle Townhouse Block 2 */}
            <rect x="730" y="145" width="68" height="80" rx="4" fill="#2d241e" stroke="#4a3c31" strokeWidth="1.5" />
            <line x1="764" y1="145" x2="764" y2="225" stroke="#1c1713" strokeWidth="1" opacity="0.7" />

            {/* Commercial Building */}
            <rect x="835" y="175" width="130" height="145" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            <rect x="845" y="185" width="50" height="125" fill="#f8fafc" opacity="0.85" rx="2" />
            <text x="920" y="245" fill="#64748b" fontSize="7" fontWeight="800" opacity="0.8" textAnchor="middle" fontFamily="sans-serif">
              COMMERCIAL
            </text>

            {/* Rear Top Townhouse Block */}
            <rect x="130" y="42" width="170" height="52" rx="4" fill="#2d241e" stroke="#4a3c31" strokeWidth="1.5" />
            <line x1="130" y1="68" x2="300" y2="68" stroke="#1c1713" strokeWidth="1" opacity="0.7" />
            <text x="215" y="71" fill="#d7c4b7" fontSize="7.5" fontWeight="800" opacity="0.6" textAnchor="middle" fontFamily="sans-serif">
              TOWNHOUSES (REAR WING)
            </text>

            {/* Rear West Wing Townhouse Block */}
            <rect x="35" y="42" width="50" height="115" rx="4" fill="#2d241e" stroke="#4a3c31" strokeWidth="1.5" />
            <line x1="60" y1="42" x2="60" y2="157" stroke="#1c1713" strokeWidth="1" opacity="0.7" />
          </g>

          {/* Tree/Hedge Green Belts */}
          <g id="tree-lines">
            <path d="M 0,20 L 1000,20" stroke="#064e3b" strokeWidth="8" strokeDasharray="12,4" opacity="0.4" />
            <path d="M 100,135 L 575,135" stroke="#064e3b" strokeWidth="6" strokeDasharray="8,3" opacity="0.35" />
          </g>

          {/* Mathematically Projected Parking Bays */}
          <g id="parking-bays">
            {bays.map((bay) => {
              const isSelected = selectedBayId === bay.id;
              const statusKey = isSelected ? 'selected' : bay.status;
              const config = STATUS_CONFIGS[statusKey];

              return (
                <g
                  key={bay.id}
                  onClick={() => onSelectBay(bay)}
                  className="cursor-pointer group"
                  role="button"
                  tabIndex={0}
                  aria-label={`Bay ${bay.bayNumber}, ${bay.type} space, ${config.label}`}
                  aria-pressed={isSelected}
                >
                  {/* Expanded invisible hit-box for easy mobile tapping */}
                  <path
                    d={bay.pathD}
                    fill="transparent"
                    stroke="transparent"
                    strokeWidth="10"
                  />

                  {/* Real Geometric Vector Polygon */}
                  <motion.path
                    d={bay.pathD}
                    fill={config.fill}
                    fillOpacity={config.fillOpacity}
                    stroke={config.stroke}
                    strokeWidth={config.strokeWidth}
                    filter={isSelected ? 'url(#glow)' : undefined}
                    animate={{
                      fillOpacity: isSelected ? 0.7 : config.fillOpacity,
                      strokeWidth: isSelected ? 2.8 : config.strokeWidth,
                    }}
                    transition={{ duration: 0.15 }}
                  />

                  {/* Bay Number Text Label */}
                  <text
                    x={bay.cx}
                    y={bay.cy + 2.5}
                    fill={isSelected ? '#ffffff' : '#f8fafc'}
                    fontSize="5.5"
                    fontWeight="800"
                    fontFamily="monospace"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {bay.bayNumber}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Entrance Pointer Arrow from Albany Hwy */}
          <g id="entrance-marker">
            <path d="M 960,105 L 945,105 M 950,101 L 945,105 L 950,109" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="955" y="98" fill="#38bdf8" fontSize="5.5" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">
              IN
            </text>
          </g>
        </motion.svg>
      </div>

      {/* Footer Legend */}
      <div className="p-2.5 bg-slate-900/95 border-t border-slate-800 grid grid-cols-4 gap-1 text-center text-[10px] font-bold text-slate-400">
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 border border-emerald-400" />
          <span>Available</span>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-500 border border-slate-400" />
          <span>Occupied</span>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 border border-amber-400" />
          <span>Reserved</span>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 border border-sky-400" />
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};
