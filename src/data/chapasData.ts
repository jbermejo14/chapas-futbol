export type TeamId = 
  | 'argentina' | 'brazil' | 'chile' | 'colombia'
  | 'denmark' | 'england' | 'france' | 'germany'
  | 'italy' | 'japan' | 'netherlands' | 'norway'
  | 'peru' | 'portugal' | 'scotland' | 'spain'
  | 'sweden' | 'uruguay' | 'us';

export type FieldId = 'stadium-green' | 'stadium-blue' | 'stadium-classic' | 'generic' | 'estadio-espana' | 'estadio-tokyo' | 'estadio-rio' | 'estadio-usa' | 'estadio-amsterdam';

export interface TeamData {
  id: TeamId;
  name: string;
  colorPrimary: string;
  colorSecondary: string;
  unlockRequirementWins: number; // 0 means default unlocked
  image?: any; // e.g. require('../../assets/chapas/spain.png')
  svg?: React.FC<any>; // SVG Component
}

export interface FieldData {
  id: FieldId;
  name: string;
  color: string;
  stripeColor: string;
  image?: any;
  imageRotation?: number;
  imageResizeMode?: 'cover' | 'contain' | 'stretch';
  wallInsets?: { top: number; bottom: number; left: number; right: number };
}

export type ArenaId = 'usa' | 'madrid' | 'rio' | 'amsterdam' | 'tokyo';

export interface ArenaData {
  id: ArenaId;
  name: string;
  fieldId: FieldId;
  unlockCost: number;
}

import SpainSvg from '../../assets/chapas/spain.svg';
import EnglandSvg from '../../assets/chapas/england.svg';
import ArgentinaSvg from '../../assets/chapas/argentina.svg';
import BrazilSvg from '../../assets/chapas/brasil.svg';
import ChileSvg from '../../assets/chapas/chile.svg';
import ColombiaSvg from '../../assets/chapas/colombia.svg';
import DenmarkSvg from '../../assets/chapas/denmark.svg';
import FranceSvg from '../../assets/chapas/france.svg';
import GermanySvg from '../../assets/chapas/germany.svg';
import ItalySvg from '../../assets/chapas/italy.svg';
import JapanSvg from '../../assets/chapas/japan.svg';
import NetherlandsSvg from '../../assets/chapas/netherlands.svg';
import NorwaySvg from '../../assets/chapas/norway.svg';
import PeruSvg from '../../assets/chapas/peru.svg';
import PortugalSvg from '../../assets/chapas/portugal.svg';
import ScotlandSvg from '../../assets/chapas/scotland.svg';
import SwedenSvg from '../../assets/chapas/sweden.svg';
import UruguaySvg from '../../assets/chapas/uruguay.svg';
import UsaSvg from '../../assets/chapas/usa.svg';

