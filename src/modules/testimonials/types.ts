export interface TestimonialDto {
  id: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  user: {
    id: string;
    name: string;
  };
}

export interface CreateTestimonialInput {
  description: string;
  rating: number;
}