import * as testimonialsRepository from './repository';

export async function listTestimonials(){
  return testimonialsRepository.getTestimonials();
}