export const TEAMS: Record<TeamId, TeamData> = {
  'argentina': { id: 'argentina', name: 'Argentina', colorPrimary: '#74ACDF', colorSecondary: '#FFFFFF', unlockRequirementWins: 0, svg: ArgentinaSvg },
  'brazil': { id: 'brazil', name: 'Brazil', colorPrimary: '#009C3B', colorSecondary: '#FFDF00', unlockRequirementWins: 0, svg: BrazilSvg },
  'chile': { id: 'chile', name: 'Chile', colorPrimary: '#D52B1E', colorSecondary: '#0039A6', unlockRequirementWins: 0, svg: ChileSvg },
  'colombia': { id: 'colombia', name: 'Colombia', colorPrimary: '#FCD116', colorSecondary: '#003893', unlockRequirementWins: 0, svg: ColombiaSvg },
  'denmark': { id: 'denmark', name: 'Denmark', colorPrimary: '#C60C30', colorSecondary: '#FFFFFF', unlockRequirementWins: 0, svg: DenmarkSvg },
  'england': { id: 'england', name: 'England', colorPrimary: '#FFFFFF', colorSecondary: '#CE1124', unlockRequirementWins: 0, svg: EnglandSvg },
  'france': { id: 'france', name: 'France', colorPrimary: '#002395', colorSecondary: '#ED2939', unlockRequirementWins: 0, svg: FranceSvg },
  'germany': { id: 'germany', name: 'Germany', colorPrimary: '#000000', colorSecondary: '#FFCE00', unlockRequirementWins: 0, svg: GermanySvg },
  'italy': { id: 'italy', name: 'Italy', colorPrimary: '#0066B2', colorSecondary: '#FFFFFF', unlockRequirementWins: 0, svg: ItalySvg },
  'japan': { id: 'japan', name: 'Japan', colorPrimary: '#BC002D', colorSecondary: '#FFFFFF', unlockRequirementWins: 0, svg: JapanSvg },
  'netherlands': { id: 'netherlands', name: 'Netherlands', colorPrimary: '#FF4F00', colorSecondary: '#21468B', unlockRequirementWins: 0, svg: NetherlandsSvg },
  'norway': { id: 'norway', name: 'Norway', colorPrimary: '#BA0C2F', colorSecondary: '#00205B', unlockRequirementWins: 0, svg: NorwaySvg },
  'peru': { id: 'peru', name: 'Peru', colorPrimary: '#D91023', colorSecondary: '#FFFFFF', unlockRequirementWins: 0, svg: PeruSvg },
  'portugal': { id: 'portugal', name: 'Portugal', colorPrimary: '#FF0000', colorSecondary: '#006600', unlockRequirementWins: 0, svg: PortugalSvg },
  'scotland': { id: 'scotland', name: 'Scotland', colorPrimary: '#0065BD', colorSecondary: '#FFFFFF', unlockRequirementWins: 0, svg: ScotlandSvg },
  'spain': { id: 'spain', name: 'Spain', colorPrimary: '#C60B1E', colorSecondary: '#FFC400', unlockRequirementWins: 0, svg: SpainSvg },
  'sweden': { id: 'sweden', name: 'Sweden', colorPrimary: '#006AA7', colorSecondary: '#FECC00', unlockRequirementWins: 0, svg: SwedenSvg },
  'uruguay': { id: 'uruguay', name: 'Uruguay', colorPrimary: '#7BCCDE', colorSecondary: '#FFFFFF', unlockRequirementWins: 0, svg: UruguaySvg },
  'us': { id: 'us', name: 'USA', colorPrimary: '#B31942', colorSecondary: '#0A3161', unlockRequirementWins: 0, svg: UsaSvg },
};

export const FIELDS: Record<FieldId, FieldData> = {
  'stadium-green': { id: 'stadium-green', name: 'Estadio Verde', color: '#115C29', stripeColor: '#0E4F22' },
  'stadium-blue': { id: 'stadium-blue', name: 'Estadio Neón', color: '#0F1A24', stripeColor: '#0A121A' },
  'stadium-classic': { id: 'stadium-classic', name: 'Clásico', color: '#228B22', stripeColor: '#006400' },
  'generic': { 
    id: 'generic', 
    name: 'Campo Genérico', 
    color: '#1E8449', 
    stripeColor: '#196F3D', 
    image: require('../../assets/fields/generic.png'),
    imageRotation: 90, // Como la imagen es horizontal (2730x1536), la rotamos para el móvil
    imageResizeMode: 'stretch', // Para que encaje perfectamente en la pantalla sin recortar los bordes
    wallInsets: { top: 25, bottom: 25, left: 15, right: 15 } // Ajusta estos píxeles según el grosor de la pared visual en tu imagen
  },
  'estadio-espana': { 
    id: 'estadio-espana', 
    name: 'Estadio España', 
    color: '#C60B1E', 
    stripeColor: '#A60918',
    image: require('../../assets/fields/spain.png'),
    imageRotation: 90,
    imageResizeMode: 'stretch',
    wallInsets: { top: 25, bottom: 25, left: 15, right: 15 }
  },
  'estadio-tokyo': { 
    id: 'estadio-tokyo', 
    name: 'Estadio Tokyo', 
    color: '#0F1A24', 
    stripeColor: '#0A121A',
    image: require('../../assets/fields/japan.png'),
    imageRotation: 90,
    imageResizeMode: 'stretch',
    wallInsets: { top: 25, bottom: 25, left: 15, right: 15 }
  },
  'estadio-rio': { id: 'estadio-rio', name: 'Estadio Rio', color: '#115C29', stripeColor: '#0E4F22' },
  'estadio-usa': { 
    id: 'estadio-usa', 
    name: 'Estadio USA', 
    color: '#0A3161', 
    stripeColor: '#08254A',
    image: require('../../assets/fields/usa.png'),
    imageRotation: 90,
    imageResizeMode: 'stretch',
    wallInsets: { top: 25, bottom: 25, left: 15, right: 15 }
  },
  'estadio-amsterdam': { 
    id: 'estadio-amsterdam', 
    name: 'Estadio Amsterdam', 
    color: '#FF4F00', 
    stripeColor: '#CC3F00',
    image: require('../../assets/fields/amsterdam.png'),
    imageRotation: 90,
    imageResizeMode: 'stretch',
    wallInsets: { top: 25, bottom: 25, left: 15, right: 15 }
  },
};

