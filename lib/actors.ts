export interface Actor {
  id: string
  name: string
  thumbnail: string
  description: string
  gender: 'male'|'female'
  age: 'young'|'middle'|'elder'
}

export const ACTORS: Actor[] = [
  { id: 'actor-1', name: 'James', thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop', description: 'Energetic young male, perfect for fitness and lifestyle products.', gender: 'male', age: 'young' },
  { id: 'actor-2', name: 'Sophia', thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', description: 'Professional modern female, great for SaaS, beauty and business.', gender: 'female', age: 'young' },
  { id: 'actor-3', name: 'Liam', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', description: 'Friendly tech-savvy male for gadgets and applications.', gender: 'male', age: 'young' },
  { id: 'actor-4', name: 'Emma', thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop', description: 'Warm and trustworthy female for home and family products.', gender: 'female', age: 'middle' },
  { id: 'actor-5', name: 'Noah', thumbnail: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop', description: 'Confident and stylish male for premium fashion and luxury.', gender: 'male', age: 'young' },
  { id: 'actor-6', name: 'Olivia', thumbnail: 'https://images.unsplash.com/photo-1567532939604-b6c5b0ad2e01?w=400&h=400&fit=crop', description: 'Trendsetting young female for lifestyle, makeup and beauty.', gender: 'female', age: 'young' },
  { id: 'actor-7', name: 'Jack', thumbnail: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=400&fit=crop', description: 'Rugged and reliable male for outdoors, tools and automotive.', gender: 'male', age: 'middle' },
  { id: 'actor-8', name: 'Isabella', thumbnail: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=400&fit=crop', description: 'Elegant and sophisticated female for luxury, health and jewelry.', gender: 'female', age: 'young' },
  { id: 'actor-9', name: 'Lucas', thumbnail: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop', description: 'Approachable and smart male for education, apps and finance.', gender: 'male', age: 'young' },
  { id: 'actor-10', name: 'Mia', thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop', description: 'Vibrant and expressive female for organic, viral social hooks.', gender: 'female', age: 'young' },
]
