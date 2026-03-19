import * as testimonialsRepository from './repository';

export async function listTestimonials(){
  return testimonialsRepository.getTestimonials();
}

export async function getTestimonialStats() {
  const testimonials = await testimonialsRepository.getTestimonials();
  const totalTestimonials = testimonials.length;
  const averageRating =
    testimonials.reduce((sum, testimonial) => sum + (testimonial.rating ?? 0), 0) /
    totalTestimonials;

  return {
    totalTestimonials,
    averageRating,
  }}