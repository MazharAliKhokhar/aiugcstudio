export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070708] relative overflow-hidden">
      {/* Background with Hero Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-bg.png" 
          className="w-full h-full object-cover opacity-20" 
          alt="Background" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070708] via-black/40 to-[#070708]" />
      </div>

      {/* Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full opacity-30 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[100px] rounded-full opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  )
}
