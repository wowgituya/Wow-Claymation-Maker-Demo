export interface GeneratedImage {
  url: string;
  blob?: Blob;
}

export interface ProcessingState {
  isLoading: boolean;
  statusMessage: string;
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  EDIT = 'EDIT',
  RESULT = 'RESULT',
}

export type Language = 'en' | 'id';
