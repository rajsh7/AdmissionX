export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // For local uploads, use the image proxy
  if (src.startsWith('/uploads/')) {
    const params = new URLSearchParams({
      url: src,
      w: width.toString(),
      q: (quality || 75).toString(),
    });
    return `/api/image-proxy?${params}`;
  }

  // For external URLs that might have SSL issues, use the proxy
  if (src.includes('admin.admissionx.in') || src.includes('admissionx.info')) {
    const params = new URLSearchParams({
      url: src,
      w: width.toString(),
      q: (quality || 75).toString(),
    });
    return `/api/image-proxy?${params}`;
  }

  // For other external images, use default Next.js loader
  return `${src}?w=${width}&q=${quality || 75}`;
}