export function Footer(){
    return (
        <footer className="w-full border-t bg-background/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} KORA All rights reserved.
            </div>
        </footer>
    );
}