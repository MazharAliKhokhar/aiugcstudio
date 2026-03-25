export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto py-24 px-6 space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="prose prose-invert prose-emerald max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using ViralUGC, you agree to be bound by these Terms of Service.</p>
        
        <h2>2. Use of Service</h2>
        <p>You agree not to use the AI video generation capabilities for generating illicit, non-consensual graphic, or illegal content. You retain all licensing rights to the video ads you generate.</p>

        <h2>3. Credits and Refunds</h2>
        <p>As generation requires high GPU compute costs, video credits purchased are non-refundable once used. If a generation attempt fails due to server fault, your credits will be refunded automatically to your balance.</p>

        <h2>4. Limitation of Liability</h2>
        <p>ViralUGC is provided "as is". We shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service.</p>
      </div>
    </div>
  )
}
