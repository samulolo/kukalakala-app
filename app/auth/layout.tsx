
export default function AuthLayout({children} : Readonly<{children : React.ReactNode}>){

    return(
        <main className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-between px-4 py-10">
            <header className="w-full max-w-md text-center">
                <h1 className="tracking-wider uppercase font-semibold">
                    Kukalakala
                </h1>
                <p className="text-xs text-slate-500 mt-2 tracking-widest">Contrate ou seja contratado</p>
            </header>
            {children}
            <footer className="text-center flex gap-2 text-xs text-slate-500">
                <button className="hover:text-slate-700 transition">Privacidade</button>
                <button>Termos de serviço</button>
            </footer>
        </main>
    )
}