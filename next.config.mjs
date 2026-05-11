/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Unsplash
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "plus.unsplash.com", pathname: "/**" },
      // Vercel Blob
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**" },
      // PostImages
      { protocol: "https", hostname: "postimages.org", pathname: "/**" },
      { protocol: "https", hostname: "i.postimg.cc", pathname: "/**" },
      // Stock photos
      { protocol: "https", hostname: "media.istockphoto.com", pathname: "/**" },
      // Imgur
      { protocol: "https", hostname: "i.imgur.com", pathname: "/**" },
      { protocol: "https", hostname: "imgur.com", pathname: "/**" },
      // Cloudinary
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      // Google
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "storage.googleapis.com", pathname: "/**" },
      // AWS S3
      { protocol: "https", hostname: "*.s3.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "*.s3.*.amazonaws.com", pathname: "/**" },
      // Pexels
      { protocol: "https", hostname: "images.pexels.com", pathname: "/**" },
      // Pixabay
      { protocol: "https", hostname: "pixabay.com", pathname: "/**" },
      // CDN / generic
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },
      { protocol: "https", hostname: "ucarecdn.com", pathname: "/**" },
      { protocol: "https", hostname: "imagekit.io", pathname: "/**" },
      { protocol: "https", hostname: "*.imagekit.io", pathname: "/**" },
    ],
  },
};

export default nextConfig;
