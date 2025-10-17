import type { Metadata } from "next";

export function buildDefaultMetadata({
  title,
  description
}: {
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "San Remo",
      type: "website",
      images: [
        {
          url: "/branding/san-remo-logo.png",
          width: 600,
          height: 600,
          alt: "San Remo"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}