export const ARENAS: Record<ArenaId, ArenaData> = {
  'usa': { id: 'usa', name: 'USA', fieldId: 'estadio-usa', unlockCost: 50 },
  'madrid': { id: 'madrid', name: 'MADRID', fieldId: 'estadio-espana', unlockCost: 100 },
  'rio': { id: 'rio', name: 'RIO', fieldId: 'estadio-rio', unlockCost: 200 },
  'amsterdam': { id: 'amsterdam', name: 'AMSTERDAM', fieldId: 'estadio-amsterdam', unlockCost: 400 },
  'tokyo': { id: 'tokyo', name: 'TOKYO', fieldId: 'estadio-tokyo', unlockCost: 600 }
};

export type FormationId = '1-3-1' | '1-2-1-1' | '1-2-2' | '1-4';

export interface FormationPoint {
  xMultiplier: number;
  yMultiplier: number; 
  number: number;
}

export const FORMATIONS: Record<FormationId, { name: string; points: FormationPoint[] }> = {
  '1-3-1': {
    name: '1-3-1',
    points: [
      { xMultiplier: 0.5, yMultiplier: 0.9, number: 1 },
      { xMultiplier: 0.2, yMultiplier: 0.6, number: 3 },
      { xMultiplier: 0.5, yMultiplier: 0.6, number: 5 },
      { xMultiplier: 0.8, yMultiplier: 0.6, number: 8 },
      { xMultiplier: 0.5, yMultiplier: 0.2, number: 10 },
    ]
  },
  '1-2-1-1': {
    name: '1-2-1-1',
    points: [
      { xMultiplier: 0.5, yMultiplier: 0.9, number: 1 },
      { xMultiplier: 0.3, yMultiplier: 0.7, number: 4 },
      { xMultiplier: 0.7, yMultiplier: 0.7, number: 2 },
      { xMultiplier: 0.5, yMultiplier: 0.4, number: 8 },
      { xMultiplier: 0.5, yMultiplier: 0.1, number: 9 },
    ]
  },
  '1-2-2': {
    name: '1-2-2',
    points: [
      { xMultiplier: 0.5, yMultiplier: 0.9, number: 1 },
      { xMultiplier: 0.3, yMultiplier: 0.6, number: 3 },
      { xMultiplier: 0.7, yMultiplier: 0.6, number: 2 },
      { xMultiplier: 0.3, yMultiplier: 0.2, number: 11 },
      { xMultiplier: 0.7, yMultiplier: 0.2, number: 7 },
    ]
  },
  '1-4': {
    name: '1-4',
    points: [
      { xMultiplier: 0.5, yMultiplier: 0.9, number: 1 },
      { xMultiplier: 0.2, yMultiplier: 0.4, number: 11 },
      { xMultiplier: 0.4, yMultiplier: 0.4, number: 8 },
      { xMultiplier: 0.6, yMultiplier: 0.4, number: 10 },
      { xMultiplier: 0.8, yMultiplier: 0.4, number: 7 },
    ]
  }
};
