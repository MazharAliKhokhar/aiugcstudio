export default function AboutUs() {
  return (
    <div className="max-w-3xl mx-auto py-24 px-6 space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">About Us</h1>
      
      <div className="prose prose-invert prose-emerald max-w-none text-muted-foreground">
        <p className="text-xl">
          ViralUGC was founded with a single mission: to democratize high-converting video advertising for brands of all sizes.
        </p>
        
        <h2 className="text-foreground mt-8">The Problem</h2>
        <p>
          Traditional UGC (User Generated Content) involves managing creators, scripts, shipments, lighting, and heavy editing. It's slow, expensive, and unpredictable.
        </p>

        <h2 className="text-foreground mt-8">Our Solution</h2>
        <p>
          By leveraging the bleeding edge of Generative AI video models (like Wan 2.1), we've built a pipeline that goes from a simple product URL to a broadcast-ready video ad in minutes. No actors. No shipping. Just raw conversion power.
        </p>
      </div>
    </div>
  )
}
