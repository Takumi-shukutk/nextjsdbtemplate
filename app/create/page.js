import Link from "next/link";
import QuizForm from "@/components/QuizForm";

export default function CreatePage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* ヘッダー */}
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <Link
                                href="/"
                                className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                            >
                                クイズアプリ
                            </Link>
                        </div>
                        <nav className="hidden md:flex space-x-8">
                            <Link
                                href="/"
                                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                            >
                                ホーム
                            </Link>
                            <Link
                                href="/create"
                                className="text-blue-600 dark:text-blue-400 font-medium"
                            >
                                クイズを追加
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        新規クイズ登録
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        新しいクイズを作成して、学習コンテンツを追加しましょう。
                    </p>
                </div>

                <QuizForm />
            </main>
        </div>
    );
}
