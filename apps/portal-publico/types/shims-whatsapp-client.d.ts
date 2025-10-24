declare module '@/components/WhatsAppBannerClient' {
  import * as React from 'react';

  export type WhatsAppBannerProps = {
    phone?: string;
    message?: string;
    className?: string;
    label?: string;
    sublabel?: string;
  };

  const WhatsAppBanner: React.FC<WhatsAppBannerProps>;
  export default WhatsAppBanner;
}
