import { Button } from "@/components/ui/button"

export default function ContactUs() {
  return (
    <div className="max-w-xl mx-auto py-24 px-6 space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
      <p className="text-muted-foreground text-lg">
        Have questions about Enterprise plans, API access, or just want to say hi? Drop us a line below.
      </p>

      <form className="space-y-4 mt-8">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input type="text" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="Your name" />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input type="email" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="you@company.com" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Message</label>
          <textarea className="w-full flex min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="How can we help?" />
        </div>

        <Button type="button" className="w-full">Send Message</Button>
      </form>
    </div>
  )
}
