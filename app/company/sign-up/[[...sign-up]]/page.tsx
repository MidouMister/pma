import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">PMA</h1>
        <p className="mt-2 text-slate-400">Gestion de Projets & Production</p>
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white/95 backdrop-blur shadow-2xl border border-white/20",
          },
        }}
        signInUrl="/company/sign-in"
      />
    </div>
  )
}
