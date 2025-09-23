declare module 'react-qr-scanner' {
  import { Component } from 'react';

  interface QrScannerProps {
    delay?: number;
    onError?: (error: Error) => void;
    onScan?: (result: { text: string } | null) => void;
    style?: React.CSSProperties;
    className?: string;
    constraints?: {
      video: {
        facingMode?: 'user' | 'environment';
        width?: number;
        height?: number;
      };
    };
  }

  export default class QrScanner extends Component<QrScannerProps> {}
} 