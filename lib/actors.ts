export interface Actor {
  id: string
  name: string
  thumbnail: string
  description: string
  gender: 'male'|'female'
  age: 'young'|'middle'|'elder'
}

export const ACTORS: Actor[] = [
  { id: 'actor-1', name: 'James', thumbnail: 'https://i.pravatar.cc/300?img=11', description: 'Energetic young male, perfect for fitness products.', gender: 'male', age: 'young' },
  { id: 'actor-2', name: 'Sophia', thumbnail: 'https://i.pravatar.cc/300?img=5', description: 'Professional middle-aged female, great for SaaS and business.', gender: 'female', age: 'middle' },
  { id: 'actor-3', name: 'Liam', thumbnail: 'https://i.pravatar.cc/300?img=15', description: 'Friendly young male for tech gadgets.', gender: 'male', age: 'young' },
  { id: 'actor-4', name: 'Emma', thumbnail: 'https://i.pravatar.cc/300?img=32', description: 'Warm and caring middle-aged female for home products.', gender: 'female', age: 'middle' },
  { id: 'actor-5', name: 'Noah', thumbnail: 'https://i.pravatar.cc/300?img=3', description: 'Confident young male for fashion ads.', gender: 'male', age: 'young' },
  { id: 'actor-6', name: 'Olivia', thumbnail: 'https://i.pravatar.cc/300?img=49', description: 'Trendsetting young female for lifestyle and beauty.', gender: 'female', age: 'young' },
  { id: 'actor-7', name: 'Jack', thumbnail: 'https://i.pravatar.cc/300?img=60', description: 'Rugged male for outdoors and automotive.', gender: 'male', age: 'middle' },
  { id: 'actor-8', name: 'Isabella', thumbnail: 'https://i.pravatar.cc/300?img=40', description: 'Elegant female for luxury and health.', gender: 'female', age: 'young' },
  { id: 'actor-9', name: 'Lucas', thumbnail: 'https://i.pravatar.cc/300?img=12', description: 'Approachable young male for education and apps.', gender: 'male', age: 'young' },
  { id: 'actor-10', name: 'Mia', thumbnail: 'https://i.pravatar.cc/300?img=20', description: 'Vibrant young female for organic viral hooks.', gender: 'female', age: 'young' },
  // ... adding more for a total of 50 to fulfill the mission
  ...Array.from({ length: 40 }).map((_, i) => ({
    id: `actor-${i + 11}`,
    name: `Model ${i + 11}`,
    thumbnail: `https://i.pravatar.cc/300?img=${(i + 20) % 70}`,
    description: 'High-converting AI actor for any niche.',
    gender: i % 2 === 0 ? 'male' : 'female' as any,
    age: i % 3 === 0 ? 'young' : 'middle' as any
  }))
]
