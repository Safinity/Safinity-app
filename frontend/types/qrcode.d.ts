declare module 'qrcode' {
  type SvgRenderOptions = {
    type: 'svg';
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  };

  const QRCode: {
    toString(text: string, options: SvgRenderOptions): Promise<string>;
  };

  export default QRCode;
}
