export default function NotificationNumber({ number }: { number: number }) {
    return (
        <div className="border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent text-secondary-foreground hover:bg-secondary/80 flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30">{number}</div>
    )
}