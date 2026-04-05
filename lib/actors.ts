export interface Actor {
  id: string
  name: string
  thumbnail: string
  description: string
  gender: 'male'|'female'
  age: 'young'|'middle'|'elder'
}

export const ACTORS: Actor[] = [
  { id: 'actor-1', name: 'James', thumbnail: '/avatars/actor-1.png', description: 'Energetic young male, perfect for fitness and lifestyle products.', gender: 'male', age: 'young' },
  { id: 'actor-2', name: 'Sophia', thumbnail: '/avatars/actor-2.png', description: 'Professional modern female, great for SaaS, beauty and business.', gender: 'female', age: 'young' },
  { id: 'actor-3', name: 'Liam', thumbnail: '/avatars/actor-3.png', description: 'Friendly tech-savvy male for gadgets and applications.', gender: 'male', age: 'young' },
  { id: 'actor-4', name: 'Emma', thumbnail: '/avatars/actor-4.png', description: 'Warm and trustworthy female for home and family products.', gender: 'female', age: 'middle' },
  { id: 'actor-5', name: 'Noah', thumbnail: '/avatars/actor-5.png', description: 'Confident and stylish male for premium fashion and luxury.', gender: 'male', age: 'young' },
  { id: 'actor-6', name: 'Olivia', thumbnail: '/avatars/actor-6.png', description: 'Trendsetting young female for lifestyle, makeup and beauty.', gender: 'female', age: 'young' },
  { id: 'actor-7', name: 'Jack', thumbnail: '/avatars/actor-7.png', description: 'Rugged and reliable male for outdoors, tools and automotive.', gender: 'male', age: 'middle' },
  { id: 'actor-8', name: 'Isabella', thumbnail: '/avatars/actor-8.png', description: 'Elegant and sophisticated female for luxury, health and jewelry.', gender: 'female', age: 'young' },
  { id: 'actor-9', name: 'Lucas', thumbnail: '/avatars/actor-9.png', description: 'Approachable and smart male for education, apps and finance.', gender: 'male', age: 'young' },
  { id: 'actor-10', name: 'Mia', thumbnail: '/avatars/actor-10.png', description: 'Vibrant and expressive female for organic, viral social hooks.', gender: 'female', age: 'young' },
]
