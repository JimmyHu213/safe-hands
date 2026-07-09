import Image from "next/image";

export interface PageBannerProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function PageBanner({ src, alt, priority = false }: PageBannerProps) {
  return (
    <div className="relative mx-auto mt-10 aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-lg border md:aspect-[21/9]">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 896px) 100vw, 896px"
        className="object-cover"
      />
    </div>
  );
}
