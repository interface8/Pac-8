export interface TestimonialDto {
  id: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  rating: number;

  user: {
    id: string;
    name: string;
  };
}

export interface CreateTestimonialInput {
  description: string;
  rating: number;
}