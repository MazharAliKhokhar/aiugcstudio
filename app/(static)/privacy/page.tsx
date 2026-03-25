export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-24 px-6 space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="prose prose-invert prose-emerald max-w-none">
        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as your email address, name, and billing information when you register for an account or make a purchase.</p>
        
        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to operate, maintain, and provide the features of our video generation service. We do not sell your personal data to third parties.</p>

        <h2>3. Data Security</h2>
        <p>We use reasonable organizational and technical security measures to protect your data. Your videos and payment details are handled by robust encrypted third parties (Supabase, PayPal, and fal.ai).</p>

        <h2>4. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@viralugc.com.</p>
      </div>
    </div>
  )
}
