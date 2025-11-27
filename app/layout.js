import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
    variable: "--font-noto-sans-jp",
    subsets: ["latin"],
    weight: ["300", "400", "500", "700"],
});

export const metadata = {
    title: "Next.js学習テンプレート",
    description: "Next.js学習用のテンプレートサイト",
};

export default function RootLayout({ children }) {
    return (
        <html lang="ja">
            <body className={`${notoSansJP.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
