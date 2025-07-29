export default function Loading(){
    return(
        <div className="flex min-h-screen items-center justify-center">
      <div className="sm:w-4 md:w-6 lg:w-8 sm:h-4 md:h-6 lg:h-8 rounded-full bg-foreground relative">
        <div className="absolute w-full h-full bg-foreground rounded-full animate-ping"></div>
        <div className="absolute w-full h-full bg-foreground rounded-full animate-ping delay-200"></div>
      </div>
    </div>
    )
